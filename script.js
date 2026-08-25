/* ==========================================================================
   BIRTHDAY WEBSITE — SCRIPT
   Vanilla JS. No dependencies.
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     1. OPENING → MAIN TRANSITION
  --------------------------------------------------------------------- */
  const opening = document.getElementById('opening');
  const openBtn = document.getElementById('openBtn');
  const main = document.getElementById('main');
  const musicToggle = document.getElementById('musicToggle');

  function openExperience() {
    opening.classList.add('is-closing');
    main.classList.remove('is-hidden');
    musicToggle.classList.remove('is-hidden');

    // Try to start music (best-effort; browsers may block autoplay)
    tryPlayMusic();

    // Remove opening from tab order / a11y tree after transition
    window.setTimeout(() => {
      opening.setAttribute('aria-hidden', 'true');
      opening.style.display = 'none';
    }, prefersReducedMotion ? 0 : 1000);

    // Kick off hero decorative effects once visible
    spawnHeroDecorations();
  }

  openBtn.addEventListener('click', openExperience);

  /* ---------------------------------------------------------------------
     2. SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // No IO support or reduced motion: show everything immediately
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------------------------
     2b. HERO SCROLL HINT FADE
  --------------------------------------------------------------------- */
  const scrollHint = document.querySelector('.hero__scroll-hint');
  if (scrollHint) {
    let hintFaded = false;
    window.addEventListener('scroll', () => {
      if (!hintFaded && window.scrollY > 60) {
        scrollHint.classList.add('is-faded');
        hintFaded = true;
      } else if (hintFaded && window.scrollY <= 60) {
        scrollHint.classList.remove('is-faded');
        hintFaded = false;
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------------
     3. FLOATING HEARTS + SPARKLES (Hero)
  --------------------------------------------------------------------- */
  function spawnHeroDecorations() {
    if (prefersReducedMotion) return;

    const heartsContainer = document.querySelector('.hero__hearts');
    const sparklesContainer = document.querySelector('.hero__sparkles');
    const balloonsContainer = document.querySelector('.hero__balloons');

    // Guard against duplicate spawns if "Buka" is triggered more than once
    // (e.g. after Replay) — clear any previous decorative elements first.
    heartsContainer.innerHTML = '';
    sparklesContainer.innerHTML = '';
    if (balloonsContainer) balloonsContainer.innerHTML = '';

    const heartSymbols = ['❤', '💕', '♡'];

    // A handful of floating hearts, not dozens
    const heartCount = 5;
    for (let i = 0; i < heartCount; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = heartSymbols[i % heartSymbols.length];
      heart.style.left = `${10 + Math.random() * 80}%`;
      heart.style.setProperty('--delay', `${i * 1.4}s`);
      heart.style.setProperty('--drift', `${(Math.random() - 0.5) * 60}px`);
      heartsContainer.appendChild(heart);
    }

    // Subtle sparkles
    const sparkleCount = 6;
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.setProperty('--delay', `${Math.random() * 3}s`);
      sparklesContainer.appendChild(sparkle);
    }

    // A few drifting balloons — quiet, not a party-popper amount
    if (balloonsContainer) {
      const balloonCount = 4;
      for (let i = 0; i < balloonCount; i++) {
        const balloon = document.createElement('span');
        balloon.className = 'balloon';
        balloon.style.left = `${10 + Math.random() * 80}%`;
        balloon.style.setProperty('--delay', `${i * 2.1}s`);
        balloon.style.setProperty('--drift', `${(Math.random() - 0.5) * 40}px`);
        balloonsContainer.appendChild(balloon);
      }
    }
  }

  /* Final section gets a quieter set of floating hearts too */
  function spawnFinalHearts() {
    if (prefersReducedMotion) return;
    const container = document.querySelector('.final__hearts');
    if (!container || container.dataset.spawned) return;
    container.dataset.spawned = 'true';

    for (let i = 0; i < 4; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = '❤';
      heart.style.left = `${15 + Math.random() * 70}%`;
      heart.style.setProperty('--delay', `${i * 1.8}s`);
      heart.style.setProperty('--drift', `${(Math.random() - 0.5) * 50}px`);
      container.appendChild(heart);
    }
  }

  const finalSection = document.getElementById('final');
  if ('IntersectionObserver' in window) {
    const finalObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          spawnFinalHearts();
          finalObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });
    finalObserver.observe(finalSection);
  }

  /* ---------------------------------------------------------------------
     4. GALLERY LIGHTBOX
  --------------------------------------------------------------------- */
  const polaroids = document.querySelectorAll('.polaroid');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocusedPolaroid = null;

  function openLightbox(imgSrc, imgAlt, caption) {
    lightboxImg.src = imgSrc;
    lightboxImg.alt = imgAlt;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedPolaroid) lastFocusedPolaroid.focus();
  }

  polaroids.forEach((polaroid) => {
    polaroid.addEventListener('click', () => {
      const img = polaroid.querySelector('img');
      lastFocusedPolaroid = polaroid;
      openLightbox(img.src, img.alt, polaroid.dataset.caption || '');
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });

  /* ---------------------------------------------------------------------
     5. ENVELOPE + LETTER
  --------------------------------------------------------------------- */
  const envelope = document.getElementById('envelope');
  const letterPaper = document.getElementById('letterPaper');

  envelope.addEventListener('click', () => {
    const isOpen = envelope.classList.toggle('is-open');
    envelope.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      // Reveal letter slightly after flap animation starts
      window.setTimeout(() => {
        letterPaper.hidden = false;
        letterPaper.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });
      }, prefersReducedMotion ? 0 : 350);
    } else {
      letterPaper.hidden = true;
    }
  });

  /* ---------------------------------------------------------------------
     5a2. WISHES FOR YOU (envelope letter → bridge to Make A Wish)
  --------------------------------------------------------------------- */
  const wishEnvelope = document.getElementById('wishEnvelope');
  const wishOpenBtn = document.getElementById('wishOpenBtn');
  const wishLetterPaper = document.getElementById('wishLetterPaper');
  const wishContinueBtn = document.getElementById('wishContinueBtn');

  if (wishOpenBtn && wishEnvelope && wishLetterPaper) {
    wishOpenBtn.addEventListener('click', () => {
      wishEnvelope.classList.add('is-open');
      wishOpenBtn.setAttribute('aria-expanded', 'true');
      wishOpenBtn.hidden = true;

      // Let the envelope flap animation start before the letter slides out
      window.setTimeout(() => {
        wishLetterPaper.hidden = false;
        wishLetterPaper.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'nearest' });

        // Reveal the bridge button once the letter has settled in
        if (wishContinueBtn) {
          window.setTimeout(() => {
            wishContinueBtn.hidden = false;
          }, prefersReducedMotion ? 0 : 450);
        }
      }, prefersReducedMotion ? 0 : 550);
    });
  }

  if (wishContinueBtn) {
    wishContinueBtn.addEventListener('click', () => {
      const cakeSection = document.getElementById('wish');
      if (cakeSection) {
        cakeSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  /* ---------------------------------------------------------------------
     5b. LITTLE GIFTS (gift box → modal)
  --------------------------------------------------------------------- */
  const giftBoxes = document.querySelectorAll('.gift-box');
  const giftModal = document.getElementById('giftModal');
  const giftModalTitle = document.getElementById('giftModalTitle');
  const giftModalMessage = document.getElementById('giftModalMessage');
  const giftModalClose = document.getElementById('giftModalClose');
  let lastFocusedGiftBox = null;

  function openGiftModal(title, message) {
    giftModalTitle.textContent = title;
    giftModalMessage.textContent = message;
    giftModal.classList.add('is-open');
    giftModal.setAttribute('aria-hidden', 'false');
    giftModalClose.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeGiftModal() {
    giftModal.classList.remove('is-open');
    giftModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedGiftBox) lastFocusedGiftBox.focus();
  }

  giftBoxes.forEach((box) => {
    box.addEventListener('click', () => {
      lastFocusedGiftBox = box;
      openGiftModal(box.dataset.giftTitle || '', box.dataset.giftMessage || '');
    });
  });

  if (giftModalClose) {
    giftModalClose.addEventListener('click', closeGiftModal);
  }
  if (giftModal) {
    giftModal.addEventListener('click', (e) => {
      if (e.target === giftModal) closeGiftModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && giftModal && giftModal.classList.contains('is-open')) {
      closeGiftModal();
    }
  });

  /* ---------------------------------------------------------------------
     6. MUSIC CONTROL
  --------------------------------------------------------------------- */
  const bgMusic = document.getElementById('bgMusic');

  function tryPlayMusic() {
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          musicToggle.setAttribute('aria-pressed', 'true');
          musicToggle.setAttribute('aria-label', 'Matikan musik');
        })
        .catch(() => {
          // Autoplay blocked — wait for explicit user tap on the toggle
          musicToggle.setAttribute('aria-pressed', 'false');
          musicToggle.setAttribute('aria-label', 'Nyalakan musik');
        });
    }
  }

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      musicToggle.setAttribute('aria-pressed', 'true');
      musicToggle.setAttribute('aria-label', 'Matikan musik');
    } else {
      bgMusic.pause();
      musicToggle.setAttribute('aria-pressed', 'false');
      musicToggle.setAttribute('aria-label', 'Nyalakan musik');
    }
  });

  /* ---------------------------------------------------------------------
     6b. MAKE A WISH (cake + candles + confetti)
  --------------------------------------------------------------------- */
  const cake = document.getElementById('cake');
  const makeWishBtn = document.getElementById('makeWishBtn');
  const wishMessage = document.getElementById('wishMessage');

  function spawnConfetti() {
    if (prefersReducedMotion || !cake) return;
    const wrap = cake.closest('.cake-wrap');
    if (!wrap) return;

    const colors = ['var(--color-blush)', 'var(--color-gold)', 'var(--color-green-deep)', 'var(--color-blush-soft)'];
    const confettiCount = 16;

    for (let i = 0; i < confettiCount; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.background = colors[i % colors.length];
      piece.style.setProperty('--x', `${(Math.random() - 0.5) * 220}px`);
      piece.style.setProperty('--y', `${-60 - Math.random() * 120}px`);
      piece.style.setProperty('--spin', `${(Math.random() - 0.5) * 720}deg`);
      piece.style.animationDelay = `${Math.random() * 0.15}s`;
      wrap.appendChild(piece);

      // Clean up each piece once its animation finishes
      piece.addEventListener('animationend', () => piece.remove());
    }
  }

  function spawnWishSparkles() {
    if (prefersReducedMotion || !cake) return;
    const wrap = cake.closest('.cake-wrap');
    if (!wrap) return;

    const sparkleCount = 8;
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.top = `${Math.random() * 70}%`;
      sparkle.style.setProperty('--delay', `${Math.random() * 0.3}s`);
      wrap.appendChild(sparkle);

      // This is a one-off burst, not ambient decoration — clear it after a beat
      window.setTimeout(() => sparkle.remove(), 2400);
    }
  }

  function makeWish() {
    if (!cake || cake.classList.contains('is-blown')) return;
    cake.classList.add('is-blown');
    spawnConfetti();
    spawnWishSparkles();
    if (wishMessage) wishMessage.hidden = false;
    if (makeWishBtn) makeWishBtn.disabled = true;
  }

  if (makeWishBtn) {
    makeWishBtn.addEventListener('click', makeWish);
  }

  /* ---------------------------------------------------------------------
     7. REPLAY
  --------------------------------------------------------------------- */
  const replayBtn = document.getElementById('replayBtn');

  replayBtn.addEventListener('click', () => {
    // Reset envelope/letter state
    envelope.classList.remove('is-open');
    envelope.setAttribute('aria-expanded', 'false');
    letterPaper.hidden = true;

    // Reset wishes envelope/letter state
    if (wishEnvelope) wishEnvelope.classList.remove('is-open');
    if (wishOpenBtn) {
      wishOpenBtn.hidden = false;
      wishOpenBtn.setAttribute('aria-expanded', 'false');
    }
    if (wishLetterPaper) wishLetterPaper.hidden = true;
    if (wishContinueBtn) wishContinueBtn.hidden = true;

    // Reset gift modal (in case it was left open) and gift-related scroll lock
    if (giftModal) {
      giftModal.classList.remove('is-open');
      giftModal.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';

    // Reset cake / make-a-wish state so the candles can be blown out again
    if (cake) {
      cake.classList.remove('is-blown');
      const cakeWrap = cake.closest('.cake-wrap');
      if (cakeWrap) {
        cakeWrap.querySelectorAll('.confetti-piece, .sparkle').forEach((el) => el.remove());
      }
    }
    if (wishMessage) wishMessage.hidden = true;
    if (makeWishBtn) makeWishBtn.disabled = false;

    // Reset scroll hint visibility
    if (scrollHint) scrollHint.classList.remove('is-faded');

    // Clear final hearts so they can be respawned on next visit
    const finalHeartsContainer = document.querySelector('.final__hearts');
    if (finalHeartsContainer) {
      finalHeartsContainer.innerHTML = '';
      delete finalHeartsContainer.dataset.spawned;
    }

    // Reset scroll reveals so the story can replay as the user scrolls again
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      revealEls.forEach((el) => el.classList.remove('is-visible'));
      const replayObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            replayObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach((el) => replayObserver.observe(el));
    }

    // Bring back the opening screen
    opening.style.display = 'flex';
    opening.removeAttribute('aria-hidden');
    // Force reflow so the transition plays
    void opening.offsetWidth;
    opening.classList.remove('is-closing');

    main.classList.add('is-hidden');
    window.scrollTo({ top: 0, behavior: 'auto' });
  });

})();
