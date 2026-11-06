/* =========================================================
   Regras do VAAR usadas pela calculadora.
   Atualize este arquivo quando a CIF publicar um novo ciclo.
   Fonte: Resolução CIF nº 24/2026 (ciclo 2026/2027).
   ========================================================= */
window.VAAR_REGRAS = {

  /* Percentual mínimo de diretores providos por mérito (art. 2º, parágrafo único).
     strict: true = precisa ser MAIOR que o mínimo; false = igual ou maior. */
  minimoGestores: {
    '2026': { min: 50,  strict: true,  label: 'mais de 50%' },
    '2027': { min: 70,  strict: true,  label: 'mais de 70%' },
    '2028': { min: 90,  strict: true,  label: 'mais de 90%' },
    '2029': { min: 100, strict: false, label: '100%' }
  },

  /* Texto mostrado abaixo do título para cada ciclo */
  textoCiclo: {
    '2026': 'Ciclo 2026/2027: regras da Resolução CIF nº 24/2026. O prazo de registro no Simec terminou em 31/08/2026; agora correm as diligências.',
    '2027': 'Ciclo 2027/2028: use para se preparar. A CIF ainda vai publicar as regras; o mínimo de diretores por mérito já previsto é de mais de 70%.',
    '2028': 'Ciclo 2028/2029: simulação antecipada. Mínimo previsto de mais de 90% dos diretores providos por mérito.',
    '2029': 'Ciclo 2029/2030: simulação antecipada. Previsão de 100% dos diretores providos por mérito.'
  },

  /* Participação mínima no Saeb (condicionalidade II) e faixa de "margem estreita" */
  saebMinimo: 80,
  saebAtencao: 85,

  /* Computação na Educação Básica: o ato de aprovação deve ser POSTERIOR a esta data */
  dataComputacao: '2022-10-04',

  /* Prazo para responder diligência, em dias */
  diasDiligencia: 15,

  /* Município de exemplo (fictício) usado na demonstração */
  exemplo: {
    cycle: '2026', i_lei: 'sim', i_forma: 'comunidade', i_edital: 'concluido', i_total: '24', i_merito: '14',
    ii_5: '91.2', ii_9: '82.5', iii_res: '', iii_ppi_a: '38', iii_ppi_b: '41.5', iii_nse_a: '35', iii_nse_b: '33.8',
    iv_estado: 'sim', v_bncc: 'habilitado', v_comp: 'sim', v_tipo: 'adesao', v_data: '2023-03-15', p_dil: 'aberta',
    checks: { d_i1: true, d_i3: true, d_v1: true, d_v2: true, p_reg: true, d_p1: true }
  }
};
