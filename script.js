const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');
const brandLink = document.querySelector('.brand[href="#topo"]');
const quoteModal = document.querySelector('#quote-modal');
const quoteOpeners = document.querySelectorAll('.js-open-quote');
const quoteClosers = document.querySelectorAll('[data-close-quote]');
const quoteForm = document.querySelector('.quote-form');
const quoteSuccess = document.querySelector('.quote-success');
const appsScriptEndpoint = 'https://script.google.com/macros/s/AKfycbxhM8h9FjhE2Eg9PGPhToWl1LqXWYVGnlBVxqtxIq2sMG65mqaaGfuNBYK34Z6Y2MsB/exec';
const heroCarousel = document.querySelector('[data-hero-carousel]');
const maintenanceCarousel = document.querySelector('[data-maintenance-carousel]');
let quoteOpenedAt = 0;
let turnstilePassed = false;

window.bfxTurnstileSuccess = token => {
  turnstilePassed = Boolean(token);
  const submitButton = quoteForm?.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = !turnstilePassed;
};
window.bfxTurnstileExpired = () => {
  turnstilePassed = false;
  const submitButton = quoteForm?.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
};
window.bfxTurnstileError = () => {
  turnstilePassed = false;
  const submitButton = quoteForm?.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = true;
};

document.querySelectorAll('.hero-copy h1').forEach(heading => {
  const text = heading.textContent.trim();
  heading.setAttribute('aria-label', text);
  let letterIndex = 0;
  heading.innerHTML = text.split(/(\s+)/).map(token => {
    if (/\s+/.test(token)) return token;
    const letters = [...token].map(character => {
      const html = `<span class="hero-letter" aria-hidden="true" style="--letter-index:${letterIndex}">${character}</span>`;
      letterIndex += 1;
      return html;
    }).join('');
    return `<span class="hero-word" aria-hidden="true">${letters}</span>`;
  }).join('');
});

