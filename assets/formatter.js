(function (window) {
  'use strict';

  const SECTION_ORDER = ['profile', 'skills', 'experience', 'projects', 'education', 'certifications', 'languages', 'awards', 'other'];
  const SECTION_TITLES = {
    es: {
      profile: 'Perfil profesional', skills: 'Competencias', experience: 'Experiencia profesional', projects: 'Proyectos', education: 'Educación', certifications: 'Certificaciones', languages: 'Idiomas', awards: 'Premios y reconocimientos', other: 'Otros'
    },
    en: {
      profile: 'Professional summary', skills: 'Skills', experience: 'Work experience', projects: 'Projects', education: 'Education', certifications: 'Certifications', languages: 'Languages', awards: 'Awards', other: 'Additional information'
    }
  };

  function escapeHtml(value) {
    return window.CVOAnalyzer ? window.CVOAnalyzer.escapeHtml(value) : String(value || '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function isReasonableSection(value, raw) {
    const text = String(value || '').trim();
    if (!text) return false;
    if (text.length > 6000) return false;
    if (raw && text.length > raw.length * 0.72) return false;
    return true;
  }

  function normalizeLines(value) {
    return String(value || '')
      .replace(/\r/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function renderSectionContent(value) {
    const lines = normalizeLines(value);
    if (!lines.length) return '';
    const bulletLike = lines.filter((line) => /^[•\-*]/.test(line)).length >= Math.max(1, Math.ceil(lines.length * 0.35));
    if (bulletLike) {
      return `<ul>${lines.map((line) => `<li>${escapeHtml(line.replace(/^[•\-*]\s*/, ''))}</li>`).join('')}</ul>`;
    }
    if (lines.length === 1) return `<p>${escapeHtml(lines[0])}</p>`;
    return lines.map((line) => /^[•\-*]/.test(line)
      ? `<ul><li>${escapeHtml(line.replace(/^[•\-*]\s*/, ''))}</li></ul>`
      : `<p>${escapeHtml(line)}</p>`).join('');
  }

  function contactLine(cv, options) {
    const items = [];
    if (cv.email) items.push(cv.email);
    if (cv.phone && options.formatId !== 'uk-ireland') items.push(cv.phone);
    if (cv.linkedin) items.push(cv.linkedin);
    if (cv.github) items.push(cv.github);
    if (cv.portfolio) items.push(cv.portfolio);
    return items.map(escapeHtml).join(' · ');
  }

  function generateCVHtml(cv, options) {
    const lang = options?.lang || 'es';
    const formatId = options?.formatId || 'ats-simple';
    const templateClass = `cv-${formatId}`.replace(/[^a-z0-9_-]/gi, '-');
    const raw = cv?.raw || '';
    const sections = SECTION_ORDER
      .filter((key) => isReasonableSection(cv?.[key], raw))
      .map((key) => `<section><h2>${escapeHtml((SECTION_TITLES[lang] || SECTION_TITLES.es)[key])}</h2>${renderSectionContent(cv[key])}</section>`)
      .join('');

    const name = cv?.name || (lang === 'en' ? 'Name not detected' : 'Nombre no detectado');
    const contact = contactLine(cv || {}, options || {});
    return `<article class="cv-document ${templateClass}" data-format="${escapeHtml(formatId)}">
      <header>
        <h1>${escapeHtml(name)}</h1>
        ${contact ? `<p class="contact">${contact}</p>` : ''}
      </header>
      ${sections || `<p>${lang === 'en' ? 'No structured sections detected. Complete the manual editor before exporting.' : 'No se han detectado secciones estructuradas. Completa el editor manual antes de exportar.'}</p>`}
    </article>`;
  }

  function readFinalCvText(node) {
    return String(node?.innerText || node?.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
  }

  window.CVOFormatter = {
    SECTION_ORDER,
    SECTION_TITLES,
    generateCVHtml,
    readFinalCvText,
    isReasonableSection
  };
})(window);
