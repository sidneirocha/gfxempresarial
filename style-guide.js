const themeToggle = document.querySelector('[data-theme-toggle]');
const themeLabel = document.querySelector('[data-theme-label]');
const storedTheme = window.localStorage.getItem('bfx-style-guide-theme');

function applyTheme(theme) {
  const isLight = theme === 'light';
  document.body.dataset.theme = isLight ? 'light' : 'dark';
  themeToggle?.setAttribute('aria-pressed', String(isLight));
  if (themeLabel) themeLabel.textContent = isLight ? 'Modo escuro' : 'Modo claro';
  document.querySelectorAll('[data-dark-src][data-light-src]').forEach(image => {
    image.src = isLight ? image.dataset.lightSrc : image.dataset.darkSrc;
  });
}

applyTheme(storedTheme === 'light' ? 'light' : 'dark');

const sectionNavLinks = [...document.querySelectorAll('.rail-nav a[href^="#"]')];
const guideRail = document.querySelector('.guide-rail');
const railMenuToggle = document.querySelector('.rail-menu-toggle');
const guideSections = sectionNavLinks
  .map(link => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

function setActiveSection(id) {
  sectionNavLinks.forEach(link => {
    link.setAttribute('aria-current', link.getAttribute('href') === `#${id}` ? 'true' : 'false');
  });
}

sectionNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    setActiveSection(link.getAttribute('href').slice(1));
    guideRail?.classList.remove('is-open');
    railMenuToggle?.setAttribute('aria-expanded', 'false');
  });
});
setActiveSection(window.location.hash ? window.location.hash.slice(1) : 'marca');

railMenuToggle?.addEventListener('click', () => {
  const isOpen = guideRail?.classList.toggle('is-open') ?? false;
  railMenuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !guideRail?.classList.contains('is-open')) return;
  guideRail.classList.remove('is-open');
  railMenuToggle?.setAttribute('aria-expanded', 'false');
  railMenuToggle?.focus();
});

if ('IntersectionObserver' in window && guideSections.length) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.filter(entry => entry.isIntersecting).forEach(entry => {
      setActiveSection(entry.target.id);
    });
  }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
  guideSections.forEach(section => sectionObserver.observe(section));
}

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'light' ? 'dark' : 'light';
  window.localStorage.setItem('bfx-style-guide-theme', nextTheme);
  applyTheme(nextTheme);
});

const signatureForm = document.querySelector('[data-signature-form]');
const signaturePreview = document.querySelector('[data-signature-preview]');
const signatureCopyButton = document.querySelector('[data-signature-copy]');
const signatureDownloadButton = document.querySelector('[data-signature-download]');
const signatureStatus = document.querySelector('[data-signature-status]');
const signaturePublicBase = 'https://bfxempresarial.com.br';