const revealTargets = document.querySelectorAll(
  '.section, .benefits-strip, .solution-card, .mini-service, .management-panel, .cta-panel, .site-footer'
);
const solutionCards = [...document.querySelectorAll('.solution-card')];
const solutionsSection = document.querySelector('.solutions');
revealTargets.forEach((element, index) => {
  element.classList.add('reveal-on-scroll');
  element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 42}ms`);
});
solutionCards.forEach((card, index) => {
  card.style.setProperty('--reveal-delay', '0ms');
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealTargets.forEach(element => revealObserver.observe(element));
} else {
  revealTargets.forEach(element => element.classList.add('is-visible'));
}

let solutionScrollFrame = 0;
const updateSolutionScrollMotion = () => {
  solutionScrollFrame = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactLayout = window.innerWidth <= 640;
  const sectionBounds = solutionsSection?.getBoundingClientRect();
  if (!sectionBounds) return;
  const viewportCenter = window.innerHeight * .52;
  const travel = Math.max(window.innerHeight * .6, 1);
  const startTop = window.innerHeight * .92;
  const centerTop = window.innerHeight * .52 - sectionBounds.height / 2;
  const sectionProgress = Math.max(0, Math.min(1, (startTop - sectionBounds.top) / Math.max(startTop - centerTop, 1)));
  solutionCards.forEach(card => {
    const bounds = card.getBoundingClientRect();
    if (reducedMotion || compactLayout) {
      card.style.setProperty('--solution-opacity', '1');
      card.style.setProperty('--solution-reveal-y', '0px');
      card.style.setProperty('--solution-reveal-x', '0px');
      card.style.setProperty('--solution-scroll-x', '0px');
      card.style.setProperty('--scroll-lift', '0px');
      return;
    }
    const cardStart = solutionCards.indexOf(card) * .22;
    const entryProgress = Math.max(0, Math.min(1, (sectionProgress - cardStart) / (1 - cardStart)));
    const distance = (viewportCenter - (bounds.top + bounds.height / 2)) / travel;
    const clamped = Math.max(-1, Math.min(1, distance));
    card.style.setProperty('--solution-opacity', entryProgress.toFixed(3));
    card.style.setProperty('--solution-reveal-y', `${(1 - entryProgress) * 34}px`);
    card.style.setProperty('--solution-reveal-x', `${(1 - entryProgress) * -42}px`);
    card.style.setProperty('--solution-scroll-x', `${clamped * 12}px`);
    card.style.setProperty('--scroll-lift', `${clamped * 10}px`);
  });
};
const requestSolutionScrollMotion = () => {
  if (!solutionScrollFrame) solutionScrollFrame = requestAnimationFrame(updateSolutionScrollMotion);
};
window.addEventListener('scroll', requestSolutionScrollMotion, { passive: true });
window.addEventListener('resize', requestSolutionScrollMotion);
requestSolutionScrollMotion();

function updateHeader() {
  if (!header) return;
  if (window.scrollY > 24) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

let headerFrame = 0;
const requestHeaderUpdate = () => {
  if (!headerFrame) {
    headerFrame = requestAnimationFrame(() => {
      headerFrame = 0;
      updateHeader();
    });
  }
};
updateHeader();
window.addEventListener('scroll', requestHeaderUpdate, { passive: true });

const setMenuOpen = isOpen => {
  if (!nav || !toggle) return;
  nav.classList.toggle('open', isOpen);
  toggle.setAttribute('aria-expanded', String(isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  document.body.classList.toggle('menu-open', isOpen);
};

toggle?.addEventListener('click', () => {
  setMenuOpen(!nav?.classList.contains('open'));
});

brandLink?.addEventListener('click', event => {
  event.preventDefault();
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  window.history.replaceState(null, '', '#topo');
  window.scrollTo({ top: 0, behavior });
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    setMenuOpen(false);
  });
});

function closeQuoteModal() {
  quoteModal?.classList.remove('is-open');
  quoteModal?.classList.remove('is-success');
  quoteModal?.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  quoteForm?.reset();
  if (quoteForm) quoteForm.hidden = false;
  if (quoteSuccess) quoteSuccess.hidden = true;
  quoteModal?.querySelector('.quote-antispam-message')?.setAttribute('hidden', '');
  turnstilePassed = false;
  window.turnstile?.reset();
}

async function submitToAppsScript(formData) {
  if (!appsScriptEndpoint.startsWith('https://script.google.com/macros/s/')) {
    throw new Error('Endpoint do Apps Script não configurado.');
  }
  const response = await fetch(appsScriptEndpoint, {
    method: 'POST',
    body: new URLSearchParams(formData),
  });
  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (_) {
    throw new Error('O serviço de atendimento está indisponível.');
  }
  if (!response.ok && !result.message) throw new Error('O serviço de atendimento está indisponível.');
  if (!result.success) throw new Error(result.message || 'Não foi possível enviar a solicitação.');
  return result;
}

function showQuoteError(message, spamMessage) {
  if (spamMessage) {
    spamMessage.textContent = message;
    spamMessage.hidden = false;
  }
}

quoteOpeners.forEach(opener => {
  opener.addEventListener('click', event => {
    event.preventDefault();
    quoteModal?.classList.remove('is-success');
    if (quoteForm) quoteForm.hidden = false;
    const submitButton = quoteForm?.querySelector('button[type="submit"]');
    if (submitButton) submitButton.disabled = true;
    turnstilePassed = false;
    window.turnstile?.reset();
    if (quoteSuccess) quoteSuccess.hidden = true;
    const spamMessage = quoteModal?.querySelector('.quote-antispam-message');
    spamMessage?.setAttribute('hidden', '');
    if (spamMessage) spamMessage.textContent = 'Não foi possível enviar agora. Tente novamente.';
    quoteModal?.classList.add('is-open');
    quoteModal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    quoteOpenedAt = Date.now();
    const startedAtField = quoteForm?.elements.namedItem('started_at');
    if (startedAtField) startedAtField.value = String(quoteOpenedAt);
    quoteModal?.querySelector('input')?.focus();
  });
});

quoteClosers.forEach(closer => closer.addEventListener('click', closeQuoteModal));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav?.classList.contains('open')) {
    setMenuOpen(false);
    toggle?.focus();
  }
  if (event.key === 'Escape' && quoteModal?.classList.contains('is-open')) closeQuoteModal();
});

quoteForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const honeypot = quoteForm.elements.namedItem('empresa');
  const spamMessage = quoteModal?.querySelector('.quote-antispam-message');
  const submittedTooFast = Date.now() - quoteOpenedAt < 1400;
  if (honeypot?.value.trim() || submittedTooFast) {
    showQuoteError('Preencha o formulário com calma e tente novamente.', spamMessage);
    return;
  }
  const turnstileToken = quoteForm.elements.namedItem('cf-turnstile-response')?.value;
  if (!turnstileToken || !turnstilePassed) {
    showQuoteError('Confirme a verificação de segurança e tente novamente.', spamMessage);
    return;
  }
  const submitButton = quoteForm.querySelector('button[type="submit"]');
  const formData = Object.fromEntries(new FormData(quoteForm));
  if (spamMessage) spamMessage.hidden = true;
  submitButton.disabled = true;
  try {
    await submitToAppsScript(formData);
  } catch (error) {
    showQuoteError(error.message || 'Não foi possível enviar agora. Tente novamente em instantes.', spamMessage);
    turnstilePassed = false;
    window.turnstile?.reset();
    submitButton.disabled = true;
    return;
  }
  quoteModal?.classList.add('is-success');
  quoteForm.hidden = true;
  if (quoteSuccess) quoteSuccess.hidden = false;
  if (spamMessage) spamMessage.hidden = true;
});

if (heroCarousel) {
  const slides = [...heroCarousel.querySelectorAll('[data-hero-slide]')];
  const dotsContainer = heroCarousel.querySelector('[data-hero-dots]');
  const previous = heroCarousel.querySelector('[data-hero-prev]');
  const next = heroCarousel.querySelector('[data-hero-next]');
  const progress = heroCarousel.querySelector('.hero-progress');
  const progressFill = heroCarousel.querySelector('[data-hero-progress]');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let activeIndex = 0;
  let rotation;
  let hoverPaused = false;
  let focusPaused = false;

  const restartProgress = () => {
    if (!progressFill) return;
    if (reducedMotionQuery.matches) {
      progressFill.style.animation = 'none';
      progress?.classList.add('is-paused');
      return;
    }
    progress?.classList.remove('is-paused');
    progressFill.style.animation = 'none';
    void progressFill.offsetWidth;
    progressFill.style.animation = 'hero-progress-fill 7000ms linear forwards';
  };

  const renderHero = index => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.toggleAttribute('inert', !isActive);
    });
    dotsContainer?.querySelectorAll('.hero-carousel-dot').forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
    restartProgress();
  };

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = `hero-carousel-dot${index === 0 ? ' is-active' : ''}`;
    dot.setAttribute('aria-label', `Destaque ${index + 1}`);
    dot.addEventListener('click', () => { renderHero(index); restartRotation(); });
    dotsContainer?.append(dot);
  });
  const stopRotation = () => {
    clearInterval(rotation);
    rotation = undefined;
    progress?.classList.add('is-paused');
  };
  const canRotate = () => !reducedMotionQuery.matches && !document.hidden && !hoverPaused && !focusPaused;
  const restartRotation = () => {
    stopRotation();
    if (!canRotate()) return;
    progress?.classList.remove('is-paused');
    rotation = setInterval(() => renderHero(activeIndex + 1), 7000);
  };
  previous?.addEventListener('click', () => { renderHero(activeIndex - 1); restartRotation(); });
  next?.addEventListener('click', () => { renderHero(activeIndex + 1); restartRotation(); });
  heroCarousel.addEventListener('mouseenter', () => {
    hoverPaused = true;
    stopRotation();
  });
  heroCarousel.addEventListener('mouseleave', () => {
    hoverPaused = false;
    restartRotation();
  });
  heroCarousel.addEventListener('focusin', () => {
    focusPaused = true;
    stopRotation();
  });
  heroCarousel.addEventListener('focusout', event => {
    if (!heroCarousel.contains(event.relatedTarget)) {
      focusPaused = false;
      restartRotation();
    }
  });
  document.addEventListener('visibilitychange', restartRotation);
  reducedMotionQuery.addEventListener?.('change', restartRotation);
  renderHero(0);
  restartRotation();
}

if (maintenanceCarousel) {
  const track = maintenanceCarousel.querySelector('[data-carousel-track]');
  const cards = [...maintenanceCarousel.querySelectorAll('.mini-service')];
  const dotsContainer = maintenanceCarousel.parentElement.querySelector('[data-carousel-dots]');
  const prevButton = maintenanceCarousel.querySelector('[data-carousel-prev]');
  const nextButton = maintenanceCarousel.querySelector('[data-carousel-next]');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let autoplayTimer = 0;
  let interactionPaused = false;
  let cycleWidth = 0;

  const clones = cards.map(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button, input, textarea, select, [tabindex]').forEach(element => {
      element.setAttribute('tabindex', '-1');
    });
    return clone;
  });
  track.append(...clones);

  const getPageCount = () => {
    const firstCard = cards[0];
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    const cardWidth = firstCard?.getBoundingClientRect().width || track.clientWidth;
    const visibleCards = Math.max(1, Math.floor((track.clientWidth + gap) / (cardWidth + gap)));
    return Math.max(1, Math.ceil(cards.length / visibleCards));
  };
  const getStep = () => {
    const firstCard = cards[0];
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return (firstCard?.getBoundingClientRect().width || 0) + gap;
  };
  const getCurrentPage = () => Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
  const measureCycle = () => {
    cycleWidth = clones[0]?.offsetLeft - cards[0]?.offsetLeft || track.scrollWidth;
  };
  const normalizeScroll = () => {
    if (!cycleWidth) measureCycle();
    while (cycleWidth > 0 && track.scrollLeft >= cycleWidth) {
      track.scrollLeft -= cycleWidth;
    }
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = 0;
  };

  const scrollToPage = page => {
    const pageCount = getPageCount();
    const nextPage = (page + pageCount) % pageCount;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    track.scrollTo({
      left: Math.min(nextPage * track.clientWidth, maxScroll),
      behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
    });
  };

  const advance = () => {
    track.scrollBy({
      left: getStep(),
      behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
    });
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (interactionPaused || reducedMotionQuery.matches || getPageCount() < 2) return;
    autoplayTimer = window.setInterval(() => {
      if (!document.hidden) advance();
    }, 4500);
  };

  const updateDots = () => {
    if (!dotsContainer) return;
    const pageCount = getPageCount();
    dotsContainer.innerHTML = '';
    for (let index = 0; index < pageCount; index += 1) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot${index === 0 ? ' is-active' : ''}`;
      dot.type = 'button';
      dot.setAttribute('aria-label', `Página ${index + 1} de manutenções`);
      dot.addEventListener('click', () => {
        scrollToPage(index);
        startAutoplay();
      });
      dotsContainer.append(dot);
    }
  };

  prevButton?.addEventListener('click', () => {
    track.scrollBy({ left: -getStep(), behavior: 'smooth' });
    startAutoplay();
  });
  nextButton?.addEventListener('click', () => {
    advance();
    startAutoplay();
  });
  track.addEventListener('scroll', () => {
    normalizeScroll();
    const page = getCurrentPage();
    dotsContainer?.querySelectorAll('.carousel-dot').forEach((dot, index) => dot.classList.toggle('is-active', index === page));
  }, { passive: true });
  const pauseForInteraction = () => {
    interactionPaused = true;
    stopAutoplay();
  };
  const resumeFromInteraction = () => {
    interactionPaused = false;
    startAutoplay();
  };
  track.addEventListener('pointerenter', pauseForInteraction);
  track.addEventListener('pointerleave', resumeFromInteraction);
  track.addEventListener('touchstart', pauseForInteraction, { passive: true });
  track.addEventListener('touchend', resumeFromInteraction, { passive: true });
  track.addEventListener('focusin', pauseForInteraction);
  track.addEventListener('focusout', event => {
    if (!track.contains(event.relatedTarget)) {
      resumeFromInteraction();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });
  reducedMotionQuery.addEventListener?.('change', startAutoplay);
  updateDots();
  measureCycle();
  window.addEventListener('resize', () => {
    measureCycle();
    normalizeScroll();
    updateDots();
    startAutoplay();
  });
  startAutoplay();
}

