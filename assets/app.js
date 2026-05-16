(function (window, document) {
  'use strict';

  const state = {
    cvText: '',
    jdText: '',
    cv: {},
    analysis: null,
    salaryResult: null,
    demoIndex: Math.floor(Math.random() * window.CVOTemplates.DEMO_EXAMPLES.length),
    lastDemoId: null,
    photoDataUrl: ''
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const t = (key) => window.CVOi18n.t(key);

  function setStatus(message, type) {
    const node = $('#cv-status');
    node.textContent = message || '';
    node.className = `status ${type || ''}`;
  }

  function getSelectedRoles() {
    return $$('#role-options input[type="checkbox"]:checked').map((input) => input.value);
  }

  function getOptions() {
    return {
      roles: getSelectedRoles(),
      customRole: $('#custom-role').value.trim(),
      destination: $('#destination').value,
      lang: $('#output-language').value,
      formatId: $('#format-select').value,
      includePhoto: $('#include-photo').checked,
      photoDataUrl: state.photoDataUrl
    };
  }

  function renderRoles() {
    $('#role-options').innerHTML = window.CVOTemplates.TARGET_ROLES.map((role, index) => `
      <label class="pill">
        <input type="checkbox" value="${role}" ${index === 0 ? 'checked' : ''} />
        <span>${role}</span>
      </label>`).join('');
  }

  function renderFormats() {
    const lang = window.CVOi18n.getLanguage();
    const selected = $('#format-select')?.value || 'ats-simple';
    $('#format-select').innerHTML = window.CVOTemplates.CV_FORMATS.map((format) => `
      <option value="${format.id}">${format.name[lang] || format.name.es}</option>`).join('');
    $('#format-select').value = selected;
    if (!$('#format-select').value) $('#format-select').value = 'ats-simple';
    updateFormatDescription();
  }


  function renderSalaryControls() {
    if (!window.CVOSalary) return;
    const lang = window.CVOi18n.getLanguage();
    const selectedCountry = $('#salary-country')?.value || 'ES';
    const selectedCurrency = $('#salary-currency')?.value || '';
    const selectedRole = $('#salary-role')?.value || 'auto';
    const selectedSeniority = $('#salary-seniority')?.value || 'auto';
    const selectedExperience = $('#salary-experience')?.value || 'auto';

    $('#salary-country').innerHTML = window.CVOSalary.COUNTRIES.map((country) => {
      const badge = country.supported ? ' · baseline' : ' · assisted';
      return `<option value="${country.code}" data-currency="${country.currency}">${country.name}${badge}</option>`;
    }).join('');

    $('#salary-currency').innerHTML = window.CVOSalary.CURRENCIES.map((currency) => `<option value="${currency}">${currency}</option>`).join('');

    $('#salary-role').innerHTML = window.CVOSalary.ROLE_OPTIONS.map((role) => `<option value="${role.id}">${role.label[lang] || role.label.es}</option>`).join('');

    const seniorityOptions = [`<option value="auto">${lang === 'en' ? 'Automatic from CV' : 'Automático desde CV'}</option>`].concat(
      Object.entries(window.CVOSalary.SENIORITY).map(([value, data]) => `<option value="${value}">${data.label[lang] || data.label.es}</option>`)
    );
    $('#salary-seniority').innerHTML = seniorityOptions.join('');

    $('#salary-experience').innerHTML = window.CVOSalary.EXPERIENCE_OPTIONS.map((item) => `<option value="${item.value}">${item.label[lang] || item.label.es}</option>`).join('');

    $('#salary-country').value = selectedCountry;
    if (!$('#salary-country').value) $('#salary-country').value = 'ES';
    const country = window.CVOSalary.getCountry($('#salary-country').value);
    $('#salary-currency').value = selectedCurrency || country.currency || 'EUR';
    if (!$('#salary-currency').value) $('#salary-currency').value = 'EUR';
    $('#salary-role').value = selectedRole;
    $('#salary-seniority').value = selectedSeniority;
    $('#salary-experience').value = selectedExperience;
    updateSalaryModeVisibility();
  }

  function syncSalaryCurrency() {
    const country = window.CVOSalary.getCountry($('#salary-country').value);
    if (country && country.currency && country.currency !== 'OTHER') $('#salary-currency').value = country.currency;
    if (!country.supported) $('#salary-mode').value = 'assisted';
    updateSalaryModeVisibility();
  }

  function updateSalaryModeVisibility() {
    const country = window.CVOSalary.getCountry($('#salary-country').value);
    const assisted = $('#salary-mode').value === 'assisted' || !country.supported;
    $('.manual-market-row')?.classList.toggle('is-muted', !assisted);
    if (!country.supported && $('#salary-mode').value !== 'assisted') $('#salary-mode').value = 'assisted';
  }

  function getSalaryInputs() {
    return {
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
  }

  function salaryWarningText(key) {
    const map = {
      unsupportedCountry: t('salaryWarningUnsupported'),
      baselineIsIndicative: t('salaryWarningBaseline'),
      assistedUsesUserRange: t('salaryWarningAssisted'),
      missingRole: t('salaryWarningMissingRole'),
      weakCvImpact: t('salaryWarningWeakCv'),
      customCountry: t('salaryWarningCustomCountry')
    };
    return map[key] || key;
  }

  function renderSalary(result) {
    const output = $('#salary-output');
    const lang = window.CVOi18n.getLanguage();
    output.classList.remove('empty');

    if (result.status === 'needsReference') {
      output.innerHTML = `
        <div class="salary-needs-reference">
          <strong>${t('salaryNeedsReference')}</strong>
          <span>${result.country.name} · ${result.currency} · ${result.roleGroup}</span>
        </div>`;
      return;
    }

    const source = result.source === 'baseline' ? t('salarySourceBaseline') : t('salarySourceAssisted');
    const warningList = (result.warnings || []).map((item) => `<li>${salaryWarningText(item)}</li>`).join('');
    const signals = [];
    if (result.signals.tools.length) signals.push(`${result.signals.tools.slice(0, 5).join(', ')}`);
    if (result.signals.certs.length) signals.push(`${result.signals.certs.slice(0, 3).join(', ')}`);
    if (result.signals.languages.length) signals.push(`${result.signals.languages.join(', ')}`);
    const seniorityLabel = result.seniorityLabel?.[lang] || result.seniorityLabel?.es || result.seniority;

    output.innerHTML = `
      <div class="salary-summary">
        <div class="salary-profile-card">
          <h3>${t('salaryProfileDetected')}</h3>
          <p class="hint">${result.country.name} · ${result.currency} · ${result.roleGroup} · ${seniorityLabel} · ${Number(result.experienceYears || 0).toFixed(1)} ${lang === 'en' ? 'years' : 'años'}</p>
          <div class="salary-meta">
            <span>${t('salaryMethod')}: ${source}</span>
            <span>Profile factor: ${result.profileFactor.toFixed(2)}×</span>
            ${signals.map((item) => `<span>${window.CVOAnalyzer.escapeHtml(item)}</span>`).join('')}
          </div>
        </div>
        <div class="salary-disclaimer-card">
          <h3>${t('salaryDisclaimerTitle')}</h3>
          <p class="hint">${t('salaryDisclaimer')}</p>
        </div>
      </div>
      <div class="salary-levels">
        <div class="salary-band red">
          <strong>${t('salaryLowBand')}</strong>
          <p class="range">${window.CVOSalary.formatRange(result.ranges.red, result.currency, result.period)}</p>
          <p>${t('salaryLowBandText')}</p>
        </div>
        <div class="salary-band orange">
          <strong>${t('salaryContextBand')}</strong>
          <p class="range">${window.CVOSalary.formatRange(result.ranges.orange, result.currency, result.period)}</p>
          <p>${t('salaryContextBandText')}</p>
        </div>
        <div class="salary-band green">
          <strong>${t('salaryTargetBand')}</strong>
          <p class="range">${window.CVOSalary.formatRange(result.ranges.green, result.currency, result.period)}</p>
          <p>${t('salaryTargetBandText')}</p>
        </div>
      </div>
      ${warningList ? `<ul class="salary-warning-list">${warningList}</ul>` : ''}
    `;
  }

  function calculateSalary() {
    applyStructuredFields();
    const options = getOptions();
    if (!state.analysis) {
      state.analysis = window.CVOAnalyzer.analyze(state.cv, $('#job-description').value.trim(), options);
      renderAnalysis(state.analysis);
    }
    state.salaryResult = window.CVOSalary.estimate(state.cv, state.analysis, options, getSalaryInputs());
    renderSalary(state.salaryResult);
    setStatus(state.salaryResult.status === 'ok' ? t('salaryCalculated') : t('salaryNeedsReference'), state.salaryResult.status === 'ok' ? 'success' : 'warning');
  }

  function detectSalaryFromCv() {
    applyStructuredFields();
    $('#salary-role').value = 'auto';
    $('#salary-seniority').value = 'auto';
    $('#salary-experience').value = 'auto';
    calculateSalary();
  }

  function updateFormatDescription() {
    const lang = window.CVOi18n.getLanguage();
    const format = window.CVOTemplates.CV_FORMATS.find((item) => item.id === $('#format-select').value);
    $('#format-description').textContent = format ? format.short[lang] : '';
    $('#photo-warning').textContent = window.CVOFormatter.photoPolicyMessage($('#format-select').value, lang);
    $('#photo-warning').classList.toggle('warning', ['uk-ireland', 'ats-simple', 'hybrid-technical', 'technical-projects'].includes($('#format-select').value));
  }

  function renderStructured() {
    $('#structured-fields').innerHTML = window.CVOFormatter.renderStructuredFields(state.cv || {});
  }

  function applyStructuredFields() {
    state.cv = window.CVOFormatter.readStructuredFields($('#structured-fields'), state.cv);
    setStatus(t('fieldsSaved'), 'success');
  }

  function renderAnalysis(analysis) {
    const lang = window.CVOi18n.getLanguage();
    const htmlList = (title, items) => `<div class="list-card"><h3>${title}</h3>${items && items.length ? `<ul>${items.map((item) => `<li>${window.CVOAnalyzer.escapeHtml(item)}</li>`).join('')}</ul>` : '<p class="hint">—</p>'}</div>`;
    const tagList = (items) => `<ul class="tag-list">${(items || []).slice(0, 22).map((item) => `<li>${window.CVOAnalyzer.escapeHtml(item)}</li>`).join('')}</ul>`;
    const bulletHtml = (analysis.bulletImprovements || []).slice(0, 6).map((item) => `
      <li><strong>${window.CVOAnalyzer.escapeHtml(item.original)}</strong><br><span>${window.CVOAnalyzer.escapeHtml(item.improved)}</span></li>
    `).join('');
    const formatName = analysis.formatRecommendation.name[lang] || analysis.formatRecommendation.name.es;
    const explanation = analysis.formatRecommendation.explanation[lang] || analysis.formatRecommendation.explanation.es;

    $('#analysis-output').classList.remove('empty');
    $('#analysis-output').innerHTML = `
      <div class="score-wrap">
        <div class="score-circle" style="--score:${analysis.score}">${analysis.score}</div>
        <div>
          <h3>${t('score')}</h3>
          <p class="hint">${analysis.score >= 80 ? 'Strong ATS compatibility.' : analysis.score >= 60 ? 'Good base; adapt keywords and impact.' : 'Needs clearer sections, keywords and quantified achievements.'}</p>
          <p><strong>${t('formatRecommendation')}:</strong> ${formatName}</p>
          <p class="hint">${explanation}</p>
        </div>
      </div>
      <div class="metric-grid">
        <div class="metric-card"><strong>${analysis.foundKeywords.length}</strong><span>${t('found')}</span></div>
        <div class="metric-card"><strong>${analysis.missingKeywords.length}</strong><span>${t('missing')}</span></div>
        <div class="metric-card"><strong>${analysis.metrics.length}</strong><span>${t('metrics')}</span></div>
      </div>
      <div class="recommendation-grid">
        <div class="list-card"><h3>${t('found')}</h3>${tagList(analysis.foundKeywords)}</div>
        <div class="list-card"><h3>${t('missing')}</h3>${tagList(analysis.missingKeywords)}</div>
        ${htmlList(t('incomplete'), analysis.incompleteSections)}
        ${htmlList(t('risks'), analysis.risks)}
        ${htmlList(t('recommendations'), analysis.recommendations)}
        <div class="list-card"><h3>${t('bulletImprovements')}</h3>${bulletHtml ? `<ul>${bulletHtml}</ul>` : '<p class="hint">No weak bullets detected.</p>'}</div>
      </div>
    `;
    renderLinkedIn(analysis.linkedin);
  }

  function renderLinkedIn(linkedin) {
    $('#linkedin-output').classList.remove('empty');
    $('#linkedin-output').innerHTML = `
      <div class="linkedin-section"><h3>Headline</h3><p>${window.CVOAnalyzer.escapeHtml(linkedin.headline)}</p></div>
      <div class="linkedin-section"><h3>About</h3><p>${window.CVOAnalyzer.escapeHtml(linkedin.about)}</p></div>
      <div class="linkedin-section"><h3>Skills</h3><p>${window.CVOAnalyzer.escapeHtml(linkedin.skills.join(' · '))}</p></div>
      <div class="linkedin-section"><h3>Featured projects</h3><ul>${linkedin.featured.map((item) => `<li>${window.CVOAnalyzer.escapeHtml(item)}</li>`).join('')}</ul></div>
      <div class="linkedin-section"><h3>Recruiter pitch</h3><p>${window.CVOAnalyzer.escapeHtml(linkedin.recruiterPitch)}</p></div>
    `;
  }

  async function parseCvFromInputs() {
    const manual = $('#manual-cv').value.trim();
    if (!manual) {
      setStatus(t('emptyCv'), 'warning');
      return;
    }
    state.cvText = manual;
    state.cv = window.CVOParser.parseCVText(manual);
    renderStructured();
    setStatus(t('parsedOk'), 'success');
  }

  function analyzeCurrentCv() {
    applyStructuredFields();
    state.jdText = $('#job-description').value.trim();
    state.analysis = window.CVOAnalyzer.analyze(state.cv, state.jdText, getOptions());
    renderAnalysis(state.analysis);
    $('#format-select').value = state.analysis.formatRecommendation.id;
    updateFormatDescription();
    setStatus(t('analysisDone'), 'success');
  }

  function recommendFormatOnly() {
    applyStructuredFields();
    const recommendation = window.CVOAnalyzer.recommendFormat(state.cv, getOptions());
    $('#format-select').value = recommendation.id;
    updateFormatDescription();
    const lang = window.CVOi18n.getLanguage();
    setStatus(`${t('formatRecommendation')}: ${recommendation.name[lang]}. ${recommendation.explanation[lang]}`, 'success');
  }

  function generateCv() {
    applyStructuredFields();
    const options = getOptions();
    const html = window.CVOFormatter.generateCVHtml(state.cv, options);
    $('#cv-output').innerHTML = html;
    if (!state.analysis) {
      state.analysis = window.CVOAnalyzer.analyze(state.cv, $('#job-description').value.trim(), options);
      renderAnalysis(state.analysis);
    }
    setStatus(t('cvGenerated'), 'success');
  }

  function loadDemo() {
    const examples = window.CVOTemplates.DEMO_EXAMPLES;
    let example = examples[state.demoIndex % examples.length];
    if (example.id === state.lastDemoId) {
      state.demoIndex += 1;
      example = examples[state.demoIndex % examples.length];
    }
    state.lastDemoId = example.id;
    state.demoIndex += 1;
    state.cvText = example.cv;
    state.jdText = example.jd;
    $('#manual-cv').value = example.cv;
    $('#job-description').value = example.jd;
    state.cv = window.CVOParser.parseCVText(example.cv);
    renderStructured();
    const roleMap = {
      'soc-junior': 'SOC Analyst',
      'grc-junior': 'GRC Analyst',
      'threat-analyst': 'Threat Analyst',
      'detection-engineer': 'Detection Engineer Junior',
      'cloud-security': 'Cloud Security Junior'
    };
    $$('#role-options input').forEach((input) => {
      input.checked = input.value === roleMap[example.id];
    });
    setStatus(`${t('demoLoaded')} ${example.title}`, 'success');
  }

  async function loadCvFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setStatus('Reading file...', '');
    try {
      const text = await window.CVOParser.extractTextFromFile(file);
      if (!text || text.length < 20) throw new Error('Empty extracted text');
      $('#manual-cv').value = text;
      state.cvText = text;
      state.cv = window.CVOParser.parseCVText(text);
      renderStructured();
      setStatus(t('parsedOk'), 'success');
    } catch (error) {
      console.error(error);
      setStatus(t('parseError'), 'warning');
    }
  }

  async function loadJdFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      $('#job-description').value = text.trim();
    } catch (error) {
      console.error(error);
      setStatus(t('parseError'), 'warning');
    }
  }

  function loadSampleJdOnly() {
    const currentExample = window.CVOTemplates.DEMO_EXAMPLES[(state.demoIndex + 1) % window.CVOTemplates.DEMO_EXAMPLES.length];
    $('#job-description').value = currentExample.jd;
    state.demoIndex += 1;
  }

  function clearAll() {
    state.cvText = '';
    state.jdText = '';
    state.cv = {};
    state.analysis = null;
    state.salaryResult = null;
    state.photoDataUrl = '';
    $('#manual-cv').value = '';
    $('#job-description').value = '';
    $('#structured-fields').innerHTML = '';
    $('#analysis-output').className = 'analysis-output empty';
    $('#analysis-output').textContent = t('analysisPlaceholder');
    $('#linkedin-output').className = 'linkedin-output empty';
    $('#linkedin-output').textContent = t('linkedinPlaceholder');
    $('#salary-output').className = 'salary-output empty';
    $('#salary-output').textContent = t('salaryPlaceholder');
    $('#cv-output').innerHTML = '';
    $('#photo-preview').innerHTML = '';
    $('#include-photo').checked = false;
    $('#ai-prompt-output').classList.add('hidden');
    $('#ai-prompt-output').value = '';
    setStatus('', '');
  }

  function readPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.photoDataUrl = reader.result;
      $('#photo-preview').innerHTML = `<img src="${state.photoDataUrl}" alt="Profile preview" />`;
      $('#include-photo').checked = true;
      updateFormatDescription();
    };
    reader.readAsDataURL(file);
  }

  function buildAiPrompt() {
    applyStructuredFields();
    const options = getOptions();
    const analysis = state.analysis || window.CVOAnalyzer.analyze(state.cv, $('#job-description').value.trim(), options);
    const prompt = window.CVOAnalyzer.buildAiPrompt(state.cv, $('#job-description').value.trim(), analysis, options);
    $('#ai-prompt-output').value = prompt;
    $('#ai-prompt-output').classList.remove('hidden');
    setStatus(t('aiPromptReady'), 'success');
  }

  async function enhanceWithAI() {
    const apiKey = $('#ai-key').value.trim();
    const endpoint = $('#ai-endpoint').value.trim();
    if (!apiKey || !endpoint) {
      setStatus(t('aiNeedsKey'), 'warning');
      return;
    }
    buildAiPrompt();
    try {
      $('#ai-enhance').disabled = true;
      const result = await window.CVOAnalyzer.enhanceWithExternalAI($('#ai-prompt-output').value, apiKey, endpoint);
      if (result) {
        $('#ai-prompt-output').value = result;
        $('#ai-prompt-output').classList.remove('hidden');
        setStatus(t('externalMode'), 'success');
      }
    } catch (error) {
      console.error(error);
      setStatus(t('aiFailed'), 'warning');
    } finally {
      $('#ai-enhance').disabled = false;
      $('#ai-key').value = '';
    }
  }

  function exportPdf() {
    const text = window.CVOFormatter.readFinalCvText($('#cv-output'));
    if (!text) {
      setStatus(t('noFinalCv'), 'warning');
      return;
    }
    window.CVOExporter.exportPDF(text, state.cv.name || 'optimized-cv');
    setStatus(t('exportReady'), 'success');
  }

  async function exportDocx() {
    const text = window.CVOFormatter.readFinalCvText($('#cv-output'));
    if (!text) {
      setStatus(t('noFinalCv'), 'warning');
      return;
    }
    try {
      await window.CVOExporter.exportDOCX(text, state.cv.name || 'optimized-cv');
      setStatus(t('exportReady'), 'success');
    } catch (error) {
      console.warn(error);
      setStatus(t('exportReady'), 'warning');
    }
  }

  function changeLanguage(lang) {
    window.CVOi18n.setLanguage(lang);
    renderFormats();
    renderSalaryControls();
    updateFormatDescription();
    if ($('#analysis-output').classList.contains('empty')) $('#analysis-output').textContent = t('analysisPlaceholder');
    if ($('#linkedin-output').classList.contains('empty')) $('#linkedin-output').textContent = t('linkedinPlaceholder');
    if ($('#salary-output').classList.contains('empty')) $('#salary-output').textContent = t('salaryPlaceholder');
    if (state.salaryResult) renderSalary(state.salaryResult);
  }

  function bindEvents() {
    $('#lang-en').addEventListener('click', () => changeLanguage('en'));
    $('#lang-es').addEventListener('click', () => changeLanguage('es'));
    $('#theme-toggle').addEventListener('click', () => document.body.classList.toggle('light'));
    $('#cv-file').addEventListener('change', loadCvFile);
    $('#jd-file').addEventListener('change', loadJdFile);
    $('#parse-cv').addEventListener('click', parseCvFromInputs);
    $('#save-fields').addEventListener('click', applyStructuredFields);
    $('#load-demo').addEventListener('click', loadDemo);
    $('#sample-jd').addEventListener('click', loadSampleJdOnly);
    $('#clear-all').addEventListener('click', clearAll);
    $('#analyze').addEventListener('click', analyzeCurrentCv);
    $('#recommend-format').addEventListener('click', recommendFormatOnly);
    $('#generate-cv').addEventListener('click', generateCv);
    $('#export-pdf').addEventListener('click', exportPdf);
    $('#export-docx').addEventListener('click', exportDocx);
    $('#format-select').addEventListener('change', updateFormatDescription);
    $('#destination').addEventListener('change', updateFormatDescription);
    $('#photo-file').addEventListener('change', readPhoto);
    $('#build-ai-prompt').addEventListener('click', buildAiPrompt);
    $('#ai-enhance').addEventListener('click', enhanceWithAI);
    $('#salary-country').addEventListener('change', syncSalaryCurrency);
    $('#salary-mode').addEventListener('change', updateSalaryModeVisibility);
    $('#calculate-salary').addEventListener('click', calculateSalary);
    $('#salary-from-cv').addEventListener('click', detectSalaryFromCv);
  }

  function init() {
    renderRoles();
    renderFormats();
    renderSalaryControls();
    bindEvents();
    window.CVOi18n.setLanguage('es');
    $('#analysis-output').textContent = t('analysisPlaceholder');
    $('#linkedin-output').textContent = t('linkedinPlaceholder');
    $('#salary-output').textContent = t('salaryPlaceholder');
  }

  document.addEventListener('DOMContentLoaded', init);
})(window, document);
