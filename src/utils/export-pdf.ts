import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PdfTableOptions {
  title: string;
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}

export function exportToPdf({ title, filename, headers, rows }: PdfTableOptions) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated ${new Date().toLocaleString('en-IN')}`, 14, 26);

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 32,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(filename);
}
