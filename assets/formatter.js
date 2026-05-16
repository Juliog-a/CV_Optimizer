(function (window) {
  'use strict';

  const SECTION_TITLES = {
    es: {
      profile: 'Perfil profesional', skills: 'Competencias', experience: 'Experiencia profesional', projects: 'Proyectos', education: 'Educación', certifications: 'Certificaciones', languages: 'Idiomas', awards: 'Premios y reconocimientos', other: 'Otros', achievements: 'Logros destacados', contact: 'Contacto'
    },
    en: {
      profile: 'Professional summary', skills: 'Skills', experience: 'Work experience', projects: 'Projects', education: 'Education', certifications: 'Certifications', languages: 'Languages', awards: 'Awards', other: 'Additional information', achievements: 'Selected achievements', contact: 'Contact'
    }
  };

  const FORMAT_SECTION_ORDER = {
    'reverse-chronological': ['profile', 'experience', 'education', 'certifications', 'skills', 'projects', 'languages', 'awards', 'other'],
    hybrid: ['profile', 'skills', 'experience', 'projects', 'education', 'certifications', 'languages', 'awards', 'other'],
    'ats-simple': ['profile', 'skills', 'experience', 'education', 'certifications', 'projects', 'languages', 'awards', 'other'],
    'technical-projects': ['profile', 'skills', 'projects', 'experience', 'education', 'certifications', 'languages', 'awards', 'other'],
    'uk-ireland': ['profile', 'skills', 'experience', 'projects', 'education', 'certifications', 'languages', 'awards', 'other'],
    academic: ['profile', 'education', 'projects', 'certifications', 'awards', 'experience', 'skills', 'languages', 'other'],
    europass: ['experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'awards', 'other'],
    executive: ['profile', 'experience', 'achievements', 'skills', 'projects', 'education', 'certifications', 'languages', 'awards', 'other'],
    functional: ['profile', 'skills', 'projects', 'experience', 'education', 'certifications', 'languages', 'awards', 'other'],
    'visual-creative': ['profile', 'skills', 'projects', 'experience', 'education', 'certifications', 'languages', 'awards', 'other']
  };

  const SECTION_ORDER = FORMAT_SECTION_ORDER.hybrid;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function normalizeText(value) {
    return String(value || '').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function normalizeLines(value) {
    return normalizeText(value).split('\n').map((line) => line.trim()).filter(Boolean);
  }

  function isReasonableSection(value, raw) {
    const text = normalizeText(value);
    if (!text) return false;
    if (text.length > 6500) return false;
    if (raw && text.length > String(raw).length * 0.72) return false;
    return true;
  }

  function titleFor(key, lang) {
    return (SECTION_TITLES[lang] || SECTION_TITLES.es)[key] || key;
  }

  function sectionValue(cv, key) {
    if (key === 'achievements') return extractAchievements(cv);
    return cv?.[key] || '';
  }

  function sectionExists(cv, key) {
    return isReasonableSection(sectionValue(cv, key), cv?.raw || '');
  }

  function splitItems(value) {
    const text = normalizeText(value);
    if (!text) return [];
    const lines = normalizeLines(text);
    if (lines.length > 1) {
      return lines.map((line) => line.replace(/^[•\-*–—·]\s*/, '').trim()).filter(Boolean);
    }
    return text
      .split(/(?:;|\s·\s|\s\|\s|,(?=\s*[A-ZÁÉÍÓÚÑa-záéíóúñ0-9+#]))/g)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function renderParagraphs(value) {
    const lines = normalizeLines(value);
    if (!lines.length) return '';
    const bulletCount = lines.filter((line) => /^[•\-*–—·]/.test(line)).length;
    if (bulletCount >= Math.max(1, Math.ceil(lines.length * 0.35))) return renderBullets(lines);
    return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  }

  function renderBullets(linesOrText) {
    const lines = Array.isArray(linesOrText) ? linesOrText : normalizeLines(linesOrText);
    const items = lines.map((line) => line.replace(/^[•\-*–—·]\s*/, '').trim()).filter(Boolean);
    if (!items.length) return '';
    return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function renderSkillChips(value, limit) {
    const items = splitItems(value).slice(0, limit || 36);
    if (!items.length) return '';
    return `<div class="skill-chips">${items.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>`;
  }

  function renderSection(cv, key, options) {
    const lang = options.lang || 'es';
    const value = sectionValue(cv, key);
    if (!isReasonableSection(value, cv?.raw || '')) return '';
    const className = `section-${key}`;
    let body;
    if (key === 'skills') body = options.skillsAsChips ? renderSkillChips(value) : renderParagraphs(value);
    else if (['projects', 'certifications', 'languages', 'awards', 'achievements'].includes(key)) body = renderBullets(value);
    else body = renderParagraphs(value);
    if (!body) return '';
    return `<section class="${className}"><h2>${escapeHtml(titleFor(key, lang))}</h2>${body}</section>`;
  }

  function renderSections(cv, formatId, options) {
    const order = FORMAT_SECTION_ORDER[formatId] || SECTION_ORDER;
    return order.map((key) => renderSection(cv, key, options)).join('');
  }

  function getFormat(formatId) {
    return window.CVOTemplates?.getFormat?.(formatId) || { id: 'ats-simple', photoPolicy: 'blocked' };
  }

  function canShowPhoto(cv, formatId) {
    const format = getFormat(formatId);
    return Boolean(cv?.photo?.enabled && cv.photo.dataUrl && (format.photoPolicy === 'optional' || format.photoPolicy === 'recommended'));
  }

  function renderPhoto(cv, formatId) {
    if (!canShowPhoto(cv, formatId)) return '';
    return `<img class="cv-photo" src="${escapeHtml(cv.photo.dataUrl)}" alt="Foto profesional" />`;
  }

  function contactItems(cv, options) {
    const formatId = options.formatId || 'ats-simple';
    const items = [];
    if (cv.email) items.push({ key: 'email', value: cv.email });
    if (cv.phone && formatId !== 'uk-ireland') items.push({ key: 'phone', value: cv.phone });
    if (cv.linkedin) items.push({ key: 'linkedin', value: cv.linkedin });
    if (cv.github) items.push({ key: 'github', value: cv.github });
    if (cv.portfolio) items.push({ key: 'portfolio', value: cv.portfolio });
    return items;
  }

  function contactLine(cv, options) {
    return contactItems(cv, options).map((item) => `<span>${escapeHtml(item.value)}</span>`).join('<span class="sep">·</span>');
  }

  function renderHeader(cv, options, variant) {
    const lang = options.lang || 'es';
    const formatId = options.formatId || 'ats-simple';
    const name = cv?.name || (lang === 'en' ? 'Name not detected' : 'Nombre no detectado');
    const contact = contactLine(cv || {}, options || {});
    const photo = renderPhoto(cv, formatId);
    if (variant === 'split') {
      return `<header class="cv-header split"><div>${photo}</div><div><h1>${escapeHtml(name)}</h1>${contact ? `<p class="contact">${contact}</p>` : ''}</div></header>`;
    }
    if (variant === 'sidebar') {
      return `<header class="cv-header sidebar-head">${photo}<h1>${escapeHtml(name)}</h1>${contact ? `<p class="contact">${contact}</p>` : ''}</header>`;
    }
    if (variant === 'banner') {
      return `<header class="cv-header banner"><div>${photo}</div><div><h1>${escapeHtml(name)}</h1>${contact ? `<p class="contact">${contact}</p>` : ''}</div></header>`;
    }
    return `<header class="cv-header standard">${photo}<h1>${escapeHtml(name)}</h1>${contact ? `<p class="contact">${contact}</p>` : ''}</header>`;
  }

  function extractAchievements(cv) {
    const text = normalizeText(`${cv?.experience || ''}\n${cv?.projects || ''}`);
    const lines = normalizeLines(text).filter((line) => /\b(\d+[%+]?|reducci[oó]n|mejora|aument|automat|optimiz|lider|coordin|impact|kpi|mttr|ahorr|growth|revenue|cost)\b/i.test(line));
    return lines.slice(0, 5).join('\n');
  }

  function renderMissing(lang) {
    return `<p class="empty-cv-msg">${lang === 'en' ? 'No structured sections detected. Complete the manual editor before exporting.' : 'No se han detectado secciones estructuradas. Completa el editor manual antes de exportar.'}</p>`;
  }

  function renderClassic(cv, options) {
    return `${renderHeader(cv, options, 'standard')}${renderSections(cv, options.formatId, { ...options, skillsAsChips: options.formatId !== 'ats-simple' })}`;
  }

  function renderATS(cv, options) {
    return `${renderHeader(cv, options, 'standard')}${renderSections(cv, 'ats-simple', { ...options, skillsAsChips: false })}`;
  }

  function renderHybrid(cv, options) {
    return `${renderHeader(cv, options, 'split')}${renderSections(cv, 'hybrid', { ...options, skillsAsChips: true })}`;
  }

  function renderTechnicalProjects(cv, options) {
    return `${renderHeader(cv, options, 'standard')}${renderSections(cv, 'technical-projects', { ...options, skillsAsChips: true })}`;
  }

  function renderUk(cv, options) {
    return `${renderHeader(cv, { ...options, formatId: 'uk-ireland' }, 'standard')}<div class="market-note">UK/Ireland format: no photo, no age, no marital status, no sensitive personal data.</div>${renderSections(cv, 'uk-ireland', { ...options, skillsAsChips: true })}`;
  }

  function renderAcademic(cv, options) {
    return `${renderHeader(cv, options, 'standard')}${renderSections(cv, 'academic', { ...options, skillsAsChips: false })}`;
  }

  function renderEuropass(cv, options) {
    const lang = options.lang || 'es';
    const side = ['email', 'phone', 'linkedin', 'github', 'portfolio'].map((key) => cv?.[key] ? `<p><strong>${escapeHtml(key === 'github' ? 'GitHub / Web' : key)}</strong><br>${escapeHtml(cv[key])}</p>` : '').join('');
    const languages = sectionExists(cv, 'languages') ? `<h2>${escapeHtml(titleFor('languages', lang))}</h2>${renderBullets(cv.languages)}` : '';
    return `<div class="europass-layout"><aside>${renderPhoto(cv, 'europass')}<h1>${escapeHtml(cv?.name || 'Nombre')}</h1>${side}${languages}</aside><main>${renderSections(cv, 'europass', { ...options, skillsAsChips: false })}</main></div>`;
  }

  function renderExecutive(cv, options) {
    return `${renderHeader(cv, options, 'banner')}${renderSections(cv, 'executive', { ...options, skillsAsChips: true })}`;
  }

  function renderFunctional(cv, options) {
    return `${renderHeader(cv, options, 'split')}${renderSections(cv, 'functional', { ...options, skillsAsChips: true })}`;
  }

  function renderVisual(cv, options) {
    return `${renderHeader(cv, options, 'banner')}${renderSections(cv, 'visual-creative', { ...options, skillsAsChips: true })}`;
  }

  function generateCVHtml(cv, options) {
    const lang = options?.lang || 'es';
    const formatId = options?.formatId || 'ats-simple';
    const templateClass = `cv-${formatId}`.replace(/[^a-z0-9_-]/gi, '-');
    let body = '';
    switch (formatId) {
      case 'hybrid': body = renderHybrid(cv, { ...options, formatId }); break;
      case 'ats-simple': body = renderATS(cv, { ...options, formatId }); break;
      case 'technical-projects': body = renderTechnicalProjects(cv, { ...options, formatId }); break;
      case 'uk-ireland': body = renderUk(cv, { ...options, formatId }); break;
      case 'academic': body = renderAcademic(cv, { ...options, formatId }); break;
      case 'europass': body = renderEuropass(cv, { ...options, formatId }); break;
      case 'executive': body = renderExecutive(cv, { ...options, formatId }); break;
      case 'functional': body = renderFunctional(cv, { ...options, formatId }); break;
      case 'visual-creative': body = renderVisual(cv, { ...options, formatId }); break;
      case 'reverse-chronological':
      default: body = renderClassic(cv, { ...options, formatId }); break;
    }
    const hasSections = (FORMAT_SECTION_ORDER[formatId] || SECTION_ORDER).some((key) => sectionExists(cv, key));
    return `<article class="cv-document ${templateClass}" data-format="${escapeHtml(formatId)}">${body}${hasSections ? '' : renderMissing(lang)}</article>`;
  }

  function exportLines(cv, options) {
    const lang = options?.lang || 'es';
    const formatId = options?.formatId || 'ats-simple';
    const lines = [];
    lines.push(cv?.name || (lang === 'en' ? 'Name' : 'Nombre'));
    contactItems(cv || {}, options || {}).forEach((item) => lines.push(item.value));
    (FORMAT_SECTION_ORDER[formatId] || SECTION_ORDER).forEach((key) => {
      const value = sectionValue(cv || {}, key);
      if (!isReasonableSection(value, cv?.raw || '')) return;
      lines.push('');
      lines.push(titleFor(key, lang));
      normalizeLines(value).forEach((line) => {
        const clean = line.replace(/^[•\-*–—·]\s*/, '');
        if (['projects', 'certifications', 'languages', 'awards', 'achievements'].includes(key) || /^[•\-*–—·]/.test(line)) lines.push(`• ${clean}`);
        else lines.push(clean);
      });
    });
    return lines;
  }

  function readFinalCvText(node) {
    return String(node?.innerText || node?.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  }

  window.CVOFormatter = {
    SECTION_ORDER,
    SECTION_TITLES,
    FORMAT_SECTION_ORDER,
    generateCVHtml,
    readFinalCvText,
    isReasonableSection,
    exportLines,
    splitItems,
    normalizeLines,
    canShowPhoto,
    titleFor
  };
})(window);