function escapeSignatureValue(value) {
  return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function normalizeSignatureUrl(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function normalizeSignaturePhone(value) {
  const trimmed = String(value || '').trim();
  return trimmed ? trimmed.replace(/[^\d+]/g, '') : '';
}

function readSignatureValues() {
  return Object.fromEntries([...signatureForm.querySelectorAll('[data-signature-field]')].map(field => [field.dataset.signatureField, field.value.trim()]));
}

function contactRow(letter, content, href, isLast = false) {
  if (!content) return '';
  const safeContent = escapeSignatureValue(content);
  const linkedContent = href ? `<a href="${escapeSignatureValue(href)}" style="color:#08192B;text-decoration:none;">${safeContent}</a>` : safeContent;
  return `<tr><td style="font-size:13px;line-height:20px;color:#5C6673;padding:0 0 ${isLast ? '0' : '2px'} 0;"><span style="color:#F67603;font-weight:700;">${letter}</span>&nbsp;&nbsp;${linkedContent}</td></tr>`;
}

function buildSignatureMarkup(values, logoUrl) {
  const name = escapeSignatureValue(values.name || 'BFX Empresarial');
  const role = escapeSignatureValue(values.role || 'Manutenção • Gestão Predial • Gestão de Projetos');
  const tagline = escapeSignatureValue(values.tagline || 'Estrutura, eficiência e cuidado para manter seu patrimônio em movimento.');
  const emailHref = values.email ? `mailto:${encodeURIComponent(values.email)}` : '';
  const phoneHref = values.phone ? `tel:${normalizeSignaturePhone(values.phone)}` : '';
  const websiteUrl = normalizeSignatureUrl(values.website);
  const rows = [
    contactRow('E', values.email, emailHref),
    contactRow('T', values.phone, phoneHref),
    contactRow('W', values.website, websiteUrl),
    contactRow('A', values.address, '', true),
  ].join('');
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:620px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#08192B;">
  <tr>
    <td style="width:168px;padding:0 24px 0 0;vertical-align:middle;border-right:2px solid #F67603;">
      <a href="${escapeSignatureValue(websiteUrl || `${signaturePublicBase}/`)}" style="text-decoration:none;">
        <img src="${escapeSignatureValue(logoUrl)}" width="145" alt="BFX Empresarial" style="display:block;width:145px;max-width:145px;height:auto;border:0;outline:none;text-decoration:none;">
      </a>
    </td>
    <td style="padding:0 0 0 24px;vertical-align:middle;">
      <div style="font-size:20px;line-height:24px;font-weight:700;color:#08192B;margin:0 0 4px 0;">${name}</div>
      <div style="font-size:12px;line-height:18px;font-weight:700;letter-spacing:1.3px;text-transform:uppercase;color:#F67603;margin:0 0 12px 0;">${role}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows}</table>
      <div style="margin-top:13px;font-size:11px;line-height:16px;color:#8A929C;">${tagline}</div>
    </td>
  </tr>
</table>`;
}

function buildSignaturePlainText(values) {
  return [values.name || 'BFX Empresarial', values.role || 'Manutenção • Gestão Predial • Gestão de Projetos', '', values.email && `E  ${values.email}`, values.phone && `T  ${values.phone}`, values.website && `W  ${values.website}`, values.address && `A  ${values.address}`, '', values.tagline || 'Estrutura, eficiência e cuidado para manter seu patrimônio em movimento.'].filter(Boolean).join('\n');
}

function renderSignature() {
  if (!signatureForm || !signaturePreview) return;
  const values = readSignatureValues();
  const localLogoUrl = new URL('assets/logo-bfx-light.svg', document.baseURI).href;
  signaturePreview.innerHTML = buildSignatureMarkup(values, localLogoUrl);
}

async function copySignature() {
  const values = readSignatureValues();
  const html = buildSignatureMarkup(values, `${signaturePublicBase}/assets/logo-bfx-light.svg`);
  const plainText = buildSignaturePlainText(values);
  try {
    if (navigator.clipboard?.write && window.ClipboardItem) {
      await navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      })]);
    } else {
      const helper = document.createElement('div');
      helper.contentEditable = 'true';
      helper.innerHTML = html;
      helper.style.position = 'fixed';
      helper.style.left = '-9999px';
      document.body.append(helper);
      const range = document.createRange();
      range.selectNodeContents(helper);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('copy');
      selection.removeAllRanges();
      helper.remove();
    }
    if (signatureStatus) signatureStatus.textContent = 'Assinatura copiada. Cole diretamente no corpo do e-mail.';
  } catch {
    if (signatureStatus) signatureStatus.textContent = 'Não foi possível copiar automaticamente. Tente novamente em uma página publicada ou use o download HTML.';
  }
}

function downloadSignature() {
  const values = readSignatureValues();
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Assinatura de e-mail — ${escapeSignatureValue(values.name || 'BFX Empresarial')}</title></head><body style="margin:0;padding:24px;background:#ffffff;">${buildSignatureMarkup(values, `${signaturePublicBase}/assets/logo-bfx-light.svg`)}</body></html>`;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  link.download = 'assinatura-bfx.html';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  if (signatureStatus) signatureStatus.textContent = 'HTML baixado. Abra o arquivo para revisar ou reutilizar.';
}

signatureForm?.addEventListener('input', renderSignature);
signatureCopyButton?.addEventListener('click', copySignature);
signatureDownloadButton?.addEventListener('click', downloadSignature);
renderSignature();

document.querySelectorAll('[data-copy-color]').forEach(button => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copyColor;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const helper = document.createElement('textarea');
      helper.value = value;
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.append(helper);
      helper.select();
      document.execCommand('copy');
      helper.remove();
    }
    const originalLabel = button.textContent;
    button.textContent = 'Copiado!';
    window.setTimeout(() => { button.textContent = originalLabel; }, 1400);
  });
});

