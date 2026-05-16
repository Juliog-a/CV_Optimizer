(function (window) {
  'use strict';

  const SECTION_ALIASES = {
    profile: ['perfil', 'perfil profesional', 'profile', 'professional profile', 'summary', 'resumen', 'about', 'objective', 'objetivo'],
    skills: ['competencias', 'competencias tecnicas', 'competencias técnicas', 'skills', 'technical skills', 'herramientas', 'technologies', 'tecnologias', 'tecnologías', 'aptitudes'],
    experience: ['experiencia', 'experiencia laboral', 'professional experience', 'experience', 'work experience', 'employment', 'experiencia profesional'],
    education: ['educacion', 'educación', 'education', 'academic background', 'formacion', 'formación', 'studies', 'estudios'],
    certifications: ['certificaciones', 'certifications', 'certificados', 'certificates', 'licencias', 'licenses'],
    projects: ['proyectos', 'projects', 'portfolio', 'github projects', 'personal projects'],
    languages: ['idiomas', 'languages'],
    awards: ['premios', 'awards', 'honors', 'reconocimientos']
  };

  function normalizeHeading(value) {
    return String(value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[:\-–—|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function cleanText(text) {
    return String(text || '')
      .replace(/\r/g, '\n')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  function readArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  async function extractPdfText(file) {
    if (!window.pdfjsLib) throw new Error('pdf.js is not loaded');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const buffer = await readArrayBuffer(file);
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => item.str).join(' '));
    }
    return cleanText(pages.join('\n'));
  }

  async function extractDocxText(file) {
    if (!window.mammoth) throw new Error('mammoth.js is not loaded');
    const arrayBuffer = await readArrayBuffer(file);
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return cleanText(result.value || '');
  }

  async function extractTextFromFile(file) {
    if (!file) return '';
    const lower = file.name.toLowerCase();
    if (lower.endsWith('.pdf') || file.type === 'application/pdf') return extractPdfText(file);
    if (lower.endsWith('.docx') || file.type.includes('wordprocessingml')) return extractDocxText(file);
    if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.json') || file.type.startsWith('text/')) return cleanText(await readTextFile(file));
    return cleanText(await readTextFile(file));
  }

  function detectSection(line) {
    const normalized = normalizeHeading(line);
    if (!normalized || normalized.length > 46) return null;
    for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
      if (aliases.some((alias) => normalized === normalizeHeading(alias))) return key;
    }
    return null;
  }

  function splitSections(text) {
    const sections = {
      profile: [], skills: [], experience: [], education: [], certifications: [], projects: [], languages: [], awards: []
    };
    let current = null;
    cleanText(text).split('\n').forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line) return;
      const detected = detectSection(line);
      if (detected) {
        current = detected;
        return;
      }
      if (current) sections[current].push(line);
    });
    return Object.fromEntries(Object.entries(sections).map(([key, lines]) => [key, cleanText(lines.join('\n'))]));
  }

  function pickName(lines, email, phone) {
    const badTokens = ['cv', 'curriculum', 'resume', 'linkedin', 'github', 'portfolio', 'email'];
    for (const raw of lines.slice(0, 8)) {
      const line = raw.trim();
      const lower = line.toLowerCase();
      if (!line || line.length < 3 || line.length > 80) continue;
      if (email && line.includes(email)) continue;
      if (phone && line.includes(phone)) continue;
      if (badTokens.some((token) => lower.includes(token))) continue;
      if (/[{}<>]|@|https?:\/\//i.test(line)) continue;
      if (/\d{4}/.test(line)) continue;
      return line.replace(/[|•].*$/, '').trim();
    }
    return '';
  }

  function detectContact(text) {
    const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [''])[0];
    const phone = (text.match(/(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,5}\d{2,4}/) || [''])[0];
    const linkedin = (text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,;]+/i) || [''])[0];
    const github = (text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,;]+/i) || [''])[0];
    const urls = Array.from(text.matchAll(/(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/[^\s,;]*)?/gi)).map((m) => m[0]);
    const portfolio = urls.find((url) => !/linkedin\.com|github\.com|mailto:/i.test(url)) || '';
    return { email, phone, linkedin, github, portfolio };
  }

  function inferMissingSections(text, sections) {
    const lines = cleanText(text).split('\n').map((line) => line.trim()).filter(Boolean);
    if (!sections.skills) {
      const skillLine = lines.find((line) => /\b(Python|JavaScript|SQL|Excel|AWS|Azure|SIEM|Splunk|Elastic|Power BI|ISO 27001|Docker|Linux)\b/i.test(line));
      if (skillLine) sections.skills = skillLine;
    }
    if (!sections.experience) {
      sections.experience = lines
        .filter((line) => /\b(20\d{2}|19\d{2}|actualidad|present|intern|analyst|engineer|consultant|manager|trainee|becario|practicas|prácticas)\b/i.test(line))
        .slice(0, 10)
        .join('\n');
    }
    if (!sections.education) {
      sections.education = lines
        .filter((line) => /\b(university|universidad|grado|master|máster|degree|bootcamp|school|escuela|certificado superior|fp)\b/i.test(line))
        .slice(0, 8)
        .join('\n');
    }
    return sections;
  }

  function parseCVText(text) {
    const cleaned = cleanText(text);
    const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
    const contact = detectContact(cleaned);
    const sections = inferMissingSections(cleaned, splitSections(cleaned));

    return {
      name: pickName(lines, contact.email, contact.phone),
      email: contact.email,
      phone: contact.phone,
      linkedin: contact.linkedin,
      github: contact.github,
      portfolio: contact.portfolio,
      profile: sections.profile,
      skills: sections.skills,
      experience: sections.experience,
      education: sections.education,
      certifications: sections.certifications,
      projects: sections.projects,
      languages: sections.languages,
      awards: sections.awards,
      raw: cleaned
    };
  }

  window.CVOParser = {
    extractTextFromFile,
    parseCVText,
    cleanText,
    SECTION_ALIASES
  };
})(window);