const ctaImage = document.querySelector('.cta-image');
const ctaImageMedia = ctaImage?.querySelector('img');
const managementMedia = document.querySelector('.management-media');
const canTrackPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const phoneField = quoteForm?.elements.namedItem('telefone');
phoneField?.addEventListener('input', event => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) {
    event.target.value = digits ? `(${digits}` : '';
  } else if (digits.length <= 6) {
    event.target.value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  } else {
    const number = digits.slice(2);
    const split = number.length > 8 ? 5 : 4;
    event.target.value = `(${digits.slice(0, 2)}) ${number.slice(0, split)}-${number.slice(split)}`;
  }
});

if (ctaImage && ctaImageMedia && canTrackPointer.matches && !prefersReducedMotion.matches) {
  ctaImage.addEventListener('pointermove', event => {
    const bounds = ctaImage.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    ctaImageMedia.style.setProperty('--cta-shift-x', `${x * 18}px`);
    ctaImageMedia.style.setProperty('--cta-shift-y', `${y * 12}px`);
  });

  ctaImage.addEventListener('pointerleave', () => {
    ctaImageMedia.style.setProperty('--cta-shift-x', '0px');
    ctaImageMedia.style.setProperty('--cta-shift-y', '0px');
  });
}

if (managementMedia && canTrackPointer.matches && !prefersReducedMotion.matches) {
  managementMedia.addEventListener('pointermove', event => {
    const bounds = managementMedia.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    managementMedia.style.setProperty('--management-arrow-left', `${event.clientX - bounds.left}px`);
    managementMedia.style.setProperty('--management-arrow-top', `${event.clientY - bounds.top}px`);
    managementMedia.style.setProperty('--management-arrow-rotate', `${x * 9}deg`);
  });

  managementMedia.addEventListener('pointerleave', () => {
    managementMedia.style.setProperty('--management-arrow-left', '50%');
    managementMedia.style.setProperty('--management-arrow-top', '50%');
    managementMedia.style.setProperty('--management-arrow-rotate', '0deg');
  });
}
