import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportShiftMonthlyReportPDF = (data) => {
    const doc = new jsPDF();

    // Header
    const title = `${data.monthName} Shift Report`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const textWidth = doc.getTextWidth(title);
    const centerX = (pageWidth - textWidth) / 2;

    doc.setFont('bold');
    doc.text(title, centerX, 10);
    doc.setFont('normal');
    doc.text(`Shift: ${data.shiftName}`, 14, 16);
    doc.text(`Type: ${data.shiftType}`, 14, 22);
    doc.text(`Schedule: ${data.scheduleDescription}`, 14, 28);

    // Prepare summary metrics for table
    const summaryMetricsTable = data.summaryMetrics.map(({ label, value }) => [label, value]);

    // Summary Table
    doc.autoTable({
      head: [["Metric", "Value"]],
      body: summaryMetricsTable, // must be array of [label, value]
      startY: 32
    });

    // Employee Assignment Table
    doc.autoTable({
      head: [["Employee", "Days Scheduled", "Days Attended", "Days Absent", "Holidays", "Total Hours"]],
      body: data.employees.map(e => [
        e.name,
        e.daysScheduled,
        e.daysAttended,
        e.daysAbsent,
        e.holidays,
        e.totalHours === "NaN" ? "-" : Number(e.totalHours).toFixed(2)
      ]),
      startY: doc.lastAutoTable.finalY + 8,
    });

    doc.save(`${data.monthName}_Shift_Report_${data.shiftName}.pdf`);
}

export default exportShiftMonthlyReportPDF;
