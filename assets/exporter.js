(function (window) {
  'use strict';

  function safeFilename(name) {
    return String(name || 'optimized-cv')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'optimized-cv';
  }

  function colorFor(formatId) {
    const map = {
      'ats-simple': [17, 24, 39],
      'uk-ireland': [31, 64, 104],
      'technical-projects': [15, 76, 117],
      hybrid: [10, 102, 194],
      'visual-creative': [10, 102, 194],
      europass: [0, 51, 153],
      executive: [30, 41, 59],
      academic: [45, 55, 72],
      functional: [19, 138, 100],
      'reverse-chronological': [17, 24, 39]
    };
    return map[formatId] || map['ats-simple'];
  }

  function addWrapped(doc, text, x, y, maxWidth, opts) {
    const options = opts || {};
    doc.setFont('helvetica', options.bold ? 'bold' : (options.italic ? 'italic' : 'normal'));
    doc.setFontSize(options.fontSize || 9.5);
    const lineHeight = options.lineHeight || 13;
    const lines = doc.splitTextToSize(String(text || ''), maxWidth);
    lines.forEach((line) => {
      if (y > options.pageHeight - options.margin) {
        doc.addPage();
        y = options.margin;
      }
      doc.text(line, x, y);
      y += lineHeight;
    });
    return y;
  }

  function addImageIfAllowed(doc, cv, options, x, y, size) {
    if (!window.CVOFormatter.canShowPhoto(cv, options.formatId)) return false;
    try {
      doc.addImage(cv.photo.dataUrl, 'JPEG', x, y, size, size, undefined, 'FAST');
      return true;
    } catch (error) {
      try {
        doc.addImage(cv.photo.dataUrl, 'PNG', x, y, size, size, undefined, 'FAST');
        return true;
      } catch (inner) {
        console.warn('Photo could not be embedded in PDF.', inner);
        return false;
      }
    }
  }

  function exportPDF(cvOrText, optionsOrName, maybeName) {
    if (!window.jspdf?.jsPDF) throw new Error('jsPDF is not loaded');
    const isStructured = typeof cvOrText === 'object' && cvOrText !== null;
    const cv = isStructured ? cvOrText : { name: optionsOrName || 'optimized-cv', other: String(cvOrText || '') };
    const options = isStructured ? (optionsOrName || {}) : { formatId: 'ats-simple', lang: 'es' };
    const name = maybeName || cv.name || optionsOrName || 'optimized-cv';
    const formatId = options.formatId || 'ats-simple';
    const accent = colorFor(formatId);

    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4', compress: true });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 46;
    const contentWidth = pageWidth - margin * 2;
    const lines = window.CVOFormatter.exportLines(cv, options);
    let y = margin;

    if (formatId === 'visual-creative' || formatId === 'executive') {
      doc.setFillColor(...accent);
      doc.rect(0, 0, pageWidth, 112, 'F');
      doc.setTextColor(255, 255, 255);
      addImageIfAllowed(doc, cv, options, margin, 28, 58);
      const headerX = window.CVOFormatter.canShowPhoto(cv, formatId) ? margin + 76 : margin;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(cv.name || 'Nombre', headerX, 52);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      const contact = (lines.slice(1).filter(Boolean).join(' · '));
      doc.text(doc.splitTextToSize(contact, pageWidth - headerX - margin), headerX, 72);
      y = 142;
      doc.setTextColor(17, 24, 39);
    } else {
      const photoPlaced = addImageIfAllowed(doc, cv, options, pageWidth - margin - 64, margin, 64);
      const headerWidth = photoPlaced ? contentWidth - 84 : contentWidth;
      doc.setTextColor(17, 24, 39);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(formatId === 'ats-simple' ? 17 : 19);
      doc.text(cv.name || 'Nombre', margin, y);
      y += 16;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.8);
      const contact = (lines.slice(1).filter(Boolean).join(' · '));
      if (contact) y = addWrapped(doc, contact, margin, y, headerWidth, { fontSize: 8.8, lineHeight: 11, pageHeight, margin });
      y += 12;
    }

    const headings = new Set(Object.values(window.CVOFormatter.SECTION_TITLES.es).concat(Object.values(window.CVOFormatter.SECTION_TITLES.en)));
    lines.slice(1).forEach((line) => {
      if (!line || /^.+@.+\..+$/.test(line) || /^\+?\(?\d/.test(line) || /linkedin|github|https?:/i.test(line)) return;
      const isHeading = headings.has(line);
      const isBullet = /^•\s/.test(line);
      if (isHeading) {
        y += 8;
        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.setDrawColor(...accent);
        doc.setLineWidth(1.1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 13;
        doc.setTextColor(...accent);
        y = addWrapped(doc, line.toUpperCase(), margin, y, contentWidth, { bold: true, fontSize: 10, lineHeight: 13, pageHeight, margin });
        doc.setTextColor(17, 24, 39);
        return;
      }
      const clean = line.replace(/^•\s*/, '');
      const x = isBullet ? margin + 14 : margin;
      const prefix = isBullet ? '• ' : '';
      y = addWrapped(doc, prefix + clean, x, y, contentWidth - (isBullet ? 14 : 0), { fontSize: isBullet ? 9.2 : 9.4, lineHeight: 12.6, pageHeight, margin });
      y += isBullet ? 1 : 3;
    });

    doc.save(`${safeFilename(name)}.pdf`);
  }

  async function dataUrlToImageRun(dataUrl, width, height) {
    if (!window.docx || !dataUrl) return null;
    const { ImageRun } = window.docx;
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    return new ImageRun({ data: buffer, transformation: { width, height } });
  }

  async function exportDOCX(cvOrText, optionsOrName, maybeName) {
    const isStructured = typeof cvOrText === 'object' && cvOrText !== null;
    const cv = isStructured ? cvOrText : { name: optionsOrName || 'optimized-cv', other: String(cvOrText || '') };
    const options = isStructured ? (optionsOrName || {}) : { formatId: 'ats-simple', lang: 'es' };
    const name = maybeName || cv.name || optionsOrName || 'optimized-cv';

    if (!window.docx) {
      const text = window.CVOFormatter.exportLines(cv, options).join('\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      window.saveAs(blob, `${safeFilename(name)}.txt`);
      return;
    }

    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = window.docx;
    const lines = window.CVOFormatter.exportLines(cv, options);
    const headings = new Set(Object.values(window.CVOFormatter.SECTION_TITLES.es).concat(Object.values(window.CVOFormatter.SECTION_TITLES.en)));
    const children = [];

    const headerChildren = [];
    const photoRun = window.CVOFormatter.canShowPhoto(cv, options.formatId) ? await dataUrlToImageRun(cv.photo.dataUrl, 78, 78) : null;
    if (photoRun) headerChildren.push(photoRun);
    headerChildren.push(new TextRun({ text: cv.name || 'Nombre', bold: true, size: 34 }));
    children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: headerChildren }));

    const contact = lines.slice(1).filter((line) => /^.+@.+\..+$/.test(line) || /^\+?\(?\d/.test(line) || /linkedin|github|https?:/i.test(line)).join(' · ');
    if (contact) children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 180 }, children: [new TextRun({ text: contact, size: 18, color: '4B5563' })] }));

    lines.slice(1).forEach((line) => {
      if (!line || /^.+@.+\..+$/.test(line) || /^\+?\(?\d/.test(line) || /linkedin|github|https?:/i.test(line)) return;
      const isHeading = headings.has(line);
      const isBullet = /^•\s/.test(line);
      if (isHeading) {
        children.push(new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          border: { bottom: { color: 'D1D5DB', space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: [new TextRun({ text: line.toUpperCase(), bold: true, size: 22 })]
        }));
        return;
      }
      children.push(new Paragraph({
        bullet: isBullet ? { level: 0 } : undefined,
        spacing: { after: 80 },
        children: [new TextRun({ text: line.replace(/^•\s*/, ''), size: 20 })]
      }));
    });

    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }] });
    const blob = await Packer.toBlob(doc);
    window.saveAs(blob, `${safeFilename(name)}.docx`);
  }

  window.CVOExporter = { exportPDF, exportDOCX, safeFilename };
})(window);
