import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper to create the head & body for the schedule table
function getScheduleTable(shiftTimes) {
    // Extract the days in order (Monday-Sunday)
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const days = daysOrder.filter(day => shiftTimes[day]);
    
    // Head row: Days of week (each spans 2 columns)
    const head = [
        days.map(day => ({ content: day, colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' }}))
    ];
    // Second row: "Start" and "End" for each day
    head.push(
        days.flatMap([
            { content: "Start", styles: { halign: 'center', fontStyle: 'italic' } },
            { content: "End", styles: { halign: 'center', fontStyle: 'italic' } }
        ])
    );
    // Body: Just one row, the times
    const body = [
        days.flatMap(day => [
            shiftTimes[day]?.start?.slice(0,5) || "-",
            shiftTimes[day]?.end?.slice(0,5) || "-"
        ])
    ];
    return { head, body };
}

// --- Your PDF export function
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

    // Add the schedule as a table
    const { head, body } = getScheduleTable(data.shiftTimes);
    doc.autoTable({
        head,
        body,
        startY: 28,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, valign: 'middle', halign: 'center' },
        headStyles: { fillColor: [243, 244, 246], textColor: 60 }
    });

    // The rest of your PDF code below...
    // (Summary, employee table, etc.)
    // For example:
    const summaryMetricsTable = data.summaryMetrics.map(({ label, value }) => [label, value]);
    doc.autoTable({
      head: [["Metric", "Value"]],
      body: summaryMetricsTable,
      startY: doc.lastAutoTable.finalY + 8
    });

    // ...continue as before

    doc.save(`${data.monthName}_Shift_Report_${data.shiftName}.pdf`);
};

export default exportShiftMonthlyReportPDF;
