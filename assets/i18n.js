(function (window) {
  'use strict';
  const strings = {
    es: {},
    en: {
      title: 'CareerFit CV Optimizer',
      subtitle: 'Optimize your CV, check ATS compatibility and estimate a recommended salary range.',
      heroTitle: 'Your career workspace on one page',
      heroText: 'Upload a CV, convert it into a professional format, compare it with a job description and estimate a salary band. Everything runs locally in the browser; GitHub Pages has no backend.',
      goConvert: 'Convert CV', goAts: 'Analyze ATS', goSalary: 'Salary range',
      moduleConvert: 'Convert CV format', moduleConvertDesc: 'Parser, editing, formats and export.',
      moduleAts: 'ATS recommendation', moduleAtsDesc: 'Score, keywords, risks and improvements.',
      moduleSalary: 'Salary calculator', moduleSalaryDesc: 'Red, orange and green bands.',
      privacyTitle: 'Privacy:', privacyText: 'files are processed locally. If you use an optional external API, text is sent to the configured provider and the key is not stored.',
      convertTitle: 'Convert CV format', convertHint: 'Upload a file or paste content. Then review detected fields.',
      loadDemo: 'Load example', cvFile: 'Upload PDF, DOCX, TXT, MD or JSON CV', pasteCv: 'Paste CV manually', parseCv: 'Analyze CV', clear: 'Clear',
      previewTitle: 'Preview', exportPdf: 'PDF', exportDocx: 'DOCX', formatsTitle: 'Choose format', formatsHint: 'Recommendation is recalculated using your CV, country, sector and job description when available.', recommendFormat: 'Recommend format',
      fieldsSummary: 'Detected fields and manual editing', fieldsHint: 'If a section appears as “Not detected”, complete it manually. The system does not copy the full CV into doubtful fields.', applyFields: 'Apply changes', useRaw: 'Use unstructured text', regenPreview: 'Regenerate preview',
      atsTitle: 'ATS recommendation', atsHint: 'Reuse the uploaded CV and compare it with a real job description. There is no closed role list.', jdFile: 'Upload TXT/MD job description', jdPaste: 'Paste job description', advancedOptions: 'Context options', targetRole: 'Target role', sector: 'Sector', level: 'Level', targetCountry: 'Target country', cvLanguage: 'CV language', atsMode: 'Mode', heuristic: 'Local heuristic', externalOptional: 'Optional external AI', aiEndpoint: 'Compatible chat completions endpoint', aiKey: 'Temporary API key', analyzeAts: 'Analyze compatibility', sampleJd: 'Demo job', buildPrompt: 'AI prompt', atsResultTitle: 'ATS result', analysisEmpty: 'Load a CV and job description to see the analysis.',
      salaryTitle: 'Recommended salary calculator', salaryHint: 'Indicative estimate. It does not replace local salary sources or real negotiation.', detectFromCv: 'Detect from CV', salaryCountry: 'Country', currency: 'Currency', period: 'Period', salaryMode: 'Mode', salaryRole: 'Role family', seniority: 'Seniority', experience: 'Experience', strategy: 'Strategy', salarySector: 'Sector', workMode: 'Work mode', companyType: 'Company type', rangeLow: 'Local range low', rangeHigh: 'Local range high', calculateSalary: 'Calculate range', salaryEmpty: 'Enter context and calculate to see bands.', footer: 'Static project ready for GitHub Pages.'
    }
  };
  let currentLanguage = 'es';
  const defaults = {};
  function rememberDefaults() {
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      if (!(key in defaults)) defaults[key] = node.textContent;
    });
  }
  function setLanguage(lang) {
    rememberDefaults();
    currentLanguage = lang === 'en' ? 'en' : 'es';
    document.documentElement.lang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const key = node.getAttribute('data-i18n');
      const value = currentLanguage === 'es' ? defaults[key] : strings.en[key];
      if (value) node.textContent = value;
    });
    document.querySelectorAll('#lang-es,#lang-en').forEach((button) => button.classList.remove('active'));
    const active = document.querySelector(`#lang-${currentLanguage}`);
    if (active) active.classList.add('active');
  }
  function getLanguage() { return currentLanguage; }
  window.CVOi18n = { setLanguage, getLanguage, strings };
})(window);