const motionManagementDemo = document.querySelector('[data-management-demo]');
const motionCtaDemo = document.querySelector('[data-cta-demo]');
const guidePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const guideReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (guidePointer.matches && !guideReducedMotion.matches) {
  motionManagementDemo?.addEventListener('pointermove', event => {
    const bounds = motionManagementDemo.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    motionManagementDemo.style.setProperty('--motion-arrow-left', `${event.clientX - bounds.left}px`);
    motionManagementDemo.style.setProperty('--motion-arrow-top', `${event.clientY - bounds.top}px`);
    motionManagementDemo.style.setProperty('--motion-arrow-rotate', `${x * 9}deg`);
  });
  motionManagementDemo?.addEventListener('pointerleave', () => {
    motionManagementDemo.style.setProperty('--motion-arrow-left', '50%');
    motionManagementDemo.style.setProperty('--motion-arrow-top', '50%');
    motionManagementDemo.style.setProperty('--motion-arrow-rotate', '0deg');
  });
  motionCtaDemo?.addEventListener('pointermove', event => {
    const bounds = motionCtaDemo.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    motionCtaDemo.style.setProperty('--motion-cta-x', `${x * 18}px`);
    motionCtaDemo.style.setProperty('--motion-cta-y', `${y * 12}px`);
  });
  motionCtaDemo?.addEventListener('pointerleave', () => {
    motionCtaDemo.style.setProperty('--motion-cta-x', '0px');
    motionCtaDemo.style.setProperty('--motion-cta-y', '0px');
  });
}

const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = lightbox?.querySelector('[data-lightbox-image]');
const zoomValue = lightbox?.querySelector('[data-zoom-value]');
const galleryImages = [...document.querySelectorAll('.photo-photo img, .application-card img')];
let activeImageIndex = 0;
let zoomLevel = 1;
let lastFocusedImage = null;

function renderZoom() {
  if (!lightboxImage || !zoomValue) return;
  lightboxImage.style.transform = `scale(${zoomLevel})`;
  zoomValue.textContent = `${Math.round(zoomLevel * 100)}%`;
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  if (lightboxImage) lightboxImage.removeAttribute('src');
  lastFocusedImage?.focus();
  lastFocusedImage = null;
}

function showImage(index) {
  if (!lightbox || !lightboxImage) return;
  activeImageIndex = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[activeImageIndex];
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  zoomLevel = 1;
  renderZoom();
}

function openLightbox(image) {
  if (!lightbox || !lightboxImage) return;
  lastFocusedImage = image.closest('.photo-photo, .application-card');
  showImage(galleryImages.indexOf(image));
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  lightbox.querySelector('[data-lightbox-stage]')?.focus();
}

document.querySelectorAll('.photo-photo, .application-card').forEach(photo => {
  const image = photo.querySelector('img');
  if (!image) return;
  photo.tabIndex = 0;
  photo.setAttribute('role', 'button');
  photo.setAttribute('aria-label', `Ampliar imagem: ${image.alt}`);
  photo.addEventListener('click', event => {
    if (event.target.closest('a')) return;
    openLightbox(image);
  });
  photo.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

lightbox?.querySelector('[data-lightbox-close]')?.addEventListener('click', closeLightbox);
lightbox?.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => showImage(activeImageIndex - 1));
lightbox?.querySelector('[data-lightbox-next]')?.addEventListener('click', () => showImage(activeImageIndex + 1));
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});
lightbox?.querySelector('[data-zoom-in]')?.addEventListener('click', () => {
  zoomLevel = Math.min(3.5, +(zoomLevel + .25).toFixed(2));
  renderZoom();
});
lightbox?.querySelector('[data-zoom-out]')?.addEventListener('click', () => {
  zoomLevel = Math.max(1, +(zoomLevel - .25).toFixed(2));
  renderZoom();
});
lightbox?.querySelector('[data-lightbox-stage]')?.addEventListener('wheel', event => {
  event.preventDefault();
  zoomLevel = Math.min(3.5, Math.max(1, +(zoomLevel + (event.deltaY < 0 ? .1 : -.1)).toFixed(2)));
  renderZoom();
}, { passive: false });

document.addEventListener('keydown', event => {
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showImage(activeImageIndex - 1);
  if (event.key === 'ArrowRight') showImage(activeImageIndex + 1);
  if (event.key === '+' || event.key === '=') lightbox.querySelector('[data-zoom-in]')?.click();
  if (event.key === '-') lightbox.querySelector('[data-zoom-out]')?.click();
  if (event.key === '0') { zoomLevel = 1; renderZoom(); }
  if (event.key === 'Tab') {
    const focusable = [...lightbox.querySelectorAll('button, [tabindex="0"]')]
      .filter(element => !element.disabled && !element.hidden);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});
