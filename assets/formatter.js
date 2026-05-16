(function (window) {
  'use strict';

  const FIELD_CONFIG = [
    ['name', 'Nombre / Name', 'text', false],
    ['email', 'Email', 'text', false],
    ['phone', 'Teléfono / Phone', 'text', false],
    ['linkedin', 'LinkedIn', 'text', false],
    ['github', 'GitHub', 'text', false],
    ['portfolio', 'Portfolio', 'text', false],
    ['profile', 'Perfil profesional / Professional profile', 'textarea', true],
    ['skills', 'Competencias técnicas / Skills', 'textarea', true],
    ['experience', 'Experiencia laboral / Work experience', 'textarea', true],
    ['education', 'Educación / Education', 'textarea', true],
    ['certifications', 'Certificaciones / Certifications', 'textarea', true],
    ['projects', 'Proyectos / Projects', 'textarea', true],
    ['languages', 'Idiomas / Languages', 'textarea', true],
    ['awards', 'Premios / Awards', 'textarea', true]
  ];

  function escapeHtml(value) {
    return window.CVOAnalyzer.escapeHtml(value);
  }

  function lines(value) {
    return String(value || '').split('\n').map((line) => line.trim()).filter(Boolean);
  }

  function listHtml(value) {
    const items = lines(value);
    if (!items.length) return '';
    return `<ul>${items.map((item) => `<li>${escapeHtml(item.replace(/^[•\-–*]\s*/, ''))}</li>`).join('')}</ul>`;
  }

  function paragraphHtml(value) {
    return lines(value).map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  }

  function renderStructuredFields(cv) {
    return FIELD_CONFIG.map(([key, label, type, full]) => {
      const value = escapeHtml(cv[key] || '');
      const control = type === 'textarea'
        ? `<textarea id="field-${key}" data-field="${key}" rows="5">${value}</textarea>`
        : `<input id="field-${key}" data-field="${key}" type="text" value="${value}" />`;
      return `<div class="field-card ${full ? 'field-full' : ''}"><label for="field-${key}">${label}</label>${control}</div>`;
    }).join('');
  }

  function readStructuredFields(container, fallback) {
    const result = Object.assign({}, fallback || {});
    container.querySelectorAll('[data-field]').forEach((node) => {
      result[node.dataset.field] = node.value.trim();
    });
    return result;
  }

  function contactLine(cv, includePhone) {
    return [
      cv.email,
      includePhone ? cv.phone : '',
      cv.linkedin,
      cv.github,
      cv.portfolio
    ].filter(Boolean).map(escapeHtml).join(' | ');
  }

  function translatedSections(lang) {
    if (lang === 'en') {
      return {
        profile: 'Professional Profile', skills: 'Technical Skills', experience: 'Professional Experience', education: 'Education', certifications: 'Certifications', projects: 'Projects', languages: 'Languages', awards: 'Awards'
      };
    }
    return {
      profile: 'Perfil profesional', skills: 'Competencias técnicas', experience: 'Experiencia profesional', education: 'Educación', certifications: 'Certificaciones', projects: 'Proyectos', languages: 'Idiomas', awards: 'Premios y reconocimientos'
    };
  }

  function headerHtml(cv, options, className) {
    const includePhoto = options.includePhoto && options.photoDataUrl && !['uk', 'ats'].includes(className);
    const contact = contactLine(cv, className !== 'uk');
    const headerContent = `<div><h1>${escapeHtml(cv.name || (options.lang === 'en' ? 'Your Name' : 'Tu nombre'))}</h1><p class="contact">${contact}</p></div>`;
    if (!includePhoto) return headerContent;
    return `<div class="cv-header-with-photo">${headerContent}<img class="cv-photo" src="${options.photoDataUrl}" alt="Profile photo" /></div>`;
  }

  function renderAts(cv, options) {
    const s = translatedSections(options.lang);
    return `<article class="cv-template ats">
      ${headerHtml(cv, options, 'ats')}
      ${cv.profile ? `<h2>${s.profile}</h2>${paragraphHtml(cv.profile)}` : ''}
      ${cv.skills ? `<h2>${s.skills}</h2>${paragraphHtml(cv.skills)}` : ''}
      ${cv.experience ? `<h2>${s.experience}</h2>${listHtml(cv.experience) || paragraphHtml(cv.experience)}` : ''}
      ${cv.projects ? `<h2>${s.projects}</h2>${listHtml(cv.projects) || paragraphHtml(cv.projects)}` : ''}
      ${cv.education ? `<h2>${s.education}</h2>${paragraphHtml(cv.education)}` : ''}
      ${cv.certifications ? `<h2>${s.certifications}</h2>${listHtml(cv.certifications) || paragraphHtml(cv.certifications)}` : ''}
      ${cv.languages ? `<h2>${s.languages}</h2>${paragraphHtml(cv.languages)}` : ''}
    </article>`;
  }

  function renderHybrid(cv, options) {
    const s = translatedSections(options.lang);
    return `<article class="cv-template hybrid">
      ${headerHtml(cv, options, 'hybrid')}
      <h2>${s.profile}</h2>${paragraphHtml(cv.profile || '')}
      <h2>${s.skills}</h2>${paragraphHtml(cv.skills || '')}
      <h2>${s.experience}</h2>${listHtml(cv.experience) || paragraphHtml(cv.experience || '')}
      ${cv.projects ? `<h2>${s.projects}</h2>${listHtml(cv.projects) || paragraphHtml(cv.projects)}` : ''}
      <h2>${s.education}</h2>${paragraphHtml(cv.education || '')}
      ${cv.certifications ? `<h2>${s.certifications}</h2>${listHtml(cv.certifications) || paragraphHtml(cv.certifications)}` : ''}
      ${cv.languages ? `<h2>${s.languages}</h2>${paragraphHtml(cv.languages)}` : ''}
    </article>`;
  }

  function renderProject(cv, options) {
    const s = translatedSections(options.lang);
    const projectBlocks = lines(cv.projects).map((project) => `<div class="project-block"><p>${escapeHtml(project)}</p></div>`).join('');
    return `<article class="cv-template project">
      ${headerHtml(cv, options, 'project')}
      ${cv.profile ? `<h2>${s.profile}</h2>${paragraphHtml(cv.profile)}` : ''}
      ${cv.skills ? `<h2>${s.skills}</h2>${paragraphHtml(cv.skills)}` : ''}
      ${projectBlocks ? `<h2>${s.projects}</h2>${projectBlocks}` : ''}
      ${cv.experience ? `<h2>${s.experience}</h2>${listHtml(cv.experience) || paragraphHtml(cv.experience)}` : ''}
      ${cv.education ? `<h2>${s.education}</h2>${paragraphHtml(cv.education)}` : ''}
      ${cv.certifications ? `<h2>${s.certifications}</h2>${listHtml(cv.certifications) || paragraphHtml(cv.certifications)}` : ''}
    </article>`;
  }

  function renderUk(cv, options) {
    const s = translatedSections('en');
    return `<article class="cv-template uk">
      ${headerHtml(cv, Object.assign({}, options, { lang: 'en', includePhoto: false }), 'uk')}
      ${cv.profile ? `<h2>${s.profile}</h2>${paragraphHtml(cv.profile)}` : ''}
      ${cv.skills ? `<h2>${s.skills}</h2>${paragraphHtml(cv.skills)}` : ''}
      ${cv.experience ? `<h2>${s.experience}</h2>${listHtml(cv.experience) || paragraphHtml(cv.experience)}` : ''}
      ${cv.projects ? `<h2>${s.projects}</h2>${listHtml(cv.projects) || paragraphHtml(cv.projects)}` : ''}
      ${cv.education ? `<h2>${s.education}</h2>${paragraphHtml(cv.education)}` : ''}
      ${cv.certifications ? `<h2>${s.certifications}</h2>${listHtml(cv.certifications) || paragraphHtml(cv.certifications)}` : ''}
      ${cv.languages ? `<h2>${s.languages}</h2>${paragraphHtml(cv.languages)}` : ''}
    </article>`;
  }

  function renderAcademic(cv, options) {
    const s = translatedSections(options.lang);
    return `<article class="cv-template academic">
      ${headerHtml(cv, options, 'academic')}
      ${cv.profile ? `<h2>${s.profile}</h2>${paragraphHtml(cv.profile)}` : ''}
      ${cv.education ? `<h2>${s.education}</h2>${paragraphHtml(cv.education)}` : ''}
      ${cv.projects ? `<h2>${s.projects}</h2>${listHtml(cv.projects) || paragraphHtml(cv.projects)}` : ''}
      ${cv.certifications ? `<h2>${s.certifications}</h2>${listHtml(cv.certifications) || paragraphHtml(cv.certifications)}` : ''}
      ${cv.experience ? `<h2>${s.experience}</h2>${listHtml(cv.experience) || paragraphHtml(cv.experience)}` : ''}
      ${cv.skills ? `<h2>${s.skills}</h2>${paragraphHtml(cv.skills)}` : ''}
      ${cv.languages ? `<h2>${s.languages}</h2>${paragraphHtml(cv.languages)}` : ''}
      ${cv.awards ? `<h2>${s.awards}</h2>${listHtml(cv.awards) || paragraphHtml(cv.awards)}` : ''}
    </article>`;
  }

  function renderVisual(cv, options) {
    const s = translatedSections(options.lang);
    return `<article class="cv-template hybrid visual">
      ${headerHtml(cv, options, 'visual')}
      ${cv.profile ? `<h2>${s.profile}</h2>${paragraphHtml(cv.profile)}` : ''}
      ${cv.skills ? `<h2>${s.skills}</h2>${paragraphHtml(cv.skills)}` : ''}
      ${cv.projects ? `<h2>${s.projects}</h2>${listHtml(cv.projects) || paragraphHtml(cv.projects)}` : ''}
      ${cv.experience ? `<h2>${s.experience}</h2>${listHtml(cv.experience) || paragraphHtml(cv.experience)}` : ''}
      ${cv.education ? `<h2>${s.education}</h2>${paragraphHtml(cv.education)}` : ''}
    </article>`;
  }

  function generateCVHtml(cv, options) {
    const format = window.CVOTemplates.CV_FORMATS.find((item) => item.id === options.formatId) || window.CVOTemplates.CV_FORMATS[2];
    const template = format.template;
    if (template === 'hybrid') return renderHybrid(cv, options);
    if (template === 'project') return renderProject(cv, options);
    if (template === 'uk') return renderUk(cv, options);
    if (template === 'academic') return renderAcademic(cv, options);
    if (template === 'visual') return renderVisual(cv, options);
    return renderAts(cv, options);
  }

  function photoPolicyMessage(formatId, lang) {
    const format = window.CVOTemplates.CV_FORMATS.find((item) => item.id === formatId);
    const policy = format?.photo || 'optional';
    if (policy === 'avoid') return lang === 'en' ? 'Avoid photo for this format, especially UK/Ireland and international ATS.' : 'Para este formato se recomienda no incluir foto, especialmente UK/Irlanda y ATS internacional.';
    if (policy === 'not-recommended') return lang === 'en' ? 'Photo is not recommended for this format, but you can include it if needed.' : 'Para este formato no se recomienda incluir foto. Puedes incluirla igualmente si quieres.';
    if (policy === 'allowed') return lang === 'en' ? 'Photo can fit this format, but ATS compatibility may decrease.' : 'La foto puede encajar en este formato, aunque puede reducir compatibilidad ATS.';
    return lang === 'en' ? 'Photo is optional. For international technical roles, no photo is usually better.' : 'La foto es opcional. En perfiles técnicos internacionales suele ser mejor no incluirla.';
  }

  function readFinalCvText(container) {
    return (container.innerText || '').replace(/\n{3,}/g, '\n\n').trim();
  }

  window.CVOFormatter = {
    renderStructuredFields,
    readStructuredFields,
    generateCVHtml,
    photoPolicyMessage,
    readFinalCvText,
    FIELD_CONFIG
  };
})(window);
