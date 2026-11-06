/* =========================================================
   Leomir Araujo — Landing page
   Interações: header ao rolar, menu mobile, link ativo,
   animação de entrada, formulários, showreel e voltar ao topo.
   ========================================================= */
(function () {
  'use strict';

  const header = document.getElementById('siteHeader');
  const backToTop = document.getElementById('backToTop');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header com sombra + botão voltar ao topo ---------- */
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    backToTop.classList.toggle('is-visible', y > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Fecha o menu mobile ao clicar em um link ---------- */
  const menu = document.getElementById('menuPrincipal');
  if (menu) {
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (menu.classList.contains('show')) {
          bootstrap.Collapse.getOrCreateInstance(menu).hide();
        }
      });
    });
  }

  /* ---------- Destaca o link da seção visível ---------- */
  const navLinks = document.querySelectorAll('.site-header .nav-link[href^="#"]');
  const sections = Array.from(navLinks)
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          const active = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', active);
          if (active) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Animação de entrada (respeita "reduzir movimento") ---------- */
  const reveals = document.querySelectorAll('.reveal');

  // Escalonamento: itens irmãos entram em sequência, não todos de uma vez
  const groups = new Map();
  reveals.forEach(function (el) {
    const key = el.closest('[data-stagger]') || el.parentElement;
    const i = groups.get(key) || 0;
    el.style.setProperty('--d', Math.min(i * 90, 450) + 'ms');
    groups.set(key, i + 1);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Formulários (validação Bootstrap + envio) ----------
     Ordem de envio:
       1) data-table="nome_da_tabela" + js/config.js preenchido → grava no Supabase
       2) data-endpoint="https://..." → envia para outro serviço (Formspree, CRM…)
       3) nenhum dos dois → só simula (útil para testar o layout)
     O campo "website" é uma armadilha para robôs (fica invisível): se vier
     preenchido, o envio é descartado em silêncio.                       */
  const cfg = window.SITE_CONFIG || {};
  const supabaseReady = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);

  function formToRow(form) {
    const row = {};
    new FormData(form).forEach(function (value, key) {
      if (key === 'website') return;
      row[key] = typeof value === 'string' ? value.trim() : value;
    });
    // checkboxes viram booleanos (desmarcado não aparece no FormData)
    form.querySelectorAll('input[type="checkbox"][name]').forEach(function (cb) {
      row[cb.name] = cb.checked;
    });
    Object.keys(row).forEach(function (k) { if (row[k] === '') row[k] = null; });
    return row;
  }

  async function sendToSupabase(table, row) {
    const url = cfg.supabaseUrl.replace(/\/+$/, '') + '/rest/v1/' + encodeURIComponent(table);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: 'Bearer ' + cfg.supabaseAnonKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row)
    });
    if (!response.ok) throw new Error('Supabase ' + response.status);
  }

  document.querySelectorAll('.js-form').forEach(function (form) {
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      event.stopPropagation();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      const button = form.querySelector('[type="submit"]');
      const success = form.querySelector('.form-success');
      const endpoint = form.dataset.endpoint;
      const table = form.dataset.table;
      const trap = form.querySelector('[name="website"]');
      const originalLabel = button.textContent;

      button.disabled = true;
      button.textContent = 'Enviando…';

      try {
        if (trap && trap.value) {
          // robô: finge sucesso sem gravar nada
        } else if (table && supabaseReady) {
          await sendToSupabase(table, formToRow(form));
        } else if (endpoint) {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: new FormData(form)
          });
          if (!response.ok) throw new Error('Falha no envio');
        } else {
          await new Promise(function (r) { setTimeout(r, 600); });
        }
        success.textContent = form.dataset.success || 'Enviado com sucesso.';
        success.classList.remove('d-none', 'alert-danger');
        success.classList.add('alert-success');
        form.reset();
        form.classList.remove('was-validated');
      } catch (err) {
        success.textContent = 'Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.';
        success.classList.remove('d-none', 'alert-success');
        success.classList.add('alert-danger');
      } finally {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    });
  });

  /* ---------- Showreel: carrega o vídeo só ao abrir o modal ---------- */
  const modal = document.getElementById('modalShowreel');
  if (modal) {
    const frame = modal.querySelector('.showreel-frame');
    const placeholder = frame.innerHTML;
    modal.addEventListener('shown.bs.modal', function () {
      const src = frame.dataset.videoSrc;
      if (src) {
        frame.innerHTML = '<iframe src="' + src + '?autoplay=1" title="Showreel de palestras" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
      }
    });
    modal.addEventListener('hidden.bs.modal', function () {
      frame.innerHTML = placeholder; // interrompe o vídeo
    });
  }

  /* ---------- Hero: carrossel de imagens ----------
     Texto por slide (opcional): data-title / data-lead no .carousel-item.
     Sem esses atributos, o slide usa o texto padrão do HTML.            */
  const heroCarousel = document.getElementById('topo');
  if (heroCarousel && heroCarousel.classList.contains('carousel') && window.bootstrap) {
    const items = heroCarousel.querySelectorAll('.carousel-item');
    const bars = heroCarousel.querySelectorAll('.hero-bars button');
    const heroText = document.getElementById('heroText');
    const title = document.getElementById('heroTitle');
    const lead = document.getElementById('heroLead');
    const current = document.getElementById('heroCurrent');
    const total = document.getElementById('heroTotal');
    const defaults = { title: title.innerHTML, lead: lead.innerHTML };
    const pad = function (n) { return String(n).padStart(2, '0'); };
    if (total) total.textContent = pad(items.length);

    const carousel = bootstrap.Carousel.getOrCreateInstance(heroCarousel, {
      interval: 7000, ride: reduceMotion ? false : 'carousel', pause: 'hover'
    });
    if (reduceMotion) carousel.pause();

    // Reinicia a barra ativa (sincroniza com o timer do Bootstrap)
    function restartBar() {
      heroCarousel.classList.remove('run');
      void heroCarousel.offsetWidth;
      heroCarousel.classList.add('run');
    }

    heroCarousel.addEventListener('slide.bs.carousel', function (e) {
      const item = items[e.to];
      const nextTitle = item.dataset.title || defaults.title;
      const nextLead = item.dataset.lead || defaults.lead;
      if (nextTitle === title.innerHTML && nextLead === lead.innerHTML) return;
      heroText.classList.add('is-swapping');
      setTimeout(function () {
        title.innerHTML = nextTitle;
        lead.innerHTML = nextLead;
        heroText.classList.remove('is-swapping');
      }, reduceMotion ? 0 : 450);
    });

    heroCarousel.addEventListener('slid.bs.carousel', function (e) {
      bars.forEach(function (b, i) { b.classList.toggle('done', i < e.to); });
      if (current) current.textContent = pad(e.to + 1);
      restartBar();
    });
    heroCarousel.addEventListener('mouseleave', restartBar);
  }

  /* ---------- Contadores (ex.: 926) ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const fmt = new Intl.NumberFormat('pt-BR');
    const co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1600;
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = fmt.format(Math.round(end * eased));
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!reduceMotion && finePointer) {
    /* ---------- Spotlight: luz que segue o cursor nos cards ---------- */
    document.querySelectorAll('.spotlight').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* ---------- Hero: manchas de luz reagem ao cursor ---------- */
    const hero = document.querySelector('.hero');
    const blobs = hero ? hero.querySelectorAll('[data-parallax]') : [];
    let raf = null;
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          blobs.forEach(function (b) {
            const k = parseFloat(b.dataset.parallax);
            b.style.translate = (x * k * 2) + 'px ' + (y * k * 2) + 'px';
          });
        });
      });
    }
  }

  /* ---------- Ano atual no rodapé ---------- */
  const ano = document.getElementById('anoAtual');
  if (ano) ano.textContent = new Date().getFullYear();
})();
