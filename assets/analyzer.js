(function (window) {
  'use strict';

  const SECTION_LABELS = {
    name: 'Nombre', email: 'Email', phone: 'Teléfono', linkedin: 'LinkedIn', github: 'GitHub', portfolio: 'Portfolio',
    profile: 'Perfil profesional', experience: 'Experiencia', education: 'Educación', skills: 'Competencias', certifications: 'Certificaciones', projects: 'Proyectos', languages: 'Idiomas', awards: 'Premios', other: 'Otros'
  };

  const ACTION_VERBS = ['led', 'built', 'created', 'improved', 'reduced', 'increased', 'managed', 'implemented', 'designed', 'automated', 'analyzed', 'coordinated', 'developed', 'optimized', 'lider', 'creé', 'cree', 'mejoré', 'mejore', 'reduje', 'aumenté', 'aumente', 'gestioné', 'gestione', 'implementé', 'implemente', 'diseñé', 'diseñe', 'automaticé', 'automatice', 'analicé', 'analice', 'coordiné', 'coordine', 'desarrollé', 'desarrolle', 'optimicé', 'optimice'];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalize(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function flattenCv(cv) {
    return ['name', 'profile', 'experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'awards', 'other']
      .map((key) => cv?.[key] || '')
      .join('\n');
  }

  function unique(items) {
    return Array.from(new Set((items || []).filter(Boolean)));
  }

  function tokenize(text) {
    return unique(normalize(text)
      .replace(/[^a-z0-9#+.\-/\s]/g, ' ')
      .split(/\s+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)))
      .slice(0, 180);
  }

  const STOP_WORDS = new Set(['and', 'the', 'for', 'with', 'from', 'that', 'this', 'are', 'you', 'your', 'our', 'will', 'can', 'por', 'para', 'con', 'del', 'las', 'los', 'una', 'uno', 'que', 'como', 'sus', 'ser', 'sin', 'más', 'mas', 'role', 'job', 'candidate', 'empresa', 'perfil', 'puesto']);

  function phrasePresent(text, phrase) {
    return normalize(text).includes(normalize(phrase));
  }

  function extractJobKeywords(jd, sector) {
    const fromLibrary = [
      ...(window.CVOTemplates.COMMON_KEYWORDS || []),
      ...((window.CVOTemplates.SECTOR_KEYWORDS || {})[sector] || [])
    ];
    const jdTokens = tokenize(jd).filter((token) => token.length > 3).slice(0, 45);
    const jdPhrases = Array.from(String(jd || '').matchAll(/\b[A-Z][A-Za-z0-9+.#/-]*(?:\s+[A-Z]?[A-Za-z0-9+.#/-]+){0,3}\b/g))
      .map((match) => match[0].trim())
      .filter((value) => value.length >= 4 && value.length <= 42)
      .slice(0, 35);
    return unique([...fromLibrary, ...jdTokens, ...jdPhrases]).slice(0, 90);
  }

  function getCompleteness(cv) {
    const core = ['name', 'email', 'profile', 'experience', 'education', 'skills'];
    const secondary = ['linkedin', 'github', 'portfolio', 'certifications', 'projects', 'languages'];
    const coreScore = core.filter((key) => String(cv?.[key] || '').trim()).length / core.length;
    const secondaryScore = secondary.filter((key) => String(cv?.[key] || '').trim()).length / secondary.length;
    return Math.round((coreScore * 0.75 + secondaryScore * 0.25) * 100);
  }

  function getMetrics(cvText) {
    return unique((cvText.match(/\b\d+(?:[.,]\d+)?\s*(?:%|k|m|alerts?|tickets?|incidents?|projects?|users?|hours?|days?|semanas?|meses?|años?|eur|usd|gbp|€|\$|£)?\b/gi) || [])
      .filter((item) => !/^20\d{2}$/.test(item.trim())))
      .slice(0, 18);
  }

  function getBullets(cv) {
    return String(`${cv?.experience || ''}\n${cv?.projects || ''}`)
      .split('\n')
      .map((line) => line.trim().replace(/^[•\-*]\s*/, ''))
      .filter((line) => line.length > 18);
  }

  function improveBullets(bullets) {
    return bullets.slice(0, 5).map((bullet) => {
      const hasMetric = /\d|%|€|\$|£/.test(bullet);
      const hasVerb = ACTION_VERBS.some((verb) => normalize(bullet).startsWith(normalize(verb)) || normalize(bullet).includes(` ${normalize(verb)} `));
      if (hasMetric && hasVerb) return null;
      return {
        original: bullet,
        suggestion: `Reescribir con acción + contexto + resultado medible: ${bullet}${hasMetric ? '' : ' (añade volumen, frecuencia, impacto o porcentaje si es real)'}.`
      };
    }).filter(Boolean);
  }

  function analyze(cv, jd, options) {
    const cvText = flattenCv(cv);
    const sector = options?.sector || 'other';
    const keywords = extractJobKeywords(jd, sector);
    const foundKeywords = keywords.filter((keyword) => phrasePresent(cvText, keyword)).slice(0, 30);
    const missingKeywords = keywords.filter((keyword) => !phrasePresent(cvText, keyword)).slice(0, 30);
    const keywordScore = keywords.length ? Math.round((foundKeywords.length / Math.min(keywords.length, 45)) * 100) : 55;
    const completeness = getCompleteness(cv);
    const metrics = getMetrics(cvText);
    const bulletImprovements = improveBullets(getBullets(cv));
    const formatChecks = [];
    if (/\b(photo|foto|dni|nif|birth|nacimiento|estado civil|marital)\b/i.test(cvText)) formatChecks.push('Evita datos personales no requeridos, especialmente para UK/Irlanda o procesos internacionales.');
    if (cvText.length > 9500) formatChecks.push('El CV parece largo. Prioriza una o dos páginas salvo CV académico.');
    if (!metrics.length) formatChecks.push('Faltan métricas cuantificables. Añade impacto real cuando exista.');
    if (!cv?.email) formatChecks.push('Falta email detectable.');
    if (!cv?.profile) formatChecks.push('Falta un perfil profesional breve.');

    const score = Math.max(10, Math.min(100, Math.round(completeness * 0.35 + keywordScore * 0.45 + Math.min(metrics.length, 8) * 2 + (cv?.linkedin ? 4 : 0) + (cv?.projects ? 4 : 0))));
    const incompleteSections = ['profile', 'experience', 'education', 'skills', 'languages']
      .filter((key) => !String(cv?.[key] || '').trim())
      .map((key) => SECTION_LABELS[key]);
    const recommendations = buildRecommendations(score, missingKeywords, incompleteSections, options);
    const formatRecommendation = recommendFormat(cv, options, jd);

    return {
      score,
      keywordScore,
      completeness,
      foundKeywords,
      missingKeywords,
      incompleteSections,
      metrics,
      risks: formatChecks,
      recommendations,
      bulletImprovements,
      formatRecommendation,
      formats: evaluateFormats(cv, options, jd)
    };
  }

  function buildRecommendations(score, missingKeywords, incompleteSections, options) {
    const recs = [];
    if (score < 65) recs.push('Ajusta el perfil y la experiencia para reflejar explícitamente requisitos de la oferta.');
    if (missingKeywords.length) recs.push(`Integra keywords relevantes de forma natural: ${missingKeywords.slice(0, 8).join(', ')}.`);
    if (incompleteSections.length) recs.push(`Completa secciones clave: ${incompleteSections.join(', ')}.`);
    if (options?.country === 'IE' || options?.country === 'GB') recs.push('Para UK/Irlanda evita foto, fecha de nacimiento, DNI y datos personales sensibles.');
    recs.push('Usa bullets con fórmula: acción + herramienta/contexto + resultado.');
    return recs;
  }

  function detectSignals(cv, options, jd) {
    const text = normalize(`${flattenCv(cv)}\n${jd || ''}\n${options?.targetRole || ''}`);
    const hasExperience = Boolean(String(cv?.experience || '').trim());
    const hasProjects = Boolean(String(cv?.projects || '').trim()) || /github|portfolio|project|proyecto/.test(text);
    const hasCerts = Boolean(String(cv?.certifications || '').trim());
    const hasMetrics = getMetrics(flattenCv(cv)).length > 0;
    const technical = /python|sql|siem|edr|docker|linux|azure|aws|power bi|autocad|p&id|hysys|api|javascript|data|engineering|ingenier/.test(text);
    const creative = options?.sector === 'marketing-comms' || /marketing|comunicacion|communication|design|ux|content|seo|campaign/.test(text);
    const academic = options?.sector === 'education-research' || /research|investigacion|academic|universidad|publication|paper|master|phd|doctorado/.test(text);
    const senior = ['senior', 'lead', 'executive'].includes(options?.level) || /manager|lead|head|director|responsable/.test(text);
    const uk = options?.country === 'IE' || options?.country === 'GB';
    const weakExperience = !hasExperience || String(cv?.experience || '').length < 90;
    return { hasExperience, hasProjects, hasCerts, hasMetrics, technical, creative, academic, senior, uk, weakExperience };
  }

  function evaluateFormats(cv, options, jd) {
    const s = detectSignals(cv, options, jd);
    return window.CVOTemplates.CV_FORMATS.map((format) => {
      let rating = 'orange';
      let reason = 'Puede encajar, pero depende de la oferta y del contenido.';
      switch (format.id) {
        case 'ats-simple':
          rating = 'green'; reason = 'Formato seguro para portales ATS y candidaturas online.'; break;
        case 'reverse-chronological':
          rating = s.hasExperience ? 'green' : 'orange'; reason = s.hasExperience ? 'Buena opción si tu experiencia reciente es relevante.' : 'Útil, pero tu experiencia parece limitada.'; break;
        case 'hybrid':
          rating = (s.technical || s.hasProjects || s.hasCerts) ? 'green' : 'orange'; reason = 'Equilibra competencias, perfil y experiencia sin saturar.'; break;
        case 'technical-projects':
          rating = (s.technical && s.hasProjects) ? 'green' : (s.technical ? 'orange' : 'red'); reason = s.technical ? 'Da visibilidad a herramientas y proyectos técnicos.' : 'No es prioritario si el perfil no es técnico.'; break;
        case 'uk-ireland':
          rating = s.uk ? 'green' : 'orange'; reason = s.uk ? 'Recomendado para UK/Irlanda: limpio, sin foto y orientado a logros.' : 'Útil para candidaturas internacionales.'; break;
        case 'academic':
          rating = s.academic ? 'green' : 'red'; reason = s.academic ? 'Adecuado para investigación, becas o admisiones.' : 'Demasiado académico para la mayoría de ofertas privadas.'; break;
        case 'europass':
          rating = (options?.country === 'ES' || options?.country === 'DE' || options?.country === 'FR') ? 'orange' : 'red'; reason = 'Solo recomendable si la convocatoria lo pide.'; break;
        case 'executive':
          rating = s.senior ? 'green' : 'red'; reason = s.senior ? 'Adecuado para liderazgo y gestión.' : 'Poco recomendable para perfiles junior.'; break;
        case 'functional':
          rating = s.weakExperience ? 'orange' : 'red'; reason = s.weakExperience ? 'Puede ayudar si hay cambio de sector o poca experiencia lineal.' : 'Menos transparente que un formato cronológico/híbrido.'; break;
        case 'visual-creative':
          rating = s.creative ? 'green' : 'red'; reason = s.creative ? 'Puede destacar en marketing, comunicación o diseño.' : 'Riesgo alto para ATS y perfiles técnicos/generalistas.'; break;
        default:
          break;
      }
      return { ...format, rating, reason };
    });
  }

  function recommendFormat(cv, options, jd) {
    const formats = evaluateFormats(cv, options, jd);
    const priority = ['hybrid', 'ats-simple', 'uk-ireland', 'technical-projects', 'reverse-chronological', 'academic', 'executive', 'functional', 'europass', 'visual-creative'];
    if (options?.country === 'IE' || options?.country === 'GB') priority.unshift('uk-ireland');
    if (options?.sector === 'education-research') priority.unshift('academic');
    if (options?.sector === 'marketing-comms') priority.unshift('visual-creative');
    if (['senior', 'lead', 'executive'].includes(options?.level)) priority.unshift('executive');
    const green = formats.filter((item) => item.rating === 'green');
    return green.sort((a, b) => priority.indexOf(a.id) - priority.indexOf(b.id))[0] || formats.find((item) => item.id === 'ats-simple') || formats[0];
  }

  function buildAiPrompt(cv, jd, analysis, options) {
    return `Actúa como especialista ATS y carrera profesional. Mejora este CV para el rol objetivo "${options?.targetRole || 'no especificado'}" en sector "${options?.sector || 'general'}" y país "${options?.country || 'no especificado'}".\n\nCV estructurado:\n${JSON.stringify(cv, null, 2)}\n\nOferta:\n${jd || 'No proporcionada'}\n\nAnálisis local:\n${JSON.stringify(analysis, null, 2)}\n\nDevuelve: resumen de riesgos, keywords faltantes integrables, bullets reescritos sin inventar datos y estructura final recomendada.`;
  }

  async function enhanceWithExternalAI(prompt, apiKey, endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.2 })
    });
    if (!response.ok) throw new Error(`External API error: ${response.status}`);
    const data = await response.json();
    return data?.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);
  }

  window.CVOAnalyzer = {
    SECTION_LABELS,
    escapeHtml,
    normalize,
    flattenCv,
    analyze,
    evaluateFormats,
    recommendFormat,
    buildAiPrompt,
    enhanceWithExternalAI
  };
})(window);
