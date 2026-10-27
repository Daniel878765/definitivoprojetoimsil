/* ============================================================
   IMSIL – Interações da página
   ============================================================ */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ----------------------------------------------------------
     1. Header com sombra ao rolar
  ---------------------------------------------------------- */
  const header = $('header');
  const onScrollHeader = () => {
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ----------------------------------------------------------
     2. Menu mobile (hamburger)
  ---------------------------------------------------------- */
  const hamburger = $('.hamburger');
  const navMenu = $('nav[aria-label="Navegação principal"]');
  const navLinks = $$('nav[aria-label="Navegação principal"] a');

  const closeMenu = () => {
    if (!hamburger) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('open');
  };

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navMenu.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Fecha o menu ao clicar em um link
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  // Fecha ao redimensionar para desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > 760) closeMenu();
    }, 150);
  });

  /* ----------------------------------------------------------
     3. Link ativo da navegação (com IntersectionObserver)
  ---------------------------------------------------------- */
  const sections = $$('main section[id]');
  const navMap = new Map();
  navLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) navMap.set(href.slice(1), link);
  });

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((l) => l.classList.remove('active'));
          const active = navMap.get(id);
          if (active) active.classList.add('active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  /* ----------------------------------------------------------
     4. Acordeão do FAQ
  ---------------------------------------------------------- */
  const faqItems = $$('.faq-item');
  faqItems.forEach((item) => {
    const btn   = $('.faq-question', item);
    const answer = $('.faq-answer', item);
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Fecha os demais
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove('open');
          const ob = $('.faq-question', other);
          const oa = $('.faq-answer', other);
          if (ob) ob.setAttribute('aria-expanded', 'false');
          if (oa) oa.style.maxHeight = null;
        }
      });

      item.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });

  /* ----------------------------------------------------------
     5. Botão "voltar ao topo"
  ---------------------------------------------------------- */
  const backTop = $('#back-top');
  const onScrollTop = () => {
    if (!backTop) return;
    if (window.scrollY > 480) backTop.classList.add('show');
    else backTop.classList.remove('show');
  };
  window.addEventListener('scroll', onScrollTop, { passive: true });
  if (backTop) {
    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  onScrollTop();

  /* ----------------------------------------------------------
     6. Animação de revelação ao rolar
  ---------------------------------------------------------- */
  const revealTargets = $$(
    '.section-header, .about-img-wrap, .about-content, .segment-card, ' +
    '.course-card, .inclusion-card, .schedule-table-wrap, .faq-item, ' +
    '.feature-item, .contact-info, .contact-form, .hero-card, .values-list'
  );
  revealTargets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('visible'));
  }

  /* ----------------------------------------------------------
     7. Validação do formulário de contato
  ---------------------------------------------------------- */
  const form = $('#contact-form');
  if (form) {
    const setError = (group, msg) => {
      group.classList.add('error');
      let errEl = $('.form-error', group);
      if (!errEl) {
        errEl = document.createElement('span');
        errEl.className = 'form-error';
        group.appendChild(errEl);
      }
      errEl.textContent = msg;
    };
    const clearError = (group) => {
      group.classList.remove('error');
      const errEl = $('.form-error', group);
      if (errEl) errEl.textContent = '';
    };

    const successBox = document.createElement('div');
    successBox.className = 'form-success';
    successBox.setAttribute('role', 'status');
    successBox.innerHTML = '<span>✅</span> Mensagem enviada com sucesso! Entraremos em contato em breve.';
    form.prepend(successBox);

    const fields = $$('.form-group', form);
    fields.forEach((group) => {
      const input = $('input, select, textarea', group);
      if (input) {
        input.addEventListener('input', () => clearError(group));
        input.addEventListener('change', () => clearError(group));
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      const required = $$('[required]', form);
      required.forEach((field) => {
        const group = field.closest('.form-group');
        clearError(group);
        const value = (field.value || '').trim();

        if (!value) {
          setError(group, 'Este campo é obrigatório.');
          valid = false;
        } else if (field.type === 'email') {
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRe.test(value)) {
            setError(group, 'Informe um e-mail válido.');
            valid = false;
          }
        }
      });

      if (!valid) {
        const firstError = $('.form-group.error', form);
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Simula envio bem-sucedido
      successBox.classList.add('show');
      form.reset();
      setTimeout(() => successBox.classList.remove('show'), 6000);
    });
  }

  /* ----------------------------------------------------------
     8. Atualiza ano no rodapé (se houver)
  ---------------------------------------------------------- */
  const yearSpan = $('.footer-bottom span');
  // Mantém o conteúdo original; apenas garante consistência do copyright se houver placeholder
})();
