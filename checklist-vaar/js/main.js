/* =========================================================
   Checklist VAAR — lógica da calculadora
   As regras ficam em js/regras.js.
   ========================================================= */
(function () {
  'use strict';

  var R = window.VAAR_REGRAS;
  var $ = function (id) { return document.getElementById(id); };
  var STORE = 'checklist-vaar-v1';

  var LABEL = { ok: 'Atende', warn: 'Atenção', bad: 'Não atende', wait: 'Pendente' };
  var CLS = { ok: 's-ok', warn: 's-warn', bad: 's-bad', wait: 's-wait' };
  var NAMES = ['Gestão escolar', 'Participação no Saeb', 'Redução das desigualdades', 'ICMS Educacional', 'BNCC e Computação', 'Prazo e diligências'];
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', '›'];

  var FIELDS = ['cycle', 'i_lei', 'i_forma', 'i_edital', 'i_total', 'i_merito', 'ii_5', 'ii_9', 'iii_res', 'iii_ppi_a', 'iii_ppi_b', 'iii_nse_a', 'iii_nse_b', 'iv_estado', 'v_bncc', 'v_comp', 'v_tipo', 'v_data', 'p_dil'];
  var CHECKS = Array.prototype.map.call(document.querySelectorAll('.docs input[type="checkbox"]'), function (el) { return el.id; }).concat(['p_reg']);

  /* ---------- Utilitários ---------- */
  function num(id) {
    var v = $(id).value;
    if (v === '' || v === null) return null;
    var n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? null : n;
  }
  function fmt(n) { return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }); }
  function dataBR(iso) { return iso.split('-').reverse().join('/'); }
  function msg(id, text, s) {
    var el = $(id);
    if (!text) { el.hidden = true; return; }
    el.hidden = false; el.textContent = text; el.className = 'msg ' + CLS[s];
  }

  /* ---------- I · Gestão escolar ---------- */
  function evalI(t) {
    var lei = $('i_lei').value, forma = $('i_forma').value, edital = $('i_edital').value;
    var total = num('i_total'), merito = num('i_merito');
    var pct = (total && total > 0 && merito !== null) ? Math.min(100, merito / total * 100) : null;

    $('i_fill').style.width = (pct || 0) + '%';
    $('i_mark').style.left = 'calc(' + t.min + '% - 1px)';
    $('i_req').textContent = 'mínimo: ' + t.label;
    $('i_pct').textContent = pct === null ? 'informe os números' : fmt(pct) + '% providos por mérito (' + merito + ' de ' + total + ')';

    if (merito !== null && total !== null && merito > total) {
      msg('i_msg', 'O número de providos por mérito não pode ser maior que o total de gestores.', 'warn');
      return { s: 'warn', acts: ['Corrigir os números de gestores informados.'] };
    }

    var acts = [];
    if (lei === 'nao') acts.push('Aprovar lei própria de provimento de diretores por mérito e desempenho.');
    if (forma === 'outra') acts.push('Rever a norma: provimento por “outra forma” inabilita a rede.');
    if (edital === 'nao') acts.push('Publicar e concluir edital de processo seletivo para diretores.');
    if (edital === 'andamento') acts.push('Concluir o processo seletivo antes do registro: o edital precisa estar concluído.');

    var passPct = null;
    if (pct !== null) {
      /* Regra do ciclo 2026/2027: rede com 2 diretores e 1 por mérito é considerada habilitada */
      var special = (t.min === 50 && total === 2 && merito >= 1);
      passPct = special || (t.strict ? pct > t.min : pct >= t.min);
      if (!passPct) {
        var need = t.strict ? Math.floor(total * t.min / 100) + 1 : total;
        acts.push('Prover por mérito ao menos ' + need + ' de ' + total + ' diretores (faltam ' + Math.max(0, need - merito) + ').');
      }
    }

    var s;
    if (lei === 'nao' || forma === 'outra' || edital === 'nao' || passPct === false) s = 'bad';
    else if (!lei || !forma || !edital || pct === null) s = 'wait';
    else if (edital === 'andamento') s = 'warn';
    else s = 'ok';

    /* Alerta para o próximo ciclo, quando o mínimo sobe */
    var text = '';
    if (passPct === true && $('cycle').value === '2026') {
      var prox = R.minimoGestores['2027'];
      var nextNeed = Math.floor(total * prox.min / 100) + 1;
      if (pct <= prox.min) {
        text = 'Atende o ciclo 2026/2027, mas no ciclo 2027/2028 o mínimo sobe para ' + prox.label + ': serão ' + nextNeed + ' diretores por mérito.';
        if (s === 'ok') s = 'warn';
        acts.push('Planejar novo processo seletivo: para 2027/2028 serão necessários ' + nextNeed + ' diretores por mérito.');
      }
    }
    msg('i_msg', text, s === 'bad' ? 'bad' : 'warn');
    return { s: s, acts: acts };
  }

  /* ---------- II · Participação no Saeb ---------- */
  function evalII() {
    var vals = [];
    var v5 = num('ii_5'), v9 = num('ii_9');
    if (v5 !== null) vals.push(['5º ano', v5]);
    if (v9 !== null) vals.push(['9º ano', v9]);
    if (!vals.length) { msg('ii_msg', '', 'wait'); return { s: 'wait', acts: [] }; }

    var low = vals.filter(function (x) { return x[1] < R.saebMinimo; });
    var tight = vals.filter(function (x) { return x[1] >= R.saebMinimo && x[1] < R.saebAtencao; });
    var nomes = function (arr) { return arr.map(function (x) { return x[0]; }).join(' e '); };
    var detalhe = function (arr) { return arr.map(function (x) { return x[0] + ' (' + fmt(x[1]) + '%)'; }).join(', '); };

    if (low.length) {
      msg('ii_msg', 'Abaixo de ' + R.saebMinimo + '% em: ' + detalhe(low) + '.', 'bad');
      return { s: 'bad', acts: ['Montar plano de mobilização para o próximo Saeb no ' + nomes(low) + '.'] };
    }
    if (tight.length) {
      msg('ii_msg', 'Margem estreita em: ' + detalhe(tight) + '. Poucas faltas no dia da prova podem derrubar a rede.', 'warn');
      return { s: 'warn', acts: ['Reforçar a mobilização no ' + nomes(tight) + ', que ficou entre ' + R.saebMinimo + '% e ' + R.saebAtencao + '%.'] };
    }
    msg('ii_msg', '', 'ok');
    return { s: 'ok', acts: [] };
  }

  /* ---------- III · Redução das desigualdades ---------- */
  function evalIII() {
    var res = $('iii_res').value;
    var pa = num('iii_ppi_a'), pb = num('iii_ppi_b'), na = num('iii_nse_a'), nb = num('iii_nse_b');
    var trend = [];
    if (pa !== null && pb !== null) trend.push(['pretos, pardos e indígenas', pb - pa]);
    if (na !== null && nb !== null) trend.push(['nível socioeconômico baixo', nb - na]);

    var falling = trend.filter(function (x) { return x[1] < 0; });
    var tText = trend.map(function (x) { return x[0] + ': ' + (x[1] >= 0 ? '+' : '') + fmt(x[1]) + ' p.p.'; }).join(' · ');
    var acts = [];
    if (falling.length) acts.push('Priorizar recomposição da aprendizagem para ' + falling.map(function (x) { return x[0]; }).join(' e ') + '.');

    if (res === 'sim') {
      msg('iii_msg', tText ? 'Tendência informada: ' + tText + '.' : '', 'ok');
      return { s: 'ok', acts: acts };
    }
    if (res === 'nao') {
      msg('iii_msg', 'Esta é a principal causa de inabilitação no país.' + (tText ? ' Tendência informada: ' + tText + '.' : ''), 'bad');
      return { s: 'bad', acts: acts.length ? acts : ['Montar plano de recomposição da aprendizagem com foco nos grupos com menor resultado.'] };
    }
    if (falling.length) {
      msg('iii_msg', 'Simulação: queda em ' + falling.map(function (x) { return x[0] + ' (' + fmt(x[1]) + ' p.p.)'; }).join(' e ') + '. O Inep tolera variações dentro de uma margem que diminui conforme o tamanho da rede; quedas aumentam o risco.', 'warn');
      return { s: 'warn', acts: acts };
    }
    msg('iii_msg', trend.length ? 'Simulação: ' + tText + '. Tendência favorável, mas a apuração oficial é do Inep.' : '', 'wait');
    return { s: 'wait', acts: acts };
  }

  /* ---------- IV · ICMS Educacional ---------- */
  function evalIV() {
    var v = $('iv_estado').value;
    if (v === 'sim') { msg('iv_msg', '', 'ok'); return { s: 'ok', acts: [] }; }
    if (v === 'nao') {
      msg('iv_msg', 'O município depende da habilitação do estado nesta condicionalidade.', 'bad');
      return { s: 'bad', acts: ['Acionar a Undime estadual e a secretaria estadual sobre a lei e o registro do ICMS Educacional.'] };
    }
    msg('iv_msg', '', 'wait');
    return { s: 'wait', acts: ['Confirmar com a secretaria estadual se o estado foi habilitado no ICMS Educacional.'] };
  }

  /* ---------- V · BNCC e Computação ---------- */
  function evalV() {
    var bncc = $('v_bncc').value, comp = $('v_comp').value, tipo = $('v_tipo').value, data = $('v_data').value;
    var acts = [];
    var dateOk = data ? data > R.dataComputacao : null;

    if (bncc === 'nao') acts.push('Aprovar no conselho do sistema de ensino o referencial alinhado à BNCC.');
    if (comp === 'nao') acts.push('Incluir Computação no referencial, por adesão ao estadual ou documento próprio, e aprovar o ato.');
    if (comp === 'sim' && data && !dateOk) acts.push('Aprovar novo ato para Computação: a data precisa ser posterior a ' + dataBR(R.dataComputacao) + '.');
    if (comp === 'sim' && !data) acts.push('Localizar o ato de aprovação do referencial de Computação e sua data.');

    var s;
    if (bncc === 'nao' || comp === 'nao' || dateOk === false) s = 'bad';
    else if (!bncc || !comp || !tipo || !data) s = 'wait';
    else s = 'ok';

    if (dateOk === false) msg('v_msg', 'Ato de aprovação em ' + dataBR(data) + ': anterior a ' + dataBR(R.dataComputacao) + ' inabilita.', 'bad');
    else if (comp === 'nao') msg('v_msg', 'Desde o ciclo 2026/2027, referencial sem Computação inabilita a rede.', 'bad');
    else msg('v_msg', '', s);
    return { s: s, acts: acts };
  }

  /* ---------- Prazo e diligências ---------- */
  function evalP() {
    var reg = $('p_reg').checked, dil = $('p_dil').value, acts = [];
    if (dil === 'perdida') {
      msg('p_msg', 'Prazo de diligência vencido sem resposta leva à inabilitação.', 'bad');
      return { s: 'bad', acts: ['Verificar no Simec se ainda há como responder e registrar a situação para o CACS.'] };
    }
    if (dil === 'aberta') {
      msg('p_msg', 'Responda pelo Simec: são ' + R.diasDiligencia + ' dias contados do envio do comunicado.', 'warn');
      acts.push('Responder a diligência no Simec dentro de ' + R.diasDiligencia + ' dias do envio.');
    } else {
      msg('p_msg', '', 'ok');
    }
    if (!reg) {
      acts.unshift('Registrar as condicionalidades I e V no Simec dentro do prazo do ciclo.');
      return { s: $('cycle').value === '2026' ? 'bad' : 'wait', acts: acts };
    }
    return { s: dil === 'aberta' ? 'warn' : 'ok', acts: acts };
  }

  /* ---------- Veredito geral ---------- */
  function overall(list) {
    var ss = list.map(function (r) { return r.s; });
    if (ss.indexOf('bad') > -1) return { text: 'Inabilitação provável', s: 'bad' };
    if (ss.indexOf('warn') > -1) return { text: 'Habilitável, com pontos de atenção', s: 'warn' };
    var gestao = [ss[0], ss[3], ss[4], ss[5]];
    if (gestao.indexOf('wait') > -1) return { text: 'Faltam informações para concluir', s: 'wait' };
    if (ss[1] === 'wait' || ss[2] === 'wait') return { text: 'Gestão em dia; aguarda o Inep (II e III)', s: 'wait' };
    return { text: 'Habilitável em todas as condicionalidades', s: 'ok' };
  }

  /* ---------- Desenho da tela ---------- */
  var lastSummary = '';
  function render() {
    var c = $('cycle').value, t = R.minimoGestores[c];
    $('cycleHint').textContent = R.textoCiclo[c];

    var res = [evalI(t), evalII(), evalIII(), evalIV(), evalV(), evalP()];
    var ov = overall(res);
    var v = $('verdict');
    v.textContent = ov.text;
    v.style.color = 'var(--' + ov.s + ')';

    var chips = '', rows = '';
    res.forEach(function (r, i) {
      var badge = document.querySelector('[data-status="' + (i + 1) + '"]');
      badge.textContent = LABEL[r.s];
      badge.className = 'status ' + CLS[r.s];
      if (i < 5) chips += '<div class="chip ' + CLS[r.s] + '">' + ROMAN[i] + '<small>' + LABEL[r.s] + '</small></div>';
      rows += '<div class="r-row"><span>' + (i < 5 ? ROMAN[i] + ' · ' : '') + NAMES[i] + '</span><span class="status ' + CLS[r.s] + '">' + LABEL[r.s] + '</span></div>';
    });
    $('chips').innerHTML = chips;
    $('rows').innerHTML = rows;

    /* Ações ordenadas pela gravidade */
    var acts = [];
    ['bad', 'warn', 'wait', 'ok'].forEach(function (lvl) {
      res.forEach(function (r) { if (r.s === lvl) r.acts.forEach(function (a) { if (acts.indexOf(a) < 0) acts.push(a); }); });
    });
    var top = acts.slice(0, 7);
    $('actions').innerHTML = top.map(function (a) { return '<li>' + a.replace(/</g, '&lt;') + '</li>'; }).join('');
    $('actions').hidden = !top.length;
    $('noActions').hidden = !!top.length;

    /* Contadores dos documentos */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var boxes = document.querySelectorAll('[data-group="' + el.dataset.count + '"] input[type="checkbox"]');
      var done = Array.prototype.filter.call(boxes, function (b) { return b.checked; }).length;
      el.textContent = done + ' de ' + boxes.length;
    });

    var sel = $('cycle');
    lastSummary = 'Checklist VAAR — ' + sel.options[sel.selectedIndex].text +
      '\nResultado indicativo: ' + ov.text + '\n\n' +
      res.map(function (r, i) { return (i < 5 ? ROMAN[i] + ' ' : '') + NAMES[i] + ': ' + LABEL[r.s]; }).join('\n') +
      (top.length ? '\n\nPrioridades:\n' + top.map(function (a, i) { return (i + 1) + '. ' + a; }).join('\n') : '') +
      '\n\nResultado indicativo; a habilitação oficial é do MEC e do Inep. Fonte: Resolução CIF nº 24/2026.';
    save();
  }

  /* ---------- Salvar no navegador ---------- */
  var isExample = true;
  function snapshot() {
    var o = { checks: {} };
    FIELDS.forEach(function (f) { o[f] = $(f).value; });
    CHECKS.forEach(function (c) { o.checks[c] = $(c).checked; });
    return o;
  }
  function apply(o) {
    FIELDS.forEach(function (f) { if (o[f] !== undefined) $(f).value = o[f]; });
    CHECKS.forEach(function (c) { $(c).checked = !!(o.checks && o.checks[c]); });
  }
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ data: snapshot(), example: isExample })); } catch (e) {} }
  function load() { try { var raw = localStorage.getItem(STORE); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }
  function setExampleNote() {
    $('exampleNote').textContent = isExample ? 'Preenchido com um município de exemplo.' : 'Respostas da sua rede, guardadas só neste navegador.';
  }

  var saved = load();
  if (saved && saved.data) { apply(saved.data); isExample = !!saved.example; }
  else apply(R.exemplo);
  setExampleNote();

  /* ---------- Eventos ---------- */
  function onChange(e) {
    if (e.target.closest('#calc') || e.target.id === 'cycle') {
      isExample = false; setExampleNote(); render();
    }
  }
  document.addEventListener('input', onChange);
  document.addEventListener('change', onChange);
  $('calc').addEventListener('submit', function (e) { e.preventDefault(); });

  $('btnClear').addEventListener('click', function () {
    var cyc = $('cycle').value;
    FIELDS.forEach(function (f) { $(f).value = ''; });
    $('cycle').value = cyc;
    $('p_dil').value = 'nenhuma';
    CHECKS.forEach(function (c) { $(c).checked = false; });
    isExample = false; setExampleNote(); render();
    $('i_lei').focus();
  });

  $('btnExample').addEventListener('click', function () {
    apply(R.exemplo); isExample = true; setExampleNote(); render();
  });

  $('btnCopy').addEventListener('click', function () {
    var toast = $('toast'), fb = $('copyFallback');
    function fallback() {
      fb.hidden = false; fb.value = lastSummary; fb.focus(); fb.select();
      toast.textContent = 'Selecione o texto abaixo e copie.';
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastSummary).then(function () {
        fb.hidden = true; toast.textContent = 'Resumo copiado.';
        setTimeout(function () { toast.textContent = ''; }, 2500);
      }).catch(fallback);
    } else fallback();
  });

  /* Impressão: abre todos os checklists antes de imprimir */
  $('btnPrint').addEventListener('click', function () { window.print(); });
  var openedForPrint = [];
  window.addEventListener('beforeprint', function () {
    openedForPrint = Array.prototype.filter.call(document.querySelectorAll('details.docs'), function (d) { return !d.open; });
    openedForPrint.forEach(function (d) { d.open = true; });
  });
  window.addEventListener('afterprint', function () { openedForPrint.forEach(function (d) { d.open = false; }); });

  /* Tema claro/escuro */
  $('btnTema').addEventListener('click', function () {
    var root = document.documentElement;
    var next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-bs-theme', next);
    try { localStorage.setItem('checklist-vaar-tema', next); } catch (e) {}
  });

  /* Menu em pílula: fica mais sólido ao rolar (mesmo comportamento do site) */
  var header = $('siteHeader');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  render();
})();
