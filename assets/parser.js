(function (window) {
  'use strict';

  const SECTION_ALIASES = {
    profile: ['perfil profesional', 'resumen profesional', 'resumen', 'sobre mí', 'sobre mi', 'professional summary', 'summary', 'profile', 'about me'],
    experience: ['experiencia profesional', 'experiencia laboral', 'experiencia', 'work experience', 'professional experience', 'employment history', 'experience'],
    education: ['educación y certificaciones', 'educacion y certificaciones', 'educación', 'educacion', 'formación académica', 'formacion academica', 'education and certifications', 'education', 'academic background', 'studies'],
    skills: ['competencias técnicas', 'competencias', 'habilidades', 'skills', 'technical skills', 'core skills', 'herramientas', 'tools'],
    certifications: ['certificaciones', 'certificación', 'certification', 'certifications', 'certificates', 'licencias', 'licenses'],
    projects: ['proyectos e idiomas', 'proyectos e idiomas', 'projects and languages', 'proyectos', 'projects', 'portfolio', 'github projects', 'personal projects'],
    languages: ['idiomas', 'languages'],
    awards: ['premios', 'reconocimientos', 'awards', 'honors', 'honours', 'achievements'],
    other: ['otros', 'other', 'additional information']
  };

  const FIELD_KEYS = ['name', 'email', 'phone', 'linkedin', 'github', 'portfolio', 'profile', 'experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'awards', 'other'];

  const SECTION_KEYS = ['profile', 'experience', 'education', 'skills', 'certifications', 'projects', 'languages', 'awards', 'other'];

  function stripDiacritics(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function normalizeForCompare(value) {
    return stripDiacritics(value).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function unique(items) {
    return Array.from(new Set((items || []).filter(Boolean)));
  }

  function repairUrlLikeSegments(text) {
    return String(text || '').replace(/((?:https?:\/\/|www\.|linkedin\.com|github\.com|gitlab\.com|bitbucket\.org|[a-z0-9-]+\.github\.io)[^\n\s]*(?:\s*-\s*[^\n\s]+)+[^\n\s]*)/gi, (match) => match.replace(/\s*-\s*/g, '-').replace(/\s+/g, ''));
  }

  function normalizeText(text) {
    return String(text || '')
      .replace(/\r/g, '\n')
      .replace(/\u00a0/g, ' ')
      .replace(/[‐‑‒–—]/g, '-')
      .replace(/[●▪◆◦]/g, '•')
      .replace(/^\s*[\-*]\s+/gm, '• ')
      .replace(/([A-Z0-9._%+-]+)\s*@\s*([A-Z0-9.-]+)\s*\.\s*([A-Z]{2,})/gi, '$1@$2.$3')
      .replace(/(https?:\/\/)\s+/gi, '$1')
      .replace(/(www\.)\s+/gi, '$1')
      .replace(/\bSI\s+EM\b/gi, 'SIEM')
      .replace(/\bSO\s+AR\b/gi, 'SOAR')
      .replace(/\bEDR\s*\/\s*XDR\b/gi, 'EDR/XDR')
      .replace(/\bT\s+uning\b/gi, 'Tuning')
      .replace(/\bPower\s+BI\b/gi, 'Power BI')
      .replace(/\bGit\s+Hub\b/gi, 'GitHub');
  }

  function cleanText(text) {
    return repairUrlLikeSegments(normalizeText(text))
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

  function getItemBox(item) {
    const transform = item.transform || [];
    const x = Number(transform[4] || 0);
    const y = Number(transform[5] || 0);
    const height = Math.abs(Number(transform[3] || item.height || 10)) || 10;
    const width = Number(item.width || 0);
    return { str: String(item.str || ''), x, y, height, width, right: x + width };
  }

  function textContentToLines(content) {
    const items = (content.items || [])
      .map(getItemBox)
      .filter((item) => item.str.trim())
      .sort((a, b) => Math.abs(b.y - a.y) > 2.5 ? b.y - a.y : a.x - b.x);

    const groups = [];
    items.forEach((item) => {
      let group = groups.find((candidate) => Math.abs(candidate.y - item.y) <= Math.max(2.6, item.height * 0.38));
      if (!group) {
        group = { y: item.y, height: item.height, items: [] };
        groups.push(group);
      }
      group.items.push(item);
      group.y = (group.y * (group.items.length - 1) + item.y) / group.items.length;
      group.height = Math.max(group.height, item.height);
    });

    groups.sort((a, b) => b.y - a.y);
    const lines = [];
    let previousY = null;
    groups.forEach((group) => {
      group.items.sort((a, b) => a.x - b.x);
      let line = '';
      let prev = null;
      group.items.forEach((item) => {
        const text = item.str.trim();
        if (!text) return;
        if (!prev) {
          line += text;
        } else {
          const gap = item.x - prev.right;
          const needsSpace = gap > Math.max(1.4, group.height * 0.18) && !/^\s*[.,;:!?)]/.test(text) && !/[(/-]$/.test(line);
          line += needsSpace ? ` ${text}` : text;
        }
        prev = item;
      });
      if (line.trim()) {
        if (previousY !== null && previousY - group.y > Math.max(17, group.height * 1.6)) lines.push('');
        lines.push(line.trim());
        previousY = group.y;
      }
    });
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
    return cleanText(pages.join('\n\n'));
  }

  async function extractDocxText(file) {
    if (!window.mammoth) throw new Error('mammoth.js is not loaded');
    const buffer = await readArrayBuffer(file);
    const result = await window.mammoth.extractRawText({ arrayBuffer: buffer });
    return cleanText(result.value || '');
  }

  async function extractTextFromFile(file) {
    if (!file) return '';
    const name = file.name.toLowerCase();
    if (name.endsWith('.pdf') || file.type === 'application/pdf') return extractPdfText(file);
    if (name.endsWith('.docx') || /wordprocessingml/.test(file.type)) return extractDocxText(file);
    return cleanText(await readTextFile(file));
  }

  function buildHeadingDefinitions() {
    return Object.entries(SECTION_ALIASES)
      .flatMap(([key, aliases]) => aliases.map((label) => ({ key, label })))
      .sort((a, b) => b.label.length - a.label.length);
  }

  function findSectionMarkers(text) {
    const cleaned = cleanText(text);
    const markers = [];
    const occupied = [];
    buildHeadingDefinitions().forEach(({ key, label }) => {
      const pattern = new RegExp(`\\b${escapeRegex(label)}\\b\\s*:?`, 'gi');
      let match;
      while ((match = pattern.exec(cleaned)) !== null) {
        const start = match.index;
        const end = pattern.lastIndex;
        const before = cleaned.slice(Math.max(0, start - 80), start);
        const after = cleaned.slice(end, Math.min(cleaned.length, end + 80));
        const hardBoundary = start < 5 || /[\n•|·.]\s*$/.test(before) || /\s{2,}$/.test(before);
        const sameLineHeading = /^\s*[A-ZÁÉÍÓÚÜÑ0-9•]/.test(after);
        const hasSectionContext = hardBoundary || sameLineHeading;
        const notSentence = !/\b(en|de|del|para|con|with|in|of|and|y)\s+$/.test(before.toLowerCase());
        const overlaps = occupied.some((span) => start < span.end && end > span.start);
        if (hasSectionContext && notSentence && !overlaps) {
          markers.push({ key, start, end, label: match[0].trim() });
          occupied.push({ start, end });
        }
      }
    });
    return markers.sort((a, b) => a.start - b.start).filter((marker, index, list) => index === 0 || marker.start !== list[index - 1].start);
  }

  function trimSectionValue(value) {
    return cleanText(value)
      .replace(/^[:|\-\s]+/, '')
      .replace(/\s*•\s*/g, '\n• ')
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !/^[-•]+$/.test(line))
      .join('\n')
      .trim();
  }

  function splitSections(text) {
    const cleaned = cleanText(text);
    const sections = Object.fromEntries(SECTION_KEYS.map((key) => [key, '']));
    const confidence = Object.fromEntries(SECTION_KEYS.map((key) => [key, 'missing']));
    const markers = findSectionMarkers(cleaned);

    if (!markers.length) return { sections, confidence, markers };

    markers.forEach((marker, index) => {
      const next = markers[index + 1];
      const raw = cleaned.slice(marker.end, next ? next.start : cleaned.length);
      const value = trimSectionValue(raw);
      if (!value) return;
      if (value.length > Math.max(3000, cleaned.length * 0.7)) {
        confidence[marker.key] = 'low';
        return;
      }
      sections[marker.key] = value;
      confidence[marker.key] = 'high';
    });

    return { sections, confidence, markers };
  }

  function extractContact(text) {
    const cleaned = cleanText(text);
    const firstSection = findSectionMarkers(cleaned)[0];
    const header = firstSection ? cleaned.slice(0, firstSection.start) : cleaned.slice(0, 900);
    const email = (cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [''])[0];
    const phoneCandidate = (header.match(/(?:\+\s*)?(?:\(?\d{1,4}\)?[\s.-]*){2,6}\d{2,4}/g) || [])
      .map((item) => item.trim())
      .find((item) => {
        const digits = item.replace(/\D/g, '');
        return digits.length >= 8 && digits.length <= 15 && !/^20\d{2}/.test(digits);
      }) || '';
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com|github\.com|gitlab\.com|bitbucket\.org|[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)+)(?:\/[^\s,;·<>()]*)?/gi;
    const headerUrls = unique(Array.from(header.matchAll(urlRegex)).map((match) => cleanUrl(match[0])));
    const allUrls = unique(Array.from(cleaned.matchAll(urlRegex)).map((match) => cleanUrl(match[0])));
    const urls = headerUrls.length ? headerUrls : allUrls;
    const linkedin = urls.find((url) => /linkedin\.com/i.test(url)) || allUrls.find((url) => /linkedin\.com/i.test(url)) || '';
    const github = headerUrls.find((url) => /github\.com/i.test(url)) || '';
    const portfolio = urls.find((url) => !/linkedin\.com|github\.com/i.test(url) && /github\.io|portfolio|vercel|netlify|\.dev|\.io/i.test(url)) || '';
    return { email, phone: phoneCandidate, linkedin, github, portfolio };
  }

  function cleanUrl(url) {
    let value = String(url || '').replace(/\s+/g, '').replace(/[).,;:]+$/g, '');
    value = repairUrlLikeSegments(value);
    if (!/^https?:\/\//i.test(value)) value = `https://${value}`;
    return value;
  }

  function detectName(text, contact) {
    const cleaned = cleanText(text);
    const firstSection = findSectionMarkers(cleaned)[0];
    let header = firstSection ? cleaned.slice(0, firstSection.start) : cleaned.slice(0, 600);
    Object.values(contact).filter(Boolean).forEach((value) => { header = header.replace(value, ' '); });
    header = header.replace(/https?:\/\/\S+|www\.\S+|linkedin\.com\/\S+|github\.com\/\S+/gi, ' ');
    const candidates = header.split(/[\n|·•]/).map((line) => line.trim()).filter(Boolean);
    for (const candidate of candidates.slice(0, 8)) {
      const clean = candidate
        .replace(/\b(curriculum vitae|resume|cv|email|tel[eé]fono|phone|linkedin|github|portfolio)\b/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
      if (/^[A-Za-zÀ-ÿ'\-\s]{4,80}$/.test(clean) && clean.split(/\s+/).length >= 2) return clean;
    }
    return '';
  }


  function postProcessCombinedSections(sections, confidence) {
    if (sections.education && !sections.certifications) {
      const lines = sections.education.split('\n').map((line) => line.trim()).filter(Boolean);
      const certLines = [];
      const eduLines = [];
      lines.forEach((line) => {
        if (/\b(Microsoft|AWS|Azure|Google|Cisco|CompTIA|ITIL|Scrum|Salesforce|Oracle|ISO\s?27001|SC-\d+|AZ-\d+|CCNA|CISSP|CEH|Security\+|Certified|Certification|Fundamentals)\b/i.test(line)) certLines.push(line);
        else eduLines.push(line);
      });
      if (certLines.length) {
        sections.education = trimSectionValue(eduLines.join('\n'));
        sections.certifications = trimSectionValue(certLines.join('\n'));
        confidence.certifications = 'medium';
      }
    }

    const languagePattern = /\b(ingl[eé]s|english|espa[ñn]ol|spanish|franc[eé]s|french|alem[aá]n|german|italiano|italian|portugu[eé]s|portuguese|nativo|native|b1|b2|c1|c2|a1|a2|avanzado|intermedio|fluido)\b/i;
    if (sections.projects) {
      const lines = sections.projects.split('\n').map((line) => line.trim()).filter(Boolean);
      const langLines = lines.filter((line) => languagePattern.test(line));
      const projectLines = lines.filter((line) => !languagePattern.test(line));
      if (langLines.length && !sections.languages) {
        sections.projects = trimSectionValue(projectLines.join('\n'));
        sections.languages = trimSectionValue(langLines.join('\n'));
        confidence.languages = 'medium';
      }
    }

    if (sections.languages) {
      const lines = sections.languages.split('\n').map((line) => line.trim()).filter(Boolean);
      const langLines = [];
      const projectLines = [];
      lines.forEach((line) => {
        if (languagePattern.test(line) && !/github\.com|proyecto|project|plataforma|django|react|worker|virustotal|hids|dfir|mitre|repositorio/i.test(line)) langLines.push(line);
        else if (/github\.com|proyecto|project|plataforma|django|react|worker|virustotal|hids|dfir|mitre|repositorio|portfolio/i.test(line)) projectLines.push(line);
        else langLines.push(line);
      });
      if (projectLines.length && (!sections.projects || sections.projects.length < 12)) {
        sections.projects = trimSectionValue([sections.projects, projectLines.join('\n')].filter(Boolean).join('\n'));
        confidence.projects = 'medium';
        sections.languages = trimSectionValue(langLines.join('\n'));
        confidence.languages = sections.languages ? 'medium' : 'missing';
      }
    }
  }

  function inferLimitedSections(cleaned, sections, confidence) {
    const lines = cleaned.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!sections.skills) {
      const skillLines = lines.filter((line) => /\b(Python|JavaScript|SQL|Excel|Power BI|Tableau|AWS|Azure|Linux|Docker|SIEM|Splunk|AutoCAD|SolidWorks|Canva|SEO|Jira)\b/i.test(line)).slice(0, 3);
      if (skillLines.length) {
        sections.skills = trimSectionValue(skillLines.join('\n'));
        confidence.skills = 'medium';
      }
    }
    if (!sections.education) {
      const educationLines = lines.filter((line) => /\b(universidad|university|grado|bachelor|master|máster|degree|fp|school|escuela)\b/i.test(line)).slice(0, 4);
      if (educationLines.length) {
        sections.education = trimSectionValue(educationLines.join('\n'));
        confidence.education = 'medium';
      }
    }
    if (!sections.experience) {
      const experienceLines = lines.filter((line) => /\b(intern|trainee|analyst|engineer|manager|consultant|assistant|becario|prácticas|practicas|20\d{2}\s*-\s*(actualidad|present|20\d{2}))\b/i.test(line)).slice(0, 6);
      if (experienceLines.length) {
        sections.experience = trimSectionValue(experienceLines.join('\n'));
        confidence.experience = 'low';
      }
    }
  }

  function parseJsonCv(text) {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object') return null;
      const cv = {};
      FIELD_KEYS.forEach((key) => { cv[key] = typeof parsed[key] === 'string' ? parsed[key] : ''; });
      cv.raw = text;
      cv.confidence = Object.fromEntries(FIELD_KEYS.map((key) => [key, cv[key] ? 'high' : 'missing']));
      return cv;
    } catch (error) {
      return null;
    }
  }

  function parseCVText(text) {
    const jsonCv = parseJsonCv(text);
    if (jsonCv) return jsonCv;

    const cleaned = cleanText(text);
    const contact = extractContact(cleaned);
    const { sections, confidence } = splitSections(cleaned);
    postProcessCombinedSections(sections, confidence);
    inferLimitedSections(cleaned, sections, confidence);
    postProcessCombinedSections(sections, confidence);

    const cv = {
      name: detectName(cleaned, contact),
      email: contact.email,
      phone: contact.phone,
      linkedin: contact.linkedin,
      github: contact.github,
      portfolio: contact.portfolio,
      profile: sections.profile,
      experience: sections.experience,
      education: sections.education,
      skills: sections.skills,
      certifications: sections.certifications,
      projects: sections.projects,
      languages: sections.languages,
      awards: sections.awards,
      other: sections.other,
      raw: cleaned,
      confidence: {}
    };

    FIELD_KEYS.forEach((key) => {
      if (SECTION_KEYS.includes(key)) cv.confidence[key] = confidence[key] || (cv[key] ? 'medium' : 'missing');
      else cv.confidence[key] = cv[key] ? (key === 'name' ? 'medium' : 'high') : 'missing';
    });
    return cv;
  }

  window.CVOParser = {
    SECTION_ALIASES,
    FIELD_KEYS,
    SECTION_KEYS,
    extractTextFromFile,
    parseCVText,
    cleanText,
    textContentToLines
  };
})(window);
