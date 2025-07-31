import jsPDF from 'jspdf';
import 'jspdf-autotable';


// Helper function
function formatShiftTimes(shiftTimes) {
    const timeGroups = {};
    Object.entries(shiftTimes).forEach(([day, {start, end}]) => {
        const timeKey = `${start}-${end}`;
        if (!timeGroups[timeKey]) timeGroups[timeKey] = [];
        timeGroups[timeKey].push(day);
    });
    return Object.entries(timeGroups)
        .map(([time, days]) =>
            `${days.join(', ')}: ${time.replace('-', '–').replace(/:00/g, '')}`
        ).join('\n');
}

const exportShiftMonthlyReportPDF = (data) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    doc.setFontSize(11);
    doc.setFont('cairo');

    const logoImg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYcAAAFvCAYAAAChCQeRAAAABGdBTUEAALGPC/xhBQAACklpQ0NQc1...";

    try {
      doc.addImage(logoImg, 'PNG', margin, 8, 20, 20);
    } catch (e) {
      console.warn("Failed to add logo:", e);
    }
 // Unified font
    // Header
    const title = `${data.monthName} Shift Report`;
    const textWidth = doc.getTextWidth(title);
    const centerX = (pageWidth - textWidth) / 2;

    doc.setFont('bold');
    doc.setFontSize(14);
    doc.text(title, centerX, 20);
    doc.setFontSize(11);
    doc.setFont('normal');
    doc.text(`Shift: ${data.shiftName}`, margin, 32);
    doc.text(`Type: ${data.shiftType}`, margin, 38);
    doc.text("Schedule:", margin, 44);

    // Display nicely formatted shift times
    doc.setFontSize(9); // Smaller font for schedule details
    doc.text(formatShiftTimes(data.shiftTimes), margin + 12, 49); // Indented and on next line(s)
    doc.setFontSize(10); // Reset

    // Prepare summary metrics for table
    const summaryMetricsTable = data.summaryMetrics.map(({ label, value }) => [label, value]);

    // Summary Table
    doc.autoTable({
      head: [["Metric", "Value"]],
      body: summaryMetricsTable, // must be array of [label, value]
      startY: 55,
      margin: { left: margin, right: margin },
      styles: { font: 'cairo', fontSize: 10 },
    });
    // Prepare employee table
    const includeHolidayColumn = data.employees.some(e => e.holidays > 0);
    const employeeTableHead = ['Employee', 'Days Attended', 'Days Absent'];
    if (includeHolidayColumn) employeeTableHead.push('Holidays');
    employeeTableHead.push('Total Hours', 'Signature');

    const employeeTableBody = data.employees.map(e => {
      const row = [
        e.name,
        e.daysAttended,
        e.daysAbsent,
      ];
      if (includeHolidayColumn) row.push(e.holidays);
      row.push(e.totalHours === 'NaN' ? '-' : Number(e.totalHours).toFixed(2));
      row.push(''); // Empty signature field
      return row;
    });
    // Employee Assignment Table
    doc.autoTable({
      head: [employeeTableHead],
      body: employeeTableBody,
      startY: doc.lastAutoTable.finalY + 8,
      margin: { left: margin, right: margin },
      styles: { font: 'cairo', fontSize: 9 },
      didDrawPage: () => {
        // === PAGE FOOTER ===
        const adminName = 'Admin Signature';
        const date = new Date().toLocaleDateString();
  
        doc.setFontSize(8);
        doc.text(`Generated on: ${date}`, margin, doc.internal.pageSize.height - 15);
        doc.text(`By: ${adminName}`, pageWidth - margin - 40, doc.internal.pageSize.height - 15);
  
        // === PAGE NUMBER ===
        const pageNumber = doc.internal.getNumberOfPages();
        doc.text(`Page ${pageNumber}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
  
        // === WATERMARK (optional light text) ===
        const gState = doc.GState({ opacity: 0.2 });
        doc.setGState(gState);
        doc.setFontSize(30);
        doc.setTextColor(200);
        doc.text('CONFIDENTIAL', pageWidth / 2, 150, { align: 'center', angle: 45 });
        doc.setGState(new doc.GState({ opacity: 1 }));
        doc.setTextColor(0); // reset color
      },
    });
  
    // === NOTES SECTION ===
    const notesY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.text("Notes:", margin, notesY);
    doc.line(margin, notesY + 2, pageWidth - margin, notesY + 2); // single line
    doc.line(margin, notesY + 10, pageWidth - margin, notesY + 10); // another line
    doc.line(margin, notesY + 18, pageWidth - margin, notesY + 18); // another line
  
    doc.save(`${data.monthName}_Shift_Report_${data.shiftName}.pdf`);
  };
  
  export default exportShiftMonthlyReportPDF;
