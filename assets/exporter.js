(function (window) {
  'use strict';

  function safeFilename(name, extension) {
    const base = String(name || 'optimized-cv')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'optimized-cv';
    return `${base}.${extension}`;
  }

  function downloadTextFile(text, filename, mime) {
    const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    if (window.saveAs) window.saveAs(blob, filename);
    else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    }
  }

  function exportPDF(text, filenameBase) {
    if (!window.jspdf?.jsPDF) {
      downloadTextFile(text, safeFilename(filenameBase, 'txt'), 'text/plain;charset=utf-8');
      throw new Error('jsPDF is not available. Exported TXT fallback.');
    }
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 44;
    const maxWidth = 507;
    const pageHeight = doc.internal.pageSize.getHeight();
    const lines = doc.splitTextToSize(text || '', maxWidth);
    let y = margin;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    lines.forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 14;
    });
    doc.save(safeFilename(filenameBase, 'pdf'));
  }

  async function exportDOCX(text, filenameBase) {
    if (!window.docx) {
      downloadTextFile(text, safeFilename(filenameBase, 'docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      throw new Error('docx.js is not available. Exported plain fallback.');
    }
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;
    const paragraphs = [];
    String(text || '').split('\n').forEach((rawLine, index) => {
      const line = rawLine.trim();
      if (!line) {
        paragraphs.push(new Paragraph({ text: '' }));
        return;
      }
      const isFirst = index === 0;
      const isHeading = !isFirst && line.length < 46 && /^[A-ZÁÉÍÓÚÜÑa-záéíóúüñ /&-]+$/.test(line) && !/[.!?]$/.test(line);
      if (isFirst) {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: line, bold: true, size: 32 })],
          spacing: { after: 120 }
        }));
      } else if (isHeading) {
        paragraphs.push(new Paragraph({
          text: line.toUpperCase(),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 180, after: 80 }
        }));
      } else {
        paragraphs.push(new Paragraph({
          children: [new TextRun({ text: line.replace(/^[•\-–*]\s*/, ''), size: 21 })],
          bullet: /^[•\-–*]\s*/.test(rawLine) ? { level: 0 } : undefined,
          spacing: { after: 60 }
        }));
      }
    });

    const doc = new Document({
      creator: 'CV/LinkedIn Cybersecurity Optimizer',
      description: 'ATS-friendly generated CV',
      title: filenameBase || 'Optimized CV',
      sections: [{ properties: {}, children: paragraphs }]
    });
    const blob = await Packer.toBlob(doc);
    if (window.saveAs) window.saveAs(blob, safeFilename(filenameBase, 'docx'));
    else downloadTextFile(await blob.text(), safeFilename(filenameBase, 'docx'), blob.type);
  }

  window.CVOExporter = { exportPDF, exportDOCX, safeFilename };
})(window);
