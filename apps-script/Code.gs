const CONFIG = Object.freeze({
  recipient: 'contato@bfxempresarial.com.br',
  spreadsheetIdProperty: 'BFX_SPREADSHEET_ID',
  turnstileSecretProperty: 'BFX_TURNSTILE_SECRET',
  allowedHostnamesProperty: 'BFX_TURNSTILE_HOSTNAMES',
  allowedHostnames: ['bfxempresarial.com.br', 'www.bfxempresarial.com.br', 'localhost', '127.0.0.1'],
  turnstileAction: 'quote',
  sheetName: 'Respostas ao formulário 1',
  minimumFillTimeMs: 1400,
  rateLimitSeconds: 60,
});

function getConfig() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty(CONFIG.spreadsheetIdProperty);
  const turnstileSecret = properties.getProperty(CONFIG.turnstileSecretProperty);
  const hostnames = (properties.getProperty(CONFIG.allowedHostnamesProperty) || CONFIG.allowedHostnames.join(','))
    .split(',')
    .map(hostname => hostname.trim().toLowerCase())
    .filter(Boolean);
  if (!spreadsheetId || !turnstileSecret) throw new Error('Serviço não configurado.');
  return { ...CONFIG, spreadsheetId, turnstileSecret, allowedHostnames: hostnames };
}

function autorizarServico() {
  const config = getConfig();
  SpreadsheetApp.openById(config.spreadsheetId).getSheetByName(config.sheetName).getName();
  MailApp.getRemainingDailyQuota();
  UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: config.turnstileSecret, response: 'authorization-check' },
    muteHttpExceptions: true,
  });
}

function doGet() {
  return jsonResponse({ success: true, service: 'BFX Empresarial' });
}

function doPost(e) {
  try {
    const config = getConfig();
    const data = getRequestData(e);
    validateSubmission(data);
    verifyTurnstile(data['cf-turnstile-response'], config);

    const key = Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        `${String(data.email).toLowerCase()}|${String(data.telefone).replace(/\D/g, '')}`
      )
    );
    const sheet = SpreadsheetApp.openById(config.spreadsheetId).getSheetByName(config.sheetName);
    if (!sheet) throw new Error(`A aba "${config.sheetName}" não foi encontrada.`);
    const cache = CacheService.getScriptCache();
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (cache.get(`quote:${key}`)) {
        throw new Error('Aguarde alguns segundos antes de enviar outra solicitação.');
      }
      sheet.appendRow([
        new Date(),
        toSheetText(data.nome),
        toSheetText(data.email),
        toSheetText(data.telefone),
        toSheetText(data.mensagem || ''),
      ]);
      cache.put(`quote:${key}`, '1', config.rateLimitSeconds);
    } finally {
      lock.releaseLock();
    }

    const subject = `Solicitação de orçamento — ${data.nome}`;
    const body = [
      `Nome: ${data.nome}`,
      `E-mail: ${data.email}`,
      `Telefone: ${data.telefone}`,
      '',
      'Mensagem:',
      data.mensagem || '(não informado)',
    ].join('\n');

    MailApp.sendEmail({
      to: config.recipient,
      replyTo: data.email,
      subject,
      body,
      name: 'BFX Empresarial',
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return jsonResponse({
      success: false,
      message: publicErrorMessage(error),
    });
  }
}

function verifyTurnstile(token, config) {
  const responseToken = String(token || '').trim();
  if (!responseToken || responseToken.length > 2048) {
    throw new Error('Confirme a verificação de segurança e tente novamente.');
  }
  const response = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'post',
    payload: { secret: config.turnstileSecret, response: responseToken },
    muteHttpExceptions: true,
  });
  let result;
  try {
    result = JSON.parse(response.getContentText());
  } catch (_) {
    throw new Error('A verificação de segurança falhou.');
  }
  if (response.getResponseCode() < 200 || response.getResponseCode() >= 300 || !result.success) {
    throw new Error('A verificação de segurança falhou.');
  }
  if (result.action && result.action !== config.turnstileAction) {
    throw new Error('A verificação de segurança falhou.');
  }
  if (result.hostname && !config.allowedHostnames.includes(String(result.hostname).toLowerCase())) {
    throw new Error('A verificação de segurança falhou.');
  }
}

function getRequestData(e) {
  const parameters = e && e.parameter ? e.parameter : {};
  if (e && e.postData && e.postData.type === 'application/json') {
    try {
      return { ...parameters, ...JSON.parse(e.postData.contents || '{}') };
    } catch (_) {
      throw new Error('Formato de solicitação inválido.');
    }
  }
  return parameters;
}

function validateSubmission(data) {
  const name = String(data.nome || '').trim();
  const email = String(data.email || '').trim();
  const phone = String(data.telefone || '').trim();
  const message = String(data.mensagem || '').trim();
  const honeypot = String(data.empresa || '').trim();
  const startedAt = Number(data.started_at || 0);
  data.nome = name;
  data.email = email.toLowerCase();
  data.telefone = phone;
  data.mensagem = message;

  if (honeypot) throw new Error('Solicitação bloqueada.');
  if (!startedAt || Date.now() - startedAt < CONFIG.minimumFillTimeMs) {
    throw new Error('Preencha o formulário com calma e tente novamente.');
  }
  if (name.length < 2 || name.length > 80 || /[\u0000-\u001F\u007F]/.test(name)) {
    throw new Error('Informe um nome válido.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    throw new Error('Informe um e-mail válido.');
  }
  if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone)) {
    throw new Error('Informe um telefone com DDD.');
  }
  if (message.length > 800) throw new Error('A mensagem excede o limite permitido.');
}

function toSheetText(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function publicErrorMessage(error) {
  const message = error instanceof Error ? error.message : '';
  if (/^(Aguarde|Preencha|Informe|A mensagem|Solicitação bloqueada|Confirme|A verificação)/.test(message)) {
    return message;
  }
  return 'Não foi possível enviar a solicitação. Tente novamente em instantes.';
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
