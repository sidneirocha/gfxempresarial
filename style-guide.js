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
const galleryImages = [...document.querySelectorAll('.photo-photo img')];
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
  lastFocusedImage = image.closest('.photo-photo');
  showImage(galleryImages.indexOf(image));
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  lightbox.querySelector('[data-lightbox-stage]')?.focus();
}

document.querySelectorAll('.photo-photo').forEach(photo => {
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
