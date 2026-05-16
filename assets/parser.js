(function (window) {
  'use strict';

  const SECTION_ALIASES = {
    profile: ['perfil profesional', 'resumen profesional', 'profile', 'professional profile', 'summary', 'resumen', 'about', 'objective', 'objetivo'],
    skills: ['competencias tecnicas', 'competencias técnicas', 'skills', 'technical skills', 'herramientas', 'technologies', 'tecnologias', 'tecnologías', 'aptitudes'],
    experience: ['experiencia laboral', 'experiencia profesional', 'professional experience', 'work experience', 'experience', 'employment'],
    education: ['educacion', 'educación', 'education', 'academic background', 'formacion', 'formación', 'studies', 'estudios'],
    certifications: ['certificaciones', 'certifications', 'certificados', 'certificates', 'licencias', 'licenses'],
    projects: ['proyectos', 'projects', 'portfolio', 'github projects', 'personal projects'],
    languages: ['idiomas', 'languages'],
    awards: ['premios', 'awards', 'honors', 'honours', 'reconocimientos']
  };

  const SECTION_PATTERNS = [
    { key: 'education_certifications', labels: ['educación y certificaciones', 'educacion y certificaciones', 'education and certifications'] },
    { key: 'projects_languages', labels: ['proyectos e idiomas', 'proyectos e idiomas', 'projects and languages'] },
    { key: 'profile', labels: SECTION_ALIASES.profile },
    { key: 'skills', labels: SECTION_ALIASES.skills },
    { key: 'experience', labels: SECTION_ALIASES.experience },
    { key: 'education', labels: ['educacion', 'educación', 'education', 'academic background', 'estudios academicos', 'estudios académicos'] },
    { key: 'certifications', labels: SECTION_ALIASES.certifications },
    { key: 'projects', labels: ['proyectos', 'projects', 'github projects', 'personal projects'] },
    { key: 'languages', labels: SECTION_ALIASES.languages },
    { key: 'awards', labels: SECTION_ALIASES.awards }
  ];

  function stripDiacritics(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizeHeading(value) {
    return stripDiacritics(value)
      .toLowerCase()
      .replace(/[:\-–—|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function repairPdfSpacing(text) {
    return String(text || '')
      .replace(/\r/g, '\n')
      .replace(/\u00a0/g, ' ')
      .replace(/[‐‑‒–—]/g, '-')
      .replace(/([A-Za-zÀ-ÿ0-9])\s*-\s*([A-Za-zÀ-ÿ0-9])/g, '$1-$2')
      .replace(/(\d{1,2}\/\d{4})-([A-Za-zÀ-ÿ0-9])/g, '$1 - $2')
      .replace(/(\d{4})-(Actualidad|Present|Current|\d{4})/gi, '$1 - $2')
      .replace(/(https?:\/\/)\s+/gi, '$1')
      .replace(/(www\.)\s+/gi, '$1')
      .replace(/\s+([.,;:!?])/g, '$1')
      .replace(/([([{])\s+/g, '$1')
      .replace(/\s+([)\]}])/g, '$1');
  }

  function cleanText(text) {
    return repairPdfSpacing(text)
      .replace(/[ \t]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
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

  function itemY(item) {
    return item.transform && typeof item.transform[5] === 'number' ? item.transform[5] : 0;
  }

  function itemX(item) {
    return item.transform && typeof item.transform[4] === 'number' ? item.transform[4] : 0;
  }

  function textContentToLines(content) {
    const items = (content.items || []).slice().sort((a, b) => {
      const yDiff = itemY(b) - itemY(a);
      if (Math.abs(yDiff) > 2) return yDiff;
      return itemX(a) - itemX(b);
    });
    const lines = [];
    let current = [];
    let lastY = null;
    items.forEach((item) => {
      const y = itemY(item);
      if (lastY !== null && Math.abs(y - lastY) > 3 && current.length) {
        lines.push(current.join(' '));
        current = [];
      }
      current.push(item.str);
      lastY = y;
    });
    if (current.length) lines.push(current.join(' '));
    return lines.join('\n');
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
      pages.push(textContentToLines(content));
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
    if (!normalized || normalized.length > 58) return null;
    for (const [key, aliases] of Object.entries(SECTION_ALIASES)) {
      if (aliases.some((alias) => normalized === normalizeHeading(alias))) return key;
    }
    return null;
  }

  function oldLineSplit(text) {
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
    return Object.fromEntries(Object.entries(sections).map(([key, lines]) => [key, cleanSectionContent(key, lines.join('\n'))]));
  }

  function findMarkers(text) {
    const markers = [];
    const occupied = [];
    const definitions = SECTION_PATTERNS
      .flatMap((def) => def.labels.map((label) => ({ key: def.key, label })))
      .sort((a, b) => b.label.length - a.label.length);

    definitions.forEach(({ key, label }) => {
      const pattern = new RegExp(`(^|[\\s\\n\\r\\.\\u2022●•\\|])(${escapeRegex(label)})(?:\\s*:)?(?!\\s+(?:a|de|del|of|and|e|y)\\b)(?=\\s*(?:$|[A-ZÁÉÍÓÚÜÑ0-9●•]))`, 'gi');
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const headingStart = match.index + match[1].length;
        const headingEnd = pattern.lastIndex;
        const overlaps = occupied.some((span) => headingStart < span.end && headingEnd > span.start);
        if (overlaps) continue;
        markers.push({ key, start: headingStart, end: headingEnd, label: match[2] });
        occupied.push({ start: headingStart, end: headingEnd });
      }
    });

    return markers
      .sort((a, b) => a.start - b.start)
      .filter((marker, index, list) => index === 0 || marker.start !== list[index - 1].start);
  }

  function splitEducationAndCertifications(content, sections) {
    if (!content) return;
    const certPattern = /\b(Microsoft|CompTIA|Cisco|AWS Certified|Azure|Google|Oracle|ISC2|ISACA|ITIL|ISO\s?\d{4,5}|SC\s?-\s?\d{3}|AZ\s?-\s?\d{3}|Security\+|Network\+|CEH|CISSP|CISM|CCNA|CCNP)\b/i;
    const match = content.match(certPattern);
    if (match && match.index > 20) {
      sections.education = cleanSectionContent('education', content.slice(0, match.index));
      sections.certifications = cleanSectionContent('certifications', content.slice(match.index));
    } else {
      sections.education = cleanSectionContent('education', content);
    }
  }

  function splitProjectsAndLanguages(content, sections) {
    if (!content) return;
    const languagePattern = /\b(Ingl[eé]s|English|Espa[nñ]ol|Spanish|Franc[eé]s|French|Alem[aá]n|German|Portugu[eé]s|Portuguese|Italiano|Italian)\b\s*[-–:]|\b(C2|C1|B2|B1|A2|A1|Nativo|Native|Fluent|Advanced)\b/i;
    const match = content.match(languagePattern);
    if (match && match.index > 20) {
      sections.projects = cleanSectionContent('projects', content.slice(0, match.index));
      sections.languages = cleanSectionContent('languages', content.slice(match.index));
    } else {
      sections.projects = cleanSectionContent('projects', content);
    }
  }

  function cleanSectionContent(key, value) {
    let text = cleanText(value)
      .replace(/^[:\-–—|\s]+/, '')
      .replace(/\s*[●•]\s*/g, '\n• ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (key === 'skills') {
      text = text
        .replace(/\s+(SIEM\/SOAR|HIDS\/DFIR|Detection\s*&\s*Tuning|Incident Response|EDR\/XDR|Cloud|Infraestructura|Infrastructure|Automatizaci[oó]n|Automation|Lenguajes|Languages|Tools|Herramientas)\s*:/gi, '\n$1:')
        .replace(/^\n+/, '');
    }

    if (key === 'education') {
      text = text
        .replace(/\s+(M[aá]ster|Master|Grado|Bachelor|Degree|BSc|MSc|Universidad|University|Escuela|School)\b/g, '\n$1')
        .replace(/^\n+/, '');
    }

    if (key === 'certifications') {
      text = text
        .replace(/\s+(Microsoft|CompTIA|Cisco|AWS Certified|Azure|Google|Oracle|ISC2|ISACA|ITIL|ISO\s?\d{4,5}|SC-\d{3}|AZ-\d{3}|Security\+|Network\+)\b/gi, '\n$1')
        .replace(/^\n+/, '');
    }

    text = text
      .replace(/Microsoft\n(SC-\d{3})/g, 'Microsoft $1')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !/^[-•●]+$/.test(line))
      .join('\n');

    return text.trim();
  }

  function splitSections(text) {
    const cleaned = cleanText(text);
    const base = {
      profile: '', skills: '', experience: '', education: '', certifications: '', projects: '', languages: '', awards: ''
    };
    const markers = findMarkers(cleaned);
    if (!markers.length) return oldLineSplit(cleaned);

    markers.forEach((marker, index) => {
      const next = markers[index + 1];
      const content = cleaned.slice(marker.end, next ? next.start : cleaned.length).trim();
      if (!content) return;
      if (marker.key === 'education_certifications') {
        splitEducationAndCertifications(content, base);
      } else if (marker.key === 'projects_languages') {
        splitProjectsAndLanguages(content, base);
      } else {
        base[marker.key] = cleanSectionContent(marker.key, content);
      }
    });

    if (base.education && !base.certifications) splitEducationAndCertifications(base.education, base);
    if (base.projects && !base.languages) splitProjectsAndLanguages(base.projects, base);

    return base;
  }

  function firstSectionIndex(text) {
    const markers = findMarkers(cleanText(text));
    return markers.length ? markers[0].start : -1;
  }

  function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function cleanUrl(url) {
    let value = cleanText(url)
      .replace(/\s+/g, '')
      .replace(/[).,;:]+$/g, '');
    if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
    return value;
  }

  function getHost(url) {
    try {
      return new URL(cleanUrl(url)).host.replace(/^www\./i, '').toLowerCase();
    } catch (error) {
      return '';
    }
  }

  function extractUrls(text, email) {
    const matches = Array.from(cleanText(text).matchAll(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+)(?:\/[^\s,;·<>()]*)?/gi))
      .map((match) => cleanUrl(match[0]));
    const emailDomain = email ? email.split('@')[1]?.toLowerCase() : '';
    return Array.from(new Set(matches)).filter((url) => {
      const host = getHost(url);
      if (!host) return false;
      if (emailDomain && host === emailDomain) return false;
      if (/^https?:\/\/[^/]+$/i.test(url) && email && email.toLowerCase().includes(host)) return false;
      return true;
    });
  }

  function githubProfileUrl(url) {
    try {
      const parsed = new URL(cleanUrl(url));
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (!parts.length) return parsed.origin;
      return `${parsed.origin}/${parts[0]}`;
    } catch (error) {
      return cleanUrl(url);
    }
  }

  function detectPhone(text, limitIndex) {
    const header = cleanText(text).slice(0, limitIndex > 0 ? Math.min(limitIndex, 900) : 900);
    const candidates = Array.from(header.matchAll(/(?:\+\s*)?(?:\(?\d{1,4}\)?[\s.-]*){2,6}\d{2,4}/g)).map((m) => m[0].trim());
    return candidates.find((candidate) => {
      const digits = digitsOnly(candidate);
      return digits.length >= 8 && digits.length <= 15 && !candidate.includes('/') && !/^20\d{2}/.test(digits);
    }) || '';
  }

  function detectContact(text) {
    const cleaned = cleanText(text);
    const email = (cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [''])[0];
    const sectionIdx = firstSectionIndex(cleaned);
    const phone = detectPhone(cleaned, sectionIdx);
    const header = sectionIdx > 0 ? cleaned.slice(0, sectionIdx) : cleaned.slice(0, 900);
    const allUrls = extractUrls(cleaned, email);
    const headerUrls = extractUrls(header, email);
    const linkedin = (headerUrls.find((url) => /linkedin\.com/i.test(url)) || allUrls.find((url) => /linkedin\.com/i.test(url)) || '').replace(/\/$/, '');
    const githubRaw = headerUrls.find((url) => /github\.com/i.test(url)) || allUrls.find((url) => /github\.com/i.test(url)) || '';
    const github = githubRaw ? githubProfileUrl(githubRaw).replace(/\/$/, '') : '';
    const portfolio = (headerUrls.find((url) => !/linkedin\.com|github\.com/i.test(url) && /github\.io|portfolio|vercel|netlify|dev|io\//i.test(url))
      || allUrls.find((url) => !/linkedin\.com|github\.com/i.test(url) && /github\.io|portfolio|vercel|netlify|dev|io\//i.test(url))
      || headerUrls.find((url) => !/linkedin\.com|github\.com/i.test(url))
      || '').replace(/\/$/, '');
    return { email, phone, linkedin, github, portfolio };
  }

  function pickName(lines, text, contact) {
    const cleaned = cleanText(text);
    const firstIdx = firstSectionIndex(cleaned);
    const header = firstIdx > 0 ? cleaned.slice(0, firstIdx) : cleaned.slice(0, 600);
    const beforeEmail = contact.email && header.includes(contact.email) ? header.slice(0, header.indexOf(contact.email)) : header;
    const directCandidate = beforeEmail
      .split(/[\n|·]/)[0]
      .replace(/curriculum vitae|resume|cv/ig, '')
      .replace(/[•●]/g, '')
      .trim();
    if (/^[A-Za-zÀ-ÿ'\-\s]{4,80}$/.test(directCandidate) && directCandidate.split(/\s+/).length >= 2) {
      return directCandidate.replace(/\s+/g, ' ');
    }

    const badTokens = ['cv', 'curriculum', 'resume', 'linkedin', 'github', 'portfolio', 'email'];
    for (const raw of lines.slice(0, 10)) {
      let line = raw.trim();
      if (contact.email && line.includes(contact.email)) line = line.slice(0, line.indexOf(contact.email)).trim();
      const lower = line.toLowerCase();
      if (!line || line.length < 3 || line.length > 80) continue;
      if (contact.phone && line.includes(contact.phone)) continue;
      if (badTokens.some((token) => lower.includes(token))) continue;
      if (/[{}<>]|@|https?:\/\//i.test(line)) continue;
      if (/\d{4}/.test(line)) continue;
      if (!/[A-Za-zÀ-ÿ]/.test(line)) continue;
      return line.replace(/[|•].*$/, '').replace(/\s+/g, ' ').trim();
    }
    return '';
  }

  function inferMissingSections(text, sections) {
    const lines = cleanText(text).split('\n').map((line) => line.trim()).filter(Boolean);
    if (!sections.skills) {
      const skillLine = lines.find((line) => /\b(Python|JavaScript|SQL|Excel|AWS|Azure|SIEM|Splunk|Elastic|Power BI|ISO 27001|Docker|Linux|SAP|AutoCAD|SolidWorks)\b/i.test(line));
      if (skillLine) sections.skills = cleanSectionContent('skills', skillLine);
    }
    if (!sections.experience) {
      sections.experience = cleanSectionContent('experience', lines
        .filter((line) => /\b(20\d{2}|19\d{2}|actualidad|present|intern|analyst|engineer|consultant|manager|trainee|becario|practicas|prácticas)\b/i.test(line))
        .slice(0, 10)
        .join('\n'));
    }
    if (!sections.education) {
      sections.education = cleanSectionContent('education', lines
        .filter((line) => /\b(university|universidad|grado|master|máster|degree|bootcamp|school|escuela|certificado superior|fp)\b/i.test(line))
        .slice(0, 8)
        .join('\n'));
    }
    return sections;
  }

  function parseCVText(text) {
    const cleaned = cleanText(text);
    const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
    const contact = detectContact(cleaned);
    const sections = inferMissingSections(cleaned, splitSections(cleaned));

    return {
      name: pickName(lines, cleaned, contact),
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
