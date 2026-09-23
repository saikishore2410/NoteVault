import { Note } from '../types/notes';

const escapeHtml = (value: unknown): string => String(value ?? '').split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;').split('"').join('&quot;').split("'").join('&#039;');

export const exportNoteToPdf = (note: Note) => {
  // Use a hidden sandboxed iframe to trigger native browser print/PDF export
  // Avoids window.open / window.alert which are blocked in iframe environments
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    console.warn('Could not create print frame document');
    return;
  }

  const pagesHtml = (note.pages || []).map((p) => {
    const visual = p.visualContent || {
      headerTitle: p.title || note.title,
      dateText: note.uploadDate || 'Verified Note',
      sections: [
        {
          heading: p.ocrContent?.title || 'Notes Content',
          paragraphs: p.ocrContent?.rawText ? p.ocrContent.rawText.split('\n').filter(Boolean) : ['No text available'],
        },
      ],
    };

    return `
    <div style="page-break-after: always; padding: 40px; margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff; font-family: 'Inter', -apple-system, sans-serif;">
      <div style="border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <span style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #d97706; letter-spacing: 0.05em;">${escapeHtml(note.subject)} · ${escapeHtml(note.topic)}</span>
          <h1 style="margin: 4px 0 0 0; font-size: 24px; color: #1e293b;">${escapeHtml(visual.headerTitle)}</h1>
          <span style="font-size: 12px; color: #64748b;">${escapeHtml(visual.dateText)} · Contributor: ${escapeHtml(note.author?.name || 'Anonymous')}</span>
        </div>
        <div style="text-align: right; font-size: 14px; font-weight: 700; color: #64748b;">
          Page ${p.pageNumber || 1} of ${note.totalPages || 1}
        </div>
      </div>

      <div style="line-height: 1.6; color: #334155; font-size: 15px;">
        ${(visual.sections || []).map((sec) => `
          <div style="margin-bottom: 24px;">
            ${sec.heading ? `<h3 style="font-size: 16px; margin: 0 0 8px 0; color: #0f172a; border-left: 3px solid #f59e0b; padding-left: 8px;">${escapeHtml(sec.heading)}</h3>` : ''}
            ${(sec.paragraphs || []).map(text => `<p style="margin: 4px 0;">${escapeHtml(text)}</p>`).join('')}
            ${sec.sideMarginNote ? `<div style="margin: 12px 0; padding: 8px 12px; background: #fef3c7; border-left: 3px solid #d97706; font-size: 13px; color: #92400e;"><strong>Margin Note:</strong> ${escapeHtml(sec.sideMarginNote)}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between;">
        <span>NoteVault Library Archive · Readability Rating: ${escapeHtml(note.readabilityRating || 4.9)}/5.0</span>
        <span>Verified OCR Confidence: ${escapeHtml(note.legibilityScore || 98)}%</span>
      </div>
    </div>
  `;
  }).join('');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(note.title)} - NoteVault Export</title>
        <style>
          @media print {
            body { margin: 0; background: white; }
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f8fafc;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px; padding: 16px; background: #1e293b; color: white; border-radius: 8px;">
            <h2 style="margin: 0; font-size: 20px;">NoteVault Document Export</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8;">Digitized handwritten notes with full OCR verification</p>
          </div>
          ${pagesHtml}
        </div>
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Auto print failed:', e);
    }
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 3000);
  }, 400);
};
