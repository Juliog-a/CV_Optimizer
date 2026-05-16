(function (window) {
  'use strict';

  const CURRENCIES = [
    'EUR', 'GBP', 'USD', 'CAD', 'AUD', 'NZD', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
    'BRL', 'MXN', 'CLP', 'ARS', 'COP', 'PEN', 'UYU', 'AED', 'SAR', 'ILS', 'ZAR', 'INR', 'SGD',
    'HKD', 'JPY', 'KRW', 'CNY', 'TRY', 'OTHER'
  ];

  const COUNTRIES = [
    { code: 'ES', name: 'Spain', currency: 'EUR', supported: true },
    { code: 'IE', name: 'Ireland', currency: 'EUR', supported: true },
    { code: 'GB', name: 'United Kingdom', currency: 'GBP', supported: true },
    { code: 'DE', name: 'Germany', currency: 'EUR', supported: true },
    { code: 'FR', name: 'France', currency: 'EUR', supported: true },
    { code: 'NL', name: 'Netherlands', currency: 'EUR', supported: true },
    { code: 'PT', name: 'Portugal', currency: 'EUR', supported: true },
    { code: 'IT', name: 'Italy', currency: 'EUR', supported: true },
    { code: 'PL', name: 'Poland', currency: 'PLN', supported: true },
    { code: 'CH', name: 'Switzerland', currency: 'CHF', supported: true },
    { code: 'US', name: 'United States', currency: 'USD', supported: true },
    { code: 'CA', name: 'Canada', currency: 'CAD', supported: true },
    { code: 'AU', name: 'Australia', currency: 'AUD', supported: true },
    { code: 'MX', name: 'Mexico', currency: 'MXN', supported: true },
    { code: 'CL', name: 'Chile', currency: 'CLP', supported: true },
    { code: 'AR', name: 'Argentina', currency: 'ARS', supported: true },
    { code: 'CO', name: 'Colombia', currency: 'COP', supported: true },
    { code: 'BR', name: 'Brazil', currency: 'BRL', supported: true },
    { code: 'AE', name: 'United Arab Emirates', currency: 'AED', supported: true },
    { code: 'ZA', name: 'South Africa', currency: 'ZAR', supported: true },
    { code: 'IN', name: 'India', currency: 'INR', supported: true },
    { code: 'SG', name: 'Singapore', currency: 'SGD', supported: true },
    { code: 'JP', name: 'Japan', currency: 'JPY', supported: true },
    { code: 'SE', name: 'Sweden', currency: 'SEK', supported: false },
    { code: 'NO', name: 'Norway', currency: 'NOK', supported: false },
    { code: 'DK', name: 'Denmark', currency: 'DKK', supported: false },
    { code: 'FI', name: 'Finland', currency: 'EUR', supported: false },
    { code: 'BE', name: 'Belgium', currency: 'EUR', supported: false },
    { code: 'AT', name: 'Austria', currency: 'EUR', supported: false },
    { code: 'CZ', name: 'Czech Republic', currency: 'CZK', supported: false },
    { code: 'HU', name: 'Hungary', currency: 'HUF', supported: false },
    { code: 'RO', name: 'Romania', currency: 'EUR', supported: false },
    { code: 'GR', name: 'Greece', currency: 'EUR', supported: false },
    { code: 'TR', name: 'Turkey', currency: 'TRY', supported: false },
    { code: 'IL', name: 'Israel', currency: 'ILS', supported: false },
    { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', supported: false },
    { code: 'NZ', name: 'New Zealand', currency: 'NZD', supported: false },
    { code: 'KR', name: 'South Korea', currency: 'KRW', supported: false },
    { code: 'CN', name: 'China', currency: 'CNY', supported: false },
    { code: 'HK', name: 'Hong Kong', currency: 'HKD', supported: false },
    { code: 'PE', name: 'Peru', currency: 'PEN', supported: false },
    { code: 'UY', name: 'Uruguay', currency: 'UYU', supported: false },
    { code: 'EC', name: 'Ecuador', currency: 'USD', supported: false },
    { code: 'PA', name: 'Panama', currency: 'USD', supported: false },
    { code: 'CR', name: 'Costa Rica', currency: 'USD', supported: false },
    { code: 'DO', name: 'Dominican Republic', currency: 'USD', supported: false },
    { code: 'OTHER', name: 'Other / custom country', currency: 'OTHER', supported: false }
  ];

  const ROLE_OPTIONS = [
    { id: 'auto', label: { es: 'Automático según CV/rol seleccionado', en: 'Automatic from CV/selected role' } },
    { id: 'cybersecurity', label: { es: 'Ciberseguridad general', en: 'General cybersecurity' } },
    { id: 'soc', label: { es: 'SOC / Security Operations', en: 'SOC / Security Operations' } },
    { id: 'grc', label: { es: 'GRC / Compliance', en: 'GRC / Compliance' } },
    { id: 'cloud', label: { es: 'Cloud Security', en: 'Cloud Security' } },
    { id: 'software', label: { es: 'Software / Desarrollo', en: 'Software / Development' } },
    { id: 'data', label: { es: 'Data / Analytics', en: 'Data / Analytics' } },
    { id: 'engineering', label: { es: 'Ingeniería / Procesos', en: 'Engineering / Process' } },
    { id: 'project', label: { es: 'Project / Product Management', en: 'Project / Product Management' } },
    { id: 'business', label: { es: 'Negocio / Operaciones', en: 'Business / Operations' } },
    { id: 'general', label: { es: 'General / Otro', en: 'General / Other' } }
  ];

  const BASELINE = {
    ES: { general: 26000, business: 28000, cybersecurity: 32000, soc: 29000, grc: 30000, cloud: 36000, software: 34000, data: 32000, engineering: 31000, project: 38000 },
    IE: { general: 40000, business: 43000, cybersecurity: 49000, soc: 44000, grc: 45000, cloud: 56000, software: 54000, data: 50000, engineering: 47000, project: 58000 },
    GB: { general: 33000, business: 36000, cybersecurity: 42000, soc: 37000, grc: 39000, cloud: 48000, software: 46000, data: 43000, engineering: 41000, project: 52000 },
    DE: { general: 47000, business: 52000, cybersecurity: 59000, soc: 52000, grc: 54000, cloud: 66000, software: 62000, data: 58000, engineering: 59000, project: 69000 },
    FR: { general: 38000, business: 42000, cybersecurity: 50000, soc: 44000, grc: 46000, cloud: 57000, software: 54000, data: 50000, engineering: 50000, project: 60000 },
    NL: { general: 45000, business: 50000, cybersecurity: 59000, soc: 52000, grc: 54000, cloud: 65000, software: 62000, data: 58000, engineering: 57000, project: 69000 },
    PT: { general: 23000, business: 26000, cybersecurity: 31000, soc: 28000, grc: 29000, cloud: 36000, software: 34000, data: 32000, engineering: 31000, project: 38000 },
    IT: { general: 30000, business: 33000, cybersecurity: 39000, soc: 35000, grc: 36000, cloud: 44000, software: 42000, data: 39000, engineering: 39000, project: 48000 },
    PL: { general: 120000, business: 135000, cybersecurity: 165000, soc: 145000, grc: 150000, cloud: 185000, software: 175000, data: 160000, engineering: 155000, project: 190000 },
    CH: { general: 85000, business: 95000, cybersecurity: 115000, soc: 105000, grc: 105000, cloud: 125000, software: 120000, data: 112000, engineering: 110000, project: 130000 },
    US: { general: 68000, business: 78000, cybersecurity: 95000, soc: 82000, grc: 88000, cloud: 110000, software: 105000, data: 98000, engineering: 93000, project: 115000 },
    CA: { general: 62000, business: 70000, cybersecurity: 85000, soc: 75000, grc: 80000, cloud: 98000, software: 93000, data: 88000, engineering: 84000, project: 102000 },
    AU: { general: 85000, business: 95000, cybersecurity: 115000, soc: 100000, grc: 105000, cloud: 128000, software: 120000, data: 112000, engineering: 108000, project: 135000 },
    MX: { general: 360000, business: 420000, cybersecurity: 540000, soc: 450000, grc: 480000, cloud: 620000, software: 590000, data: 520000, engineering: 500000, project: 650000 },
    CL: { general: 18000000, business: 21000000, cybersecurity: 27000000, soc: 23000000, grc: 24000000, cloud: 31000000, software: 30000000, data: 27000000, engineering: 26000000, project: 33000000 },
    AR: { general: 18000000, business: 21000000, cybersecurity: 27000000, soc: 23000000, grc: 24000000, cloud: 31000000, software: 30000000, data: 27000000, engineering: 26000000, project: 33000000 },
    CO: { general: 60000000, business: 70000000, cybersecurity: 90000000, soc: 78000000, grc: 82000000, cloud: 105000000, software: 100000000, data: 90000000, engineering: 86000000, project: 112000000 },
    BR: { general: 90000, business: 105000, cybersecurity: 135000, soc: 115000, grc: 120000, cloud: 155000, software: 150000, data: 135000, engineering: 130000, project: 165000 },
    AE: { general: 180000, business: 210000, cybersecurity: 270000, soc: 235000, grc: 245000, cloud: 310000, software: 295000, data: 270000, engineering: 260000, project: 330000 },
    ZA: { general: 420000, business: 480000, cybersecurity: 620000, soc: 540000, grc: 560000, cloud: 700000, software: 680000, data: 620000, engineering: 600000, project: 740000 },
    IN: { general: 900000, business: 1100000, cybersecurity: 1500000, soc: 1250000, grc: 1300000, cloud: 1800000, software: 1700000, data: 1500000, engineering: 1400000, project: 1900000 },
    SG: { general: 65000, business: 75000, cybersecurity: 95000, soc: 82000, grc: 88000, cloud: 110000, software: 105000, data: 98000, engineering: 90000, project: 118000 },
    JP: { general: 5500000, business: 6200000, cybersecurity: 7600000, soc: 6800000, grc: 7000000, cloud: 8500000, software: 8200000, data: 7600000, engineering: 7400000, project: 9000000 }
  };

  const SENIORITY = {
    trainee: { label: { es: 'Trainee / prácticas', en: 'Trainee / internship' }, multiplier: 0.68 },
    junior: { label: { es: 'Junior', en: 'Junior' }, multiplier: 0.82 },
    juniorPlus: { label: { es: 'Junior+', en: 'Junior+' }, multiplier: 0.95 },
    mid: { label: { es: 'Mid-level', en: 'Mid-level' }, multiplier: 1.18 },
    senior: { label: { es: 'Senior', en: 'Senior' }, multiplier: 1.55 },
    lead: { label: { es: 'Lead / Manager', en: 'Lead / Manager' }, multiplier: 1.9 }
  };

  const EXPERIENCE_OPTIONS = [
    { value: 'auto', label: { es: 'Automático desde CV', en: 'Automatic from CV' } },
    { value: '0', label: { es: '0 años', en: '0 years' } },
    { value: '0.5', label: { es: 'Menos de 1 año', en: 'Less than 1 year' } },
    { value: '1', label: { es: '1 año', en: '1 year' } },
    { value: '2', label: { es: '2 años', en: '2 years' } },
    { value: '3', label: { es: '3 años', en: '3 years' } },
    { value: '4', label: { es: '4 años', en: '4 years' } },
    { value: '5', label: { es: '5 años', en: '5 years' } },
    { value: '7', label: { es: '6-8 años', en: '6-8 years' } },
    { value: '10', label: { es: '9-12 años', en: '9-12 years' } },
    { value: '13', label: { es: '13+ años', en: '13+ years' } }
  ];

  const SECTOR_MULTIPLIERS = {
    general: 1,
    consulting: 0.96,
    mssp: 0.98,
    tech: 1.1,
    finance: 1.13,
    industrial: 1.02,
    public: 0.92,
    startup: 0.94,
    academia: 0.88
  };

  const WORK_MODE_MULTIPLIERS = {
    onsite: 0.98,
    hybrid: 1,
    remote: 1.04,
    internationalRemote: 1.1
  };

  const COMPANY_MULTIPLIERS = {
    local: 0.94,
    national: 1,
    multinational: 1.08,
    bigTech: 1.22,
    public: 0.9
  };

  const STRATEGY_MULTIPLIERS = {
    conservative: 0.94,
    realistic: 1,
    ambitious: 1.08
  };

  function normalize(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function unique(items) {
    return Array.from(new Set((items || []).filter(Boolean)));
  }

  function detectRoleGroup(cvText, options, explicitRole) {
    if (explicitRole && explicitRole !== 'auto') return explicitRole;
    const selected = normalize([...(options.roles || []), options.customRole || ''].join(' '));
    const text = normalize(`${selected} ${cvText}`);
    if (/soc|security operations|siem|alert triage|triage/.test(text)) return 'soc';
    if (/grc|compliance|iso 27001|audit|governance|risk assessment/.test(text)) return 'grc';
    if (/cloud security|aws|azure|gcp|iam|cspm/.test(text)) return 'cloud';
    if (/cyber|security|threat|dfir|incident response|detection/.test(text)) return 'cybersecurity';
    if (/software|developer|frontend|backend|full[ -]?stack|java|react|node/.test(text)) return 'software';
    if (/data analyst|data|analytics|power bi|tableau|sql|etl/.test(text)) return 'data';
    if (/process engineer|ingenier|desalacion|water treatment|hysys|aspen|p&id|pid|industrial/.test(text)) return 'engineering';
    if (/project manager|product manager|scrum|delivery|stakeholder/.test(text)) return 'project';
    if (/business|operations|marketing|sales|finance|account/.test(text)) return 'business';
    return 'general';
  }

  function detectExperienceYears(cvText) {
    const text = normalize(cvText);
    const explicit = [];
    const expRegex = /(\d{1,2}(?:[\.,]\d)?)\s*\+?\s*(anos|ano|years|year|yrs|yr)\s*(de experiencia|experience)?/gi;
    let match;
    while ((match = expRegex.exec(text)) !== null) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!Number.isNaN(value) && value < 45) explicit.push(value);
    }
    if (explicit.length) return Math.max(...explicit);

    const currentYear = new Date().getFullYear();
    const ranges = [];
    const rangeRegex = /(20\d{2})\s*(?:-|–|—|to|a)\s*(20\d{2}|actualidad|presente|present|current|now)/gi;
    while ((match = rangeRegex.exec(text)) !== null) {
      const start = Number(match[1]);
      const endRaw = match[2];
      const end = /actualidad|presente|present|current|now/i.test(endRaw) ? currentYear : Number(endRaw);
      if (start >= 1990 && end >= start && end <= currentYear + 1) ranges.push(clamp(end - start, 0.25, 12));
    }
    if (ranges.length) return clamp(ranges.reduce((sum, value) => sum + value, 0), 0, 18);
    return 0;
  }

  function seniorityFromYears(years, cvText) {
    const text = normalize(cvText);
    if (/lead|manager|responsable|head of|director/.test(text) && years >= 5) return 'lead';
    if (/senior|sr\./.test(text) || years >= 7) return 'senior';
    if (/mid|semi senior/.test(text) || years >= 3) return 'mid';
    if (years >= 1.5) return 'juniorPlus';
    if (years >= 0.5) return 'junior';
    return 'trainee';
  }

  function detectProfileSignals(cvText, analysis) {
    const text = normalize(cvText);
    const tools = [
      'python', 'sql', 'excel', 'power bi', 'tableau', 'aws', 'azure', 'gcp', 'linux', 'docker', 'git', 'github',
      'splunk', 'sentinel', 'elastic', 'crowdstrike', 'defender', 'wazuh', 'kql', 'sigma', 'yara', 'terraform', 'kubernetes'
    ].filter((tool) => text.includes(tool));
    const certs = [
      'iso 27001', 'sc-900', 'az-500', 'security+', 'cissp', 'cisa', 'cism', 'aws certified', 'azure', 'ccna', 'comptia', 'itil'
    ].filter((cert) => text.includes(cert));
    const languages = [];
    if (/ingles|english|b2|c1|c2|fluent|advanced/.test(text)) languages.push('English');
    if (/frances|french|aleman|german|portugues|portuguese|italiano|italian/.test(text)) languages.push('Additional language');
    const metrics = (cvText.match(/\b\d+(?:[.,]\d+)?\s*(?:%|k|m|alerts?|tickets?|incidents?|projects?|users?|hours?|days?|eur|usd|gbp|€|\$|£)?\b/gi) || []).filter((item) => !/^20\d{2}$/.test(item.trim()));
    const professionalLinks = [];
    if (/linkedin\.com/i.test(cvText)) professionalLinks.push('LinkedIn');
    if (/github\.com|portfolio|personal website|sitio web/i.test(cvText)) professionalLinks.push('Portfolio/GitHub');
    const atsScore = analysis && Number.isFinite(analysis.score) ? analysis.score : null;
    return { tools: unique(tools), certs: unique(certs), languages: unique(languages), metrics: unique(metrics).slice(0, 10), professionalLinks, atsScore };
  }

  function computeProfileFactor(signals, inputs) {
    let factor = 1;
    factor += clamp(signals.tools.length, 0, 8) * 0.012;
    factor += clamp(signals.certs.length, 0, 5) * 0.018;
    factor += clamp(signals.languages.length, 0, 2) * 0.025;
    factor += clamp(signals.metrics.length, 0, 5) * 0.01;
    factor += clamp(signals.professionalLinks.length, 0, 2) * 0.012;
    if (signals.atsScore !== null) factor += (signals.atsScore - 65) / 1000;
    factor *= SECTOR_MULTIPLIERS[inputs.sector] || 1;
    factor *= WORK_MODE_MULTIPLIERS[inputs.workMode] || 1;
    factor *= COMPANY_MULTIPLIERS[inputs.companyType] || 1;
    factor *= STRATEGY_MULTIPLIERS[inputs.strategy] || 1;
    return clamp(factor, 0.72, 1.42);
  }

  function roundSalary(value, currency) {
    const abs = Math.abs(value);
    let step = 1000;
    if (['CLP', 'COP', 'ARS', 'JPY', 'KRW', 'INR'].includes(currency)) step = abs > 10000000 ? 500000 : 100000;
    else if (['MXN', 'BRL', 'PLN', 'ZAR'].includes(currency)) step = 5000;
    else if (abs < 20000) step = 500;
    return Math.round(value / step) * step;
  }

  function formatMoney(value, currency, period) {
    const adjusted = period === 'monthly' ? value / 12 : value;
    if (currency === 'OTHER') return `${Math.round(adjusted).toLocaleString()} ${period === 'monthly' ? '/ mo.' : '/ yr.'}`;
    const zeroDecimal = ['CLP', 'COP', 'ARS', 'JPY', 'KRW', 'INR'].includes(currency);
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: zeroDecimal ? 0 : 0
      }).format(adjusted);
    } catch (error) {
      return `${Math.round(adjusted).toLocaleString()} ${currency}`;
    }
  }

  function formatRange(range, currency, period) {
    return `${formatMoney(range[0], currency, period)} – ${formatMoney(range[1], currency, period)}`;
  }

  function buildRanges(anchor, currency) {
    const red = [anchor * 0.74, anchor * 0.9].map((value) => roundSalary(value, currency));
    const orange = [anchor * 0.9, anchor * 1.1].map((value) => roundSalary(value, currency));
    const green = [anchor * 1.1, anchor * 1.3].map((value) => roundSalary(value, currency));
    return { red, orange, green };
  }

  function buildAssistedRanges(referenceLow, referenceHigh, profileFactor, currency) {
    const low = Math.min(referenceLow, referenceHigh);
    const high = Math.max(referenceLow, referenceHigh);
    const marketMid = (low + high) / 2;
    const profileMid = marketMid * profileFactor;
    const contextLow = Math.max(low * 0.95, profileMid * 0.88);
    const contextHigh = Math.min(high * 1.08, profileMid * 1.12);
    return {
      red: [contextLow * 0.78, contextLow].map((value) => roundSalary(value, currency)),
      orange: [contextLow, contextHigh].map((value) => roundSalary(value, currency)),
      green: [contextHigh, contextHigh * 1.22].map((value) => roundSalary(value, currency))
    };
  }

  function estimate(cv, analysis, options, inputs) {
    const cvText = window.CVOAnalyzer ? window.CVOAnalyzer.flattenCv(cv || {}) : JSON.stringify(cv || {});
    const country = COUNTRIES.find((item) => item.code === inputs.country) || COUNTRIES[0];
    const currency = inputs.currency || country.currency || 'EUR';
    const roleGroup = detectRoleGroup(cvText, options || {}, inputs.role);
    const detectedYears = detectExperienceYears(cvText);
    const experienceYears = inputs.experience === 'auto' ? detectedYears : Number(inputs.experience || detectedYears || 0);
    const seniority = inputs.seniority === 'auto' ? seniorityFromYears(experienceYears, cvText) : inputs.seniority;
    const seniorityData = SENIORITY[seniority] || SENIORITY.junior;
    const signals = detectProfileSignals(cvText, analysis);
    const profileFactor = computeProfileFactor(signals, inputs);
    const referenceLow = Number(inputs.referenceLow || 0);
    const referenceHigh = Number(inputs.referenceHigh || 0);
    const hasManualReference = referenceLow > 0 && referenceHigh > 0 && referenceHigh > referenceLow;
    const market = BASELINE[country.code];
    const supported = Boolean(market && market[roleGroup]);
    const shouldUseAssisted = inputs.mode === 'assisted' || !supported;

    if (shouldUseAssisted && !hasManualReference) {
      return {
        status: 'needsReference',
        country,
        currency,
        roleGroup,
        seniority,
        experienceYears,
        signals,
        supported,
        profileFactor,
        source: 'assisted'
      };
    }

    let ranges;
    let anchor;
    let source;
    if (shouldUseAssisted && hasManualReference) {
      ranges = buildAssistedRanges(referenceLow, referenceHigh, profileFactor, currency);
      anchor = (ranges.orange[0] + ranges.orange[1]) / 2;
      source = 'assisted';
    } else {
      const base = market[roleGroup] || market.general;
      anchor = base * seniorityData.multiplier * profileFactor;
      ranges = buildRanges(anchor, currency);
      source = 'baseline';
    }

    return {
      status: 'ok',
      country,
      currency,
      period: inputs.period || 'annual',
      roleGroup,
      seniority,
      seniorityLabel: seniorityData.label,
      experienceYears,
      signals,
      supported,
      source,
      profileFactor,
      anchor: roundSalary(anchor, currency),
      ranges,
      warnings: buildWarnings(country, supported, source, hasManualReference, signals, options)
    };
  }

  function buildWarnings(country, supported, source, hasManualReference, signals, options) {
    const warnings = [];
    if (!supported && source === 'assisted') warnings.push('unsupportedCountry');
    if (source === 'baseline') warnings.push('baselineIsIndicative');
    if (source === 'assisted' && hasManualReference) warnings.push('assistedUsesUserRange');
    if ((options.roles || []).length === 0 && !options.customRole) warnings.push('missingRole');
    if (signals.atsScore !== null && signals.atsScore < 55) warnings.push('weakCvImpact');
    if (country.code === 'OTHER') warnings.push('customCountry');
    return unique(warnings);
  }

  function getCountry(code) {
    return COUNTRIES.find((item) => item.code === code) || COUNTRIES[0];
  }

  window.CVOSalary = {
    COUNTRIES,
    CURRENCIES,
    ROLE_OPTIONS,
    SENIORITY,
    EXPERIENCE_OPTIONS,
    estimate,
    formatRange,
    formatMoney,
    getCountry
  };
})(window);
