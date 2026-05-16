(function (window) {
  'use strict';


  const HEADING_TITLES = new Set([
    'perfil profesional', 'competencias', 'experiencia profesional', 'proyectos', 'educación', 'educacion', 'certificaciones', 'idiomas', 'premios y reconocimientos', 'otros',
    'professional summary', 'skills', 'work experience', 'projects', 'education', 'certifications', 'languages', 'awards', 'additional information'
  ]);

  function isHeadingLine(line) {
    return HEADING_TITLES.has(String(line || '').toLowerCase().trim());
  }

  function safeFilename(name) {
    return String(name || 'optimized-cv')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'optimized-cv';
  }

  function splitLines(text) {
    return String(text || '').replace(/\r/g, '\n').split('\n').map((line) => line.trim()).filter(Boolean);
  }

  function exportPDF(text, name) {
    if (!window.jspdf?.jsPDF) throw new Error('jsPDF is not loaded');
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;
    const lines = splitLines(text);

    lines.forEach((line, index) => {
      const isName = index === 0;
      const isHeading = !isName && isHeadingLine(line);
      const isBullet = /^[•\-*]/.test(line);
      const fontSize = isName ? 18 : isHeading ? 10.5 : 9.5;
      const lineHeight = isName ? 24 : isHeading ? 18 : 14;
      const left = isBullet ? margin + 12 : margin;
      doc.setFont('helvetica', isName || isHeading ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      if (isHeading) {
        y += 8;
        doc.setDrawColor(210, 218, 230);
        doc.line(margin, y + 4, pageWidth - margin, y + 4);
        y += 13;
      }
      const wrapped = doc.splitTextToSize(line.replace(/^[•\-*]\s*/, isBullet ? '• ' : ''), pageWidth - margin * 2 - (isBullet ? 12 : 0));
      wrapped.forEach((wrappedLine) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(wrappedLine, left, y);
        y += lineHeight;
      });
      if (isName) y += 2;
    });

    doc.save(`${safeFilename(name)}.pdf`);
  }

  async function exportDOCX(text, name) {
    if (!window.docx) {
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      window.saveAs(blob, `${safeFilename(name)}.txt`);
      return;
    }
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = window.docx;
    const lines = splitLines(text);
    const children = lines.map((line, index) => {
      const isName = index === 0;
      const isHeading = !isName && isHeadingLine(line);
      const isBullet = /^[•\-*]/.test(line);
      if (isName) {
        return new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [new TextRun({ text: line, bold: true, size: 34 })]
        });
      }
      if (isHeading) {
        return new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 },
          children: [new TextRun({ text: line.toUpperCase(), bold: true })]
        });
      }
      return new Paragraph({
        bullet: isBullet ? { level: 0 } : undefined,
        spacing: { after: 80 },
        children: [new TextRun({ text: line.replace(/^[•\-*]\s*/, ''), size: 21 })]
      });
    });
    const doc = new Document({ sections: [{ properties: {}, children }] });
    const blob = await Packer.toBlob(doc);
    window.saveAs(blob, `${safeFilename(name)}.docx`);
  }

  window.CVOExporter = { exportPDF, exportDOCX, safeFilename };
})(window);
