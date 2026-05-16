(function (window, document) {
  'use strict';

  const state = {
    cv: {}, rawText: '', jdText: '', analysis: null, selectedFormat: 'ats-simple', demoIndex: Math.floor(Math.random() * window.CVOTemplates.DEMO_EXAMPLES.length), lastDemoId: null, salaryResult: null
  };

  const FIELD_CONFIG = [
    ['name', 'Nombre', 'compact'], ['email', 'Email', 'compact'], ['phone', 'Teléfono', 'compact'], ['linkedin', 'LinkedIn', 'compact'], ['github', 'GitHub / portfolio', 'compact'], ['portfolio', 'Web personal', 'compact'],
    ['profile', 'Perfil profesional'], ['experience', 'Experiencia'], ['education', 'Educación'], ['skills', 'Competencias'], ['certifications', 'Certificaciones'], ['projects', 'Proyectos'], ['languages', 'Idiomas'], ['awards', 'Premios u otros'], ['other', 'Otros']
  ];

  const SALARY_SECTORS = [
    ['general', 'General'], ['tech', 'Tecnología'], ['finance', 'Finanzas'], ['industrial', 'Ingeniería / industrial'], ['consulting', 'Consultoría'], ['public', 'Público / regulado'], ['startup', 'Startup'], ['academia', 'Academia / investigación'], ['mssp', 'MSSP / ciberseguridad']
  ];

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const lang = () => window.CVOi18n?.getLanguage?.() || 'es';

  function setStatus(message, type) {
    const node = $('#cv-status');
    if (!node) return;
    node.textContent = message || '';
    node.className = `status ${type || ''}`;
  }

  function optionLabel(item) {
    return item[lang()] || item.es || item.en || item.name || item.id;
  }

  function fillSelect(selector, items, selected) {
    const node = $(selector);
    if (!node) return;
    node.innerHTML = items.map((item) => `<option value="${item.id}">${optionLabel(item)}</option>`).join('');
    if (selected) node.value = selected;
  }

  function fillSalaryControls() {
    if (!window.CVOSalary) return;
    $('#salary-country').innerHTML = window.CVOSalary.COUNTRIES.map((country) => `<option value="${country.code}" data-currency="${country.currency}">${country.name}${country.supported ? ' · baseline' : ' · assisted'}</option>`).join('');
    $('#salary-currency').innerHTML = window.CVOSalary.CURRENCIES.map((currency) => `<option value="${currency}">${currency}</option>`).join('');
    $('#salary-role').innerHTML = window.CVOSalary.ROLE_OPTIONS.map((role) => `<option value="${role.id}">${role.label[lang()] || role.label.es}</option>`).join('');
    $('#salary-seniority').innerHTML = Object.entries(window.CVOSalary.SENIORITY).map(([id, value]) => `<option value="${id}">${value.label[lang()] || value.label.es}</option>`).join('');
    $('#salary-seniority').insertAdjacentHTML('afterbegin', '<option value="auto">Automático desde CV</option>');
    $('#salary-experience').innerHTML = window.CVOSalary.EXPERIENCE_OPTIONS.map((item) => `<option value="${item.value}">${item.label[lang()] || item.label.es}</option>`).join('');
    $('#salary-sector').innerHTML = SALARY_SECTORS.map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
    $('#salary-country').value = 'ES';
    syncSalaryCurrency();
  }

  function fillContextControls() {
    fillSelect('#sector', window.CVOTemplates.SECTORS, 'technology');
    fillSelect('#level', window.CVOTemplates.LEVELS, 'junior');
    fillSelect('#target-country', window.CVOTemplates.TARGET_COUNTRIES, 'ES');
  }

  function getContextOptions() {
    return {
      targetRole: $('#target-role')?.value.trim() || '',
      customRole: $('#target-role')?.value.trim() || '',
      roles: [],
      sector: $('#sector')?.value || 'technology',
      level: $('#level')?.value || 'junior',
      country: $('#target-country')?.value || 'ES',
      lang: $('#cv-language')?.value || lang(),
      formatId: state.selectedFormat
    };
  }

  function activateTab(id) {
    $$('.module-card').forEach((button) => button.classList.toggle('active', button.dataset.tab === id));
    $$('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.id === `panel-${id}`));
  }

  function confidenceLabel(value) {
    const map = { high: 'Alta', medium: 'Media', low: 'Revisar', missing: 'No detectado' };
    return map[value] || map.missing;
  }

  function renderStructured() {
    const container = $('#structured-fields');
    if (!container) return;
    const confidence = state.cv.confidence || {};
    container.innerHTML = FIELD_CONFIG.map(([key, label, compact]) => {
      const value = state.cv[key] || '';
      const conf = confidence[key] || (value ? 'medium' : 'missing');
      return `<div class="field-box ${compact || ''}">
        <label for="field-${key}">${label}<span class="confidence ${conf}">${confidenceLabel(conf)}</span></label>
        <textarea id="field-${key}" data-field="${key}" placeholder="${conf === 'missing' ? 'No detectado. Puedes completarlo manualmente.' : ''}">${window.CVOAnalyzer.escapeHtml(value)}</textarea>
      </div>`;
    }).join('');
  }

  function applyStructuredFields() {
    $$('#structured-fields [data-field]').forEach((node) => {
      state.cv[node.dataset.field] = node.value.trim();
      state.cv.confidence = state.cv.confidence || {};
      state.cv.confidence[node.dataset.field] = node.value.trim() ? 'high' : 'missing';
    });
  }

  function renderPreview() {
    applyStructuredFields();
    const options = getContextOptions();
    options.formatId = state.selectedFormat;
    $('#cv-output').innerHTML = window.CVOFormatter.generateCVHtml(state.cv, options);
    const format = window.CVOTemplates.CV_FORMATS.find((item) => item.id === state.selectedFormat);
    $('#format-description').textContent = format ? `${format.name[lang()] || format.name.es} · ${format.short[lang()] || format.short.es}` : '';
  }

  function renderFormats() {
    const options = getContextOptions();
    const recommendations = window.CVOAnalyzer.evaluateFormats(state.cv || {}, options, $('#job-description')?.value || '');
    $('#format-cards').innerHTML = recommendations.map((format) => {
      const badgeText = format.rating === 'green' ? 'Recomendado' : format.rating === 'orange' ? 'Posible' : 'Poco recomendable';
      return `<button type="button" class="format-card ${state.selectedFormat === format.id ? 'active' : ''}" data-format="${format.id}">
        <span class="badge ${format.rating}">${badgeText}</span>
        <h3>${format.name[lang()] || format.name.es}</h3>
        <p>${format.short[lang()] || format.short.es}</p>
        <p><strong>${format.reason}</strong></p>
      </button>`;
    }).join('');
  }

  function selectFormat(id) {
    state.selectedFormat = id;
    renderFormats();
    renderPreview();
  }

  function recommendFormatOnly() {
    applyStructuredFields();
    const recommendation = window.CVOAnalyzer.recommendFormat(state.cv || {}, getContextOptions(), $('#job-description')?.value || '');
    selectFormat(recommendation.id);
    setStatus(`Formato recomendado: ${recommendation.name[lang()] || recommendation.name.es}.`, 'success');
  }

  async function parseFromCurrentText() {
    const text = $('#manual-cv').value.trim();
    if (!text) {
      setStatus('Pega o sube un CV antes de analizar.', 'warning');
      return;
    }
    state.rawText = text;
    state.cv = window.CVOParser.parseCVText(text);
    renderStructured();
    recommendFormatOnly();
    renderPreview();
    setStatus('CV interpretado. Revisa los campos con confianza baja.', 'success');
  }

  async function loadCvFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus('Leyendo archivo...', '');
    try {
      const text = await window.CVOParser.extractTextFromFile(file);
      if (!text || text.length < 20) throw new Error('No text extracted');
      $('#manual-cv').value = text;
      await parseFromCurrentText();
    } catch (error) {
      console.error(error);
      setStatus('No se pudo leer bien el archivo. Prueba a pegar el texto o usar modo manual.', 'error');
    }
  }

  async function loadJdFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    $('#job-description').value = (await file.text()).trim();
  }

  function loadDemo() {
    const demos = window.CVOTemplates.DEMO_EXAMPLES;
    let demo = demos[state.demoIndex % demos.length];
    if (demo.id === state.lastDemoId) {
      state.demoIndex += 1;
      demo = demos[state.demoIndex % demos.length];
    }
    state.lastDemoId = demo.id;
    state.demoIndex += 1;

    $('#manual-cv').value = demo.cv;
    $('#job-description').value = demo.jd;
    $('#target-role').value = demo.title;
    $('#sector').value = demo.sector;
    $('#level').value = demo.level;
    $('#target-country').value = demo.country;
    $('#salary-country').value = demo.country;
    syncSalaryCurrency();
    $('#salary-role').value = demo.salaryRole || 'auto';
    $('#salary-seniority').value = demo.level === 'juniorPlus' ? 'juniorPlus' : demo.level;
    $('#salary-reference-low').value = demo.salaryLow || '';
    $('#salary-reference-high').value = demo.salaryHigh || '';
    if (demo.currency) $('#salary-currency').value = demo.currency;
    parseFromCurrentText();
    setStatus(`Ejemplo cargado: ${demo.title}`, 'success');
  }

  function loadSampleJd() {
    const demos = window.CVOTemplates.DEMO_EXAMPLES;
    const demo = demos[state.demoIndex % demos.length];
    state.demoIndex += 1;
    $('#job-description').value = demo.jd;
    $('#target-role').value = demo.title;
    $('#sector').value = demo.sector;
    $('#level').value = demo.level;
    $('#target-country').value = demo.country;
  }

  function renderTagList(items) {
    if (!items || !items.length) return '<p class="hint">Sin elementos detectados.</p>';
    return `<div class="tag-list">${items.slice(0, 18).map((item) => `<span class="tag">${window.CVOAnalyzer.escapeHtml(item)}</span>`).join('')}</div>`;
  }

  function renderList(title, items) {
    return `<div class="list-card"><h3>${title}</h3>${items?.length ? `<ul>${items.map((item) => `<li>${window.CVOAnalyzer.escapeHtml(item)}</li>`).join('')}</ul>` : '<p class="hint">Sin incidencias.</p>'}</div>`;
  }

  function renderAnalysis(analysis) {
    const output = $('#analysis-output');
    output.classList.remove('empty');
    output.innerHTML = `
      <div class="score-ring" style="--score:${analysis.score}"><span>${analysis.score}</span></div>
      <div class="metrics-grid">
        <div class="info-card"><strong>${analysis.completeness}%</strong><span>Completitud</span></div>
        <div class="info-card"><strong>${analysis.keywordScore}%</strong><span>Matching keywords</span></div>
        <div class="info-card"><strong>${analysis.metrics.length}</strong><span>Métricas detectadas</span></div>
      </div>
      <div class="recommendation-grid">
        <div class="list-card"><h3>Keywords encontradas</h3>${renderTagList(analysis.foundKeywords)}</div>
        <div class="list-card"><h3>Keywords faltantes</h3>${renderTagList(analysis.missingKeywords)}</div>
        ${renderList('Secciones incompletas', analysis.incompleteSections)}
        ${renderList('Riesgos', analysis.risks)}
        ${renderList('Recomendaciones', analysis.recommendations)}
        <div class="list-card"><h3>Bullets mejorables</h3>${analysis.bulletImprovements.length ? `<ul>${analysis.bulletImprovements.map((item) => `<li><strong>${window.CVOAnalyzer.escapeHtml(item.original)}</strong><br>${window.CVOAnalyzer.escapeHtml(item.suggestion)}</li>`).join('')}</ul>` : '<p class="hint">No se han detectado bullets débiles claros.</p>'}</div>
      </div>
      <p class="hint"><strong>Formato recomendado:</strong> ${analysis.formatRecommendation.name[lang()] || analysis.formatRecommendation.name.es}.</p>`;
  }

  function analyzeATS() {
    applyStructuredFields();
    const jd = $('#job-description').value.trim();
    state.jdText = jd;
    state.analysis = window.CVOAnalyzer.analyze(state.cv || {}, jd, getContextOptions());
    renderAnalysis(state.analysis);
    state.selectedFormat = state.analysis.formatRecommendation.id;
    renderFormats();
    renderPreview();
    activateTab('ats');
  }

  function buildAiPrompt() {
    applyStructuredFields();
    const analysis = state.analysis || window.CVOAnalyzer.analyze(state.cv || {}, $('#job-description').value.trim(), getContextOptions());
    const prompt = window.CVOAnalyzer.buildAiPrompt(state.cv || {}, $('#job-description').value.trim(), analysis, getContextOptions());
    $('#ai-prompt-output').value = prompt;
    $('#ai-prompt-output').classList.remove('hidden');
  }

  function useRawText() {
    const raw = $('#manual-cv').value.trim();
    if (!raw) return;
    state.cv.other = raw;
    state.cv.confidence = state.cv.confidence || {};
    state.cv.confidence.other = 'low';
    renderStructured();
    renderPreview();
    setStatus('Texto sin estructurar añadido en una única sección para evitar duplicados.', 'warning');
  }

  function exportPdf() {
    const text = window.CVOFormatter.readFinalCvText($('#cv-output'));
    if (!text) { setStatus('Genera una vista previa antes de exportar.', 'warning'); return; }
    window.CVOExporter.exportPDF(text, state.cv.name || 'optimized-cv');
  }

  async function exportDocx() {
    const text = window.CVOFormatter.readFinalCvText($('#cv-output'));
    if (!text) { setStatus('Genera una vista previa antes de exportar.', 'warning'); return; }
    await window.CVOExporter.exportDOCX(text, state.cv.name || 'optimized-cv');
  }

  function syncSalaryCurrency() {
    if (!window.CVOSalary) return;
    const country = window.CVOSalary.getCountry($('#salary-country').value);
    if (country?.currency && country.currency !== 'OTHER') $('#salary-currency').value = country.currency;
    if (!country?.supported) $('#salary-mode').value = 'assisted';
  }

  function detectSalaryFromCv() {
    const options = getContextOptions();
    const roleText = window.CVOAnalyzer.normalize(`${window.CVOAnalyzer.flattenCv(state.cv)} ${options.targetRole}`);
    if (/soc|siem|security operations/.test(roleText)) $('#salary-role').value = 'soc';
    else if (/cyber|security|incident|grc/.test(roleText)) $('#salary-role').value = 'cybersecurity';
    else if (/data|sql|power bi|analytics/.test(roleText)) $('#salary-role').value = 'data';
    else if (/process|engineer|ingenier|industrial|p&id|desal/.test(roleText)) $('#salary-role').value = 'engineering';
    else if (/project|consultant|stakeholder|scrum/.test(roleText)) $('#salary-role').value = 'project';
    else if (/marketing|communication|content|seo/.test(roleText)) $('#salary-role').value = 'business';
    else $('#salary-role').value = 'auto';
    setStatus('Familia salarial estimada desde el CV.', 'success');
  }

  function warningText(code) {
    const map = {
      unsupportedCountry: 'País sin baseline interno: usa modo asistido con un rango local real.',
      baselineIsIndicative: 'Baseline interno aproximado: contrástalo con fuentes salariales locales.',
      assistedUsesUserRange: 'Modo asistido: la banda se deriva del rango local que has introducido.',
      missingRole: 'Falta rol objetivo: la estimación será menos precisa.',
      weakCvImpact: 'ATS bajo: un CV débil puede reducir margen negociador.',
      customCountry: 'País personalizado: la precisión depende del rango manual.'
    };
    return map[code] || code;
  }

  function calculateSalary() {
    const inputs = {
      country: $('#salary-country').value,
      currency: $('#salary-currency').value,
      period: $('#salary-period').value,
      mode: $('#salary-mode').value,
      role: $('#salary-role').value,
      seniority: $('#salary-seniority').value,
      experience: $('#salary-experience').value,
      strategy: $('#salary-strategy').value,
      sector: $('#salary-sector').value,
      workMode: $('#salary-work-mode').value,
      companyType: $('#salary-company-type').value,
      referenceLow: $('#salary-reference-low').value,
      referenceHigh: $('#salary-reference-high').value
    };
    state.salaryResult = window.CVOSalary.estimate(state.cv || {}, state.analysis, getContextOptions(), inputs);
    renderSalary(state.salaryResult, inputs);
  }

  function renderSalary(result, inputs) {
    const output = $('#salary-output');
    output.classList.remove('empty');
    if (result.status === 'needsReference') {
      output.innerHTML = `<div class="list-card"><h3>Falta rango local</h3><p>Este país o combinación requiere modo asistido. Introduce un mínimo y máximo vistos en ofertas comparables.</p></div>`;
      return;
    }
    const period = result.period || inputs.period || 'annual';
    output.innerHTML = `
      <div class="salary-bands">
        <div class="salary-band red"><strong>Rojo · bajo mercado</strong><div class="amount">${window.CVOSalary.formatRange(result.ranges.red, result.currency, period)}</div><p>Evitar salvo aprendizaje, urgencia o beneficios extraordinarios.</p></div>
        <div class="salary-band orange"><strong>Naranja · razonable</strong><div class="amount">${window.CVOSalary.formatRange(result.ranges.orange, result.currency, period)}</div><p>Banda defendible si el perfil encaja de forma parcial o normal.</p></div>
        <div class="salary-band green"><strong>Verde · recomendado</strong><div class="amount">${window.CVOSalary.formatRange(result.ranges.green, result.currency, period)}</div><p>Objetivo de negociación si hay buen matching, herramientas y evidencias.</p></div>
      </div>
      <div class="salary-notes">
        <p><strong>Fuente de cálculo:</strong> ${result.source === 'baseline' ? 'tabla interna de mercado aproximado' : 'rango local introducido por el usuario'} · <strong>seniority:</strong> ${result.seniorityLabel?.[lang()] || result.seniority} · <strong>factor perfil:</strong> ${result.profileFactor.toFixed(2)}.</p>
        <ul>${(result.warnings || []).map((warning) => `<li>${warningText(warning)}</li>`).join('')}</ul>
        <p>Estimación orientativa. No sustituye fuentes salariales locales ni negociación real.</p>
      </div>`;
  }

  function clearAll() {
    state.cv = {}; state.rawText = ''; state.jdText = ''; state.analysis = null; state.selectedFormat = 'ats-simple'; state.salaryResult = null;
    $('#manual-cv').value = ''; $('#job-description').value = ''; $('#target-role').value = '';
    $('#structured-fields').innerHTML = ''; $('#cv-output').innerHTML = ''; $('#ai-prompt-output').value = ''; $('#ai-prompt-output').classList.add('hidden');
    $('#analysis-output').className = 'analysis-output empty'; $('#analysis-output').textContent = 'Carga un CV y una oferta para ver el análisis.';
    $('#salary-output').className = 'salary-output empty'; $('#salary-output').textContent = 'Introduce el contexto y calcula para ver las bandas.';
    renderFormats(); setStatus('', '');
  }

  function bindEvents() {
    $$('.module-card').forEach((button) => button.addEventListener('click', () => activateTab(button.dataset.tab)));
    $$('[data-go-tab]').forEach((button) => button.addEventListener('click', () => activateTab(button.dataset.goTab)));
    $('#theme-toggle').addEventListener('click', () => document.body.classList.toggle('dark'));
    $('#lang-es').addEventListener('click', () => changeLanguage('es'));
    $('#lang-en').addEventListener('click', () => changeLanguage('en'));
    $('#cv-file').addEventListener('change', loadCvFile);
    $('#jd-file').addEventListener('change', loadJdFile);
    $('#parse-cv').addEventListener('click', parseFromCurrentText);
    $('#load-demo').addEventListener('click', loadDemo);
    $('#clear-all').addEventListener('click', clearAll);
    $('#save-fields').addEventListener('click', () => { applyStructuredFields(); renderPreview(); setStatus('Cambios aplicados.', 'success'); });
    $('#use-raw').addEventListener('click', useRawText);
    $('#regenerate-preview').addEventListener('click', renderPreview);
    $('#recommend-format').addEventListener('click', recommendFormatOnly);
    $('#format-cards').addEventListener('click', (event) => {
      const card = event.target.closest('[data-format]');
      if (card) selectFormat(card.dataset.format);
    });
    $('#analyze-ats').addEventListener('click', analyzeATS);
    $('#sample-jd').addEventListener('click', loadSampleJd);
    $('#build-ai-prompt').addEventListener('click', buildAiPrompt);
    $('#export-pdf').addEventListener('click', exportPdf);
    $('#export-docx').addEventListener('click', exportDocx);
    $('#salary-country').addEventListener('change', syncSalaryCurrency);
    $('#salary-from-cv').addEventListener('click', detectSalaryFromCv);
    $('#calculate-salary').addEventListener('click', calculateSalary);
    ['sector', 'level', 'target-country', 'cv-language'].forEach((id) => {
      $(`#${id}`)?.addEventListener('change', () => { renderFormats(); renderPreview(); });
    });
  }

  function changeLanguage(nextLang) {
    window.CVOi18n.setLanguage(nextLang);
    fillContextControls();
    fillSalaryControls();
    renderFormats();
    renderPreview();
  }

  function init() {
    fillContextControls();
    fillSalaryControls();
    renderFormats();
    bindEvents();
    window.CVOi18n.setLanguage('es');
    $('#cv-output').innerHTML = '<p class="hint">Carga un CV para generar una vista previa editable.</p>';
  }

  document.addEventListener('DOMContentLoaded', init);
})(window, document);
