const CONFIG = Object.freeze({
  recipient: 'contato@bfxempresarial.com.br',
  spreadsheetId: '1G47KlQ6QXRdixp0Rm5Me7zDpkTQYT4mDUnzPd_Fae18',
  sheetName: 'Respostas ao formulário 1',
  minimumFillTimeMs: 1400,
  rateLimitSeconds: 60,
});

function autorizarServico() {
  SpreadsheetApp
    .openById(CONFIG.spreadsheetId)
    .getSheetByName(CONFIG.sheetName)
    .getName();
  MailApp.getRemainingDailyQuota();
}

function doGet() {
  return jsonResponse({ success: true, service: 'BFX Empresarial' });
}

function doPost(e) {
  try {
    const data = getRequestData(e);
    validateSubmission(data);

    const key = Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(
        Utilities.DigestAlgorithm.SHA_256,
        `${String(data.email).toLowerCase()}|${String(data.telefone).replace(/\D/g, '')}`
      )
    );
    const cache = CacheService.getScriptCache();
    if (cache.get(`quote:${key}`)) {
      throw new Error('Aguarde alguns segundos antes de enviar outra solicitação.');
    }
    cache.put(`quote:${key}`, '1', CONFIG.rateLimitSeconds);

    const sheet = SpreadsheetApp
      .openById(CONFIG.spreadsheetId)
      .getSheetByName(CONFIG.sheetName);
    if (!sheet) throw new Error(`A aba "${CONFIG.sheetName}" não foi encontrada.`);
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow([
        new Date(),
        data.nome,
        data.email,
        data.telefone,
        data.mensagem || '',
      ]);
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
      to: CONFIG.recipient,
      replyTo: data.email,
      subject,
      body,
      name: 'BFX Empresarial',
    });

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error instanceof Error ? error.message : 'Não foi possível enviar a solicitação.',
    });
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

  if (honeypot) throw new Error('Solicitação bloqueada.');
  if (!startedAt || Date.now() - startedAt < CONFIG.minimumFillTimeMs) {
    throw new Error('Preencha o formulário com calma e tente novamente.');
  }
  if (name.length < 2 || name.length > 80) throw new Error('Informe um nome válido.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    throw new Error('Informe um e-mail válido.');
  }
  if (!/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(phone)) {
    throw new Error('Informe um telefone com DDD.');
  }
  if (message.length > 800) throw new Error('A mensagem excede o limite permitido.');
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
