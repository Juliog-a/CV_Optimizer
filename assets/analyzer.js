(function (window) {
  'use strict';

  const STOPWORDS = new Set([
    'the','and','for','with','from','this','that','you','your','are','will','our','can','has','have','not','but','all','into','their','they','job','role','candidate','required','experience',
    'de','la','el','los','las','con','para','por','una','uno','del','que','como','sus','ser','muy','más','mas','sin','son','perfil','puesto','trabajo','experiencia','requisitos'
  ]);

  const ACTION_VERBS = [
    'led','managed','built','created','implemented','improved','reduced','increased','automated','analyzed','monitored','triaged','documented','designed','optimized','coordinated','delivered',
    'lideré','gestione','gestioné','creé','implemente','implementé','mejoré','reduje','aumenté','automaticé','analicé','monitoricé','documenté','diseñé','optimicé','coordiné'
  ];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function normalize(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9+#.\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function containsKeyword(text, keyword) {
    return normalize(text).includes(normalize(keyword));
  }

  function getTopTerms(text, limit) {
    const words = normalize(text).split(' ')
      .filter((word) => word.length > 2 && !STOPWORDS.has(word) && !/^\d+$/.test(word));
    const counts = new Map();
    words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([word]) => word);
  }

  function unique(values) {
    return Array.from(new Set(values.filter(Boolean).map((item) => String(item).trim()).filter(Boolean)));
  }

  function flattenCv(cv) {
    return [cv.name, cv.email, cv.phone, cv.linkedin, cv.github, cv.portfolio, cv.profile, cv.skills, cv.experience, cv.education, cv.certifications, cv.projects, cv.languages, cv.awards, cv.raw]
      .filter(Boolean)
      .join('\n');
  }

  function getSelectedKeywordBase(roles, customRole, jobText) {
    const roleKeywords = [];
    (roles || []).forEach((role) => {
      roleKeywords.push(...(window.CVOTemplates.ROLE_KEYWORDS[role] || []));
    });
    if (!roles || roles.length === 0) roleKeywords.push(...window.CVOTemplates.ROLE_KEYWORDS['General / Other']);
    if (customRole) roleKeywords.push(...getTopTerms(customRole, 6));

    const commonPresent = window.CVOTemplates.COMMON_KEYWORDS.filter((kw) => containsKeyword(jobText, kw));
    const topTerms = getTopTerms(jobText, 24);
    return unique([...roleKeywords, ...commonPresent, ...topTerms]).slice(0, 54);
  }

  function sectionCompleteness(cv) {
    const important = ['profile', 'skills', 'experience', 'education'];
    const useful = ['certifications', 'projects', 'languages'];
    const presentImportant = important.filter((key) => String(cv[key] || '').trim().length > 20);
    const presentUseful = useful.filter((key) => String(cv[key] || '').trim().length > 5);
    const incomplete = [...important, ...useful].filter((key) => !String(cv[key] || '').trim());
    return { score: Math.min(20, presentImportant.length * 4 + presentUseful.length * 1.3), incomplete };
  }

  function detectTools(cvText) {
    return unique(window.CVOTemplates.COMMON_KEYWORDS.filter((kw) => containsKeyword(cvText, kw))).slice(0, 20);
  }

  function detectMetrics(cvText) {
    const metricMatches = cvText.match(/\b\d+(?:[.,]\d+)?\s?(?:%|k|K|M|h|hours|horas|alerts|alertas|incidents|incidentes|users|usuarios|tickets|días|days|€)/g) || [];
    return unique(metricMatches).slice(0, 12);
  }

  function detectActionVerbs(cvText) {
    return ACTION_VERBS.filter((verb) => containsKeyword(cvText, verb));
  }

  function detectRisks(cv, cvText) {
    const risks = [];
    const lineCount = cvText.split('\n').filter(Boolean).length;
    const wordCount = cvText.split(/\s+/).filter(Boolean).length;
    if (wordCount < 180) risks.push('CV demasiado corto: puede parecer incompleto para filtros ATS.');
    if (wordCount > 950) risks.push('CV largo: conviene condensar logros y priorizar lo relevante para la oferta.');
    if ((cvText.match(/\|/g) || []).length > 12 || (cvText.match(/\t/g) || []).length > 10) risks.push('Posible uso de tablas complejas: algunos ATS las interpretan mal.');
    if (!cv.email) risks.push('Falta email detectable.');
    if (!cv.linkedin && !cv.github && !cv.portfolio) risks.push('No se detectan enlaces profesionales.');
    if (!/[•\-–]\s/.test(cv.experience || cvText) && lineCount < 30) risks.push('La experiencia no parece estar estructurada en bullets.');
    if (detectMetrics(cvText).length === 0) risks.push('No se detectan métricas cuantitativas. Añade impacto medible cuando sea posible.');
    return risks;
  }

  function scoreCv(cv, cvText, keywords, found, jobText) {
    const keywordScore = keywords.length ? (found.length / keywords.length) * 40 : 18;
    const sections = sectionCompleteness(cv);
    const metrics = detectMetrics(cvText);
    const verbs = detectActionVerbs(cvText);
    const linkScore = [cv.linkedin, cv.github, cv.portfolio].filter(Boolean).length > 0 ? 5 : 0;
    const metricsScore = Math.min(10, metrics.length * 2.5);
    const verbsScore = Math.min(8, verbs.length * 1.7);
    const toolsScore = Math.min(8, detectTools(cvText).length * 0.9);
    const length = cvText.split(/\s+/).filter(Boolean).length;
    const lengthScore = length >= 220 && length <= 900 ? 6 : 2;
    const jdBonus = jobText.trim().length > 40 ? 3 : 0;
    const rawScore = keywordScore + sections.score + metricsScore + verbsScore + toolsScore + linkScore + lengthScore + jdBonus;
    return Math.max(0, Math.min(100, Math.round(rawScore)));
  }

  function extractBulletCandidates(cv) {
    const source = [cv.experience, cv.projects, cv.raw].filter(Boolean).join('\n');
    return source.split('\n')
      .map((line) => line.replace(/^[•\-–*]\s*/, '').trim())
      .filter((line) => line.length > 18 && line.length < 190)
      .filter((line, index, arr) => arr.indexOf(line) === index)
      .slice(0, 8);
  }

  function improveBullet(line, roles, lang, tools) {
    const lowerRoles = (roles || []).join(' ').toLowerCase();
    const toolText = tools.slice(0, 3).join(', ') || '[tool/context]';
    if (/monitor|alert|siem|soc|triage|alerta/i.test(line) || lowerRoles.includes('soc')) {
      return lang === 'en'
        ? `Monitored and triaged [X] daily SIEM alerts across ${toolText}, prioritizing incidents by risk and escalating confirmed threats according to SOC procedures.`
        : `Monitoricé y triaje [X] alertas diarias en SIEM usando ${toolText}, priorizando incidentes por riesgo y escalando amenazas confirmadas según procedimientos SOC.`;
    }
    if (/audit|iso|risk|compliance|policy|control|cumpl|riesgo/i.test(line) || lowerRoles.includes('grc')) {
      return lang === 'en'
        ? `Supported ISO 27001 control reviews and risk assessments, documenting evidence, gaps and remediation actions for audit-ready compliance.`
        : `Apoyé revisiones de controles ISO 27001 y evaluaciones de riesgo, documentando evidencias, brechas y acciones correctivas para auditoría.`;
    }
    if (/project|proyecto|develop|built|script|github|python|data/i.test(line)) {
      return lang === 'en'
        ? `Built a practical project using ${toolText}, documenting objectives, implementation decisions and measurable outcomes to demonstrate role-relevant capability.`
        : `Desarrollé un proyecto práctico usando ${toolText}, documentando objetivos, decisiones técnicas y resultados medibles para demostrar capacidad aplicable al rol.`;
    }
    return lang === 'en'
      ? `Improved ${line.toLowerCase()} by applying [method/tool], tracking [metric] and delivering [business or technical impact].`
      : `Mejoré ${line.toLowerCase()} aplicando [método/herramienta], midiendo [métrica] y generando [impacto técnico o de negocio].`;
  }

  function recommendFormat(cv, options) {
    const text = flattenCv(cv);
    const roles = options.roles || [];
    const destination = options.destination || 'spain';
    const hasProjects = Boolean(cv.projects || cv.github || /github|project|proyecto|portfolio/i.test(text));
    const hasCerts = Boolean(cv.certifications || /certification|certificacion|certificación|ISO|Microsoft|AWS|Azure|Cisco/i.test(text));
    const isCyberOrTechnical = /SOC|Cyber|Threat|Detection|Cloud|DFIR|Security|Engineer|Developer|Data|Process/i.test([...roles, options.customRole || ''].join(' '));
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    let id = 'reverse-chronological';
    if (destination === 'uk-ie' || destination === 'international-ats') id = 'uk-ireland';
    else if (destination === 'academic') id = 'academic';
    else if (isCyberOrTechnical && hasProjects) id = 'hybrid-technical';
    else if (hasProjects && wordCount < 650) id = 'technical-projects';
    else if (hasCerts || isCyberOrTechnical) id = 'hybrid-technical';
    else id = 'ats-simple';

    const format = window.CVOTemplates.CV_FORMATS.find((item) => item.id === id) || window.CVOTemplates.CV_FORMATS[0];
    const explanationEs = id === 'uk-ireland'
      ? 'Recomendado porque el destino es UK/Irlanda o ATS internacional: evita foto y datos personales no necesarios, prioriza logros medibles y lenguaje directo.'
      : id === 'academic'
        ? 'Recomendado porque el destino es académico: permite destacar formación, proyectos, certificaciones, investigación y continuidad formativa.'
        : id === 'technical-projects'
          ? 'Recomendado porque el perfil contiene proyectos o portfolio. Este formato permite demostrar capacidad práctica aunque la experiencia formal sea limitada.'
          : id === 'hybrid-technical'
            ? 'Recomendado porque combina experiencia, herramientas, certificaciones y proyectos. Es sólido para perfiles técnicos, ingeniería, IT y ciberseguridad.'
            : 'Recomendado por su compatibilidad ATS, claridad y utilidad para la mayoría de candidaturas profesionales.';
    const explanationEn = id === 'uk-ireland'
      ? 'Recommended because the target is UK/Ireland or international ATS: avoid photos and unnecessary personal data, prioritize measurable achievements and direct language.'
      : id === 'academic'
        ? 'Recommended because the target is academic: it highlights education, projects, certifications, research and further study potential.'
        : id === 'technical-projects'
          ? 'Recommended because the profile includes projects or a portfolio. It demonstrates practical capability even with limited formal experience.'
          : id === 'hybrid-technical'
            ? 'Recommended because it combines experience, tools, certifications and projects. Strong for technical, engineering, IT and cybersecurity profiles.'
            : 'Recommended because it is ATS-compatible, clear and useful for most professional applications.';

    return { id, name: format.name, explanation: { es: explanationEs, en: explanationEn }, format };
  }

  function buildLinkedIn(cv, analysis, options) {
    const lang = options.lang || 'es';
    const roles = (options.roles && options.roles.length ? options.roles : [options.customRole || 'Professional']).slice(0, 2);
    const tools = analysis.tools.slice(0, 6);
    const skills = unique([...analysis.foundKeywords, ...tools]).slice(0, 18);
    const headlineEn = `${roles.join(' / ')} | ${tools.slice(0, 4).join(', ') || 'Problem Solving, Analysis & Documentation'} | ${analysis.foundKeywords.slice(0, 3).join(', ') || 'ATS-focused profile'}`;
    const headlineEs = `${roles.join(' / ')} | ${tools.slice(0, 4).join(', ') || 'Análisis, documentación y mejora de procesos'} | ${analysis.foundKeywords.slice(0, 3).join(', ') || 'Perfil optimizado ATS'}`;

    const aboutEn = `I am a ${roles[0]} profile focused on practical execution, clear documentation and measurable improvement. My experience combines ${skills.slice(0, 6).join(', ') || 'technical analysis, communication and structured problem solving'}. I am interested in roles where I can turn operational evidence into better decisions, cleaner processes and stronger outcomes.`;
    const aboutEs = `Soy un perfil ${roles[0]} orientado a ejecución práctica, documentación clara y mejora medible. Combino ${skills.slice(0, 6).join(', ') || 'análisis técnico, comunicación y resolución estructurada de problemas'}. Busco roles donde pueda convertir evidencia operativa en mejores decisiones, procesos más claros y resultados sólidos.`;

    return {
      headline: lang === 'en' ? headlineEn : headlineEs,
      about: lang === 'en' ? aboutEn : aboutEs,
      skills,
      featured: cv.projects ? cv.projects.split('\n').filter(Boolean).slice(0, 3) : ['Add one relevant project, portfolio item or case study with context, tools and outcome.'],
      recruiterPitch: lang === 'en'
        ? `Open to ${roles.join(' / ')} opportunities. I bring hands-on experience with ${tools.slice(0, 5).join(', ') || 'technical analysis and documentation'} and a strong focus on ATS-readable impact.`
        : `Abierto a oportunidades como ${roles.join(' / ')}. Aporto experiencia práctica con ${tools.slice(0, 5).join(', ') || 'análisis técnico y documentación'} y foco en impacto claro y legible para ATS.`
    };
  }

  function analyze(cv, jobText, options) {
    const cvText = flattenCv(cv);
    const keywords = getSelectedKeywordBase(options.roles, options.customRole, jobText || cvText);
    const foundKeywords = keywords.filter((keyword) => containsKeyword(cvText, keyword));
    const missingKeywords = keywords.filter((keyword) => !containsKeyword(cvText, keyword)).slice(0, 24);
    const sections = sectionCompleteness(cv);
    const risks = detectRisks(cv, cvText);
    const tools = detectTools(cvText);
    const metrics = detectMetrics(cvText);
    const actionVerbs = detectActionVerbs(cvText);
    const score = scoreCv(cv, cvText, keywords, foundKeywords, jobText || '');
    const bulletImprovements = extractBulletCandidates(cv).map((original) => ({
      original,
      improved: improveBullet(original, options.roles, options.lang, tools)
    }));

    const recommendations = [];
    if (missingKeywords.length) recommendations.push(`Añade palabras clave relevantes si son reales en tu experiencia: ${missingKeywords.slice(0, 8).join(', ')}.`);
    if (metrics.length < 2) recommendations.push('Convierte tareas en logros con métricas: volumen, tiempo, porcentaje, ahorro, calidad o reducción de errores.');
    if (!cv.profile) recommendations.push('Añade un perfil profesional breve de 3-4 líneas adaptado al rol objetivo.');
    if (!cv.projects && (cv.github || tools.length > 3)) recommendations.push('Añade proyectos con problema, herramientas, implementación y resultado.');
    if (!cv.certifications && /cyber|security|cloud|grc|soc|data|engineer/i.test((options.roles || []).join(' ') + ' ' + (options.customRole || ''))) recommendations.push('Incluye certificaciones o formación relevante si la tienes; evita listar cursos sin relación directa.');
    recommendations.push('Mantén el CV sin tablas complejas, con secciones estándar y bullets orientados a impacto.');

    const formatRecommendation = recommendFormat(cv, options);
    const linkedin = buildLinkedIn(cv, { foundKeywords, tools }, options);

    return {
      score,
      foundKeywords,
      missingKeywords,
      incompleteSections: sections.incomplete,
      recommendations,
      risks,
      tools,
      metrics,
      actionVerbs,
      bulletImprovements,
      formatRecommendation,
      linkedin,
      mode: 'heuristic'
    };
  }

  function buildAiPrompt(cv, jobText, analysis, options) {
    const langInstruction = options.lang === 'en' ? 'Write the output in English.' : 'Redacta la salida en español de España.';
    return `${langInstruction}\n\nActúa como experto ATS, recruiter técnico y editor de CV. Mejora el siguiente CV para el rol objetivo: ${(options.roles || []).join(', ') || options.customRole || 'general professional role'}.\n\nReglas:\n- No inventes experiencia, empresas, certificaciones ni métricas.\n- Si falta una métrica, usa placeholders editables como [X] o [metric].\n- Mantén formato ATS-friendly, sin tablas complejas.\n- Devuelve: perfil profesional, bullets mejorados, skills priorizadas, riesgos ATS, y versión LinkedIn headline/about.\n\nCV:\n${JSON.stringify(cv, null, 2)}\n\nJob description:\n${jobText || 'No job description provided.'}\n\nAnálisis heurístico actual:\n${JSON.stringify(analysis || {}, null, 2)}`;
  }

  async function enhanceWithExternalAI(prompt, apiKey, endpoint) {
    const url = endpoint || 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert ATS CV editor. Return concise, structured output.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3
      })
    });
    if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  window.CVOAnalyzer = {
    analyze,
    recommendFormat,
    buildAiPrompt,
    enhanceWithExternalAI,
    escapeHtml,
    normalize,
    flattenCv
  };
})(window);
