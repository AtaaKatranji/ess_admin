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

    // Display nicely formatted shift times
    const shiftTimesStr = formatShiftTimes(data.shiftTimes);
    doc.text("Schedule:", 14, 28);
    doc.setFontSize(9); // Smaller font for schedule details
    doc.text(shiftTimesStr, 26, 33); // Indented and on next line(s)
    doc.setFontSize(10); // Reset

    // Prepare summary metrics for table
    const summaryMetricsTable = data.summaryMetrics.map(({ label, value }) => [label, value]);

    // Summary Table
    doc.autoTable({
      head: [["Metric", "Value"]],
      body: summaryMetricsTable, // must be array of [label, value]
      startY: 38
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
