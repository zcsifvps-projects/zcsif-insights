import { jsPDF } from 'jspdf';
import { formatDate } from './utils';

const FOREST = [47, 111, 94];
const OCHRE = [201, 125, 59];
const INK = [27, 36, 32];

// Landscape A4 certificate of participation/completion.
export function generateCertificate({ participantName, trainingTitle, dateRange, facilitator }) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();

  // Border
  doc.setDrawColor(...FOREST);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, w - 16, h - 16);
  doc.setLineWidth(0.3);
  doc.rect(11, 11, w - 22, h - 22);

  doc.setTextColor(...FOREST);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('ZAMBIAN CYBERSECURITY INITIATIVE FOUNDATION', w / 2, 28, { align: 'center' });

  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(16);
  doc.text('Certificate of Participation', w / 2, 42, { align: 'center' });

  doc.setFontSize(11);
  doc.text('This certifies that', w / 2, 58, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...OCHRE);
  doc.text(participantName, w / 2, 72, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('has successfully participated in', w / 2, 84, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(trainingTitle, w / 2, 95, { align: 'center', maxWidth: w - 40 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(dateRange, w / 2, 105, { align: 'center' });

  // Signature line
  const sigY = h - 30;
  doc.setDrawColor(150, 150, 150);
  doc.line(w / 2 - 40, sigY, w / 2 + 40, sigY);
  doc.setFontSize(9);
  doc.text(facilitator || 'Facilitator', w / 2, sigY + 5, { align: 'center' });
  doc.text('Facilitator', w / 2, sigY + 10, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Issued ${formatDate(new Date().toISOString())}`, w - 15, h - 12, { align: 'right' });

  doc.save(`Certificate - ${participantName}.pdf`);
}

// Simple text-based dashboard/report export — stats + tables, no chart images.
export function generateDashboardReport({ dateRangeLabel, stats, activityRows, feedbackSummary }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const w = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setTextColor(...FOREST);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ZCSIF Engagement Report', 15, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.text(dateRangeLabel, 15, y);
  y += 10;

  doc.setDrawColor(...FOREST);
  doc.line(15, y, w - 15, y);
  y += 8;

  doc.setTextColor(...INK);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Summary', 15, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  stats.forEach(({ label, value }) => {
    doc.text(`${label}:`, 18, y);
    doc.text(String(value), 90, y);
    y += 6;
  });
  y += 4;

  if (activityRows?.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Activity', 15, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    activityRows.forEach((row) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(row, 18, y);
      y += 5.5;
    });
    y += 4;
  }

  if (feedbackSummary?.length) {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Feedback needing follow-up', 15, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    feedbackSummary.forEach((row) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      doc.text(row, 18, y, { maxWidth: w - 33 });
      y += 5.5;
    });
  }

  doc.save(`ZCSIF Report - ${new Date().toISOString().slice(0, 10)}.pdf`);
}
