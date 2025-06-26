import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportShiftMonthlyReportPDF = (data) => {
    const doc = new jsPDF();
  
    // Header
    doc.setFont('bold');
    doc.text(`${data.monthName} Shift Report`, centerX, 10);
    doc.setFont('normal');
    doc.text(`Shift: ${data.shiftName}`, 14, 16);
    doc.text(`Type: ${data.shiftType}`, 14, 22);
    doc.text(`Schedule: ${data.scheduleDescription}`, 14, 28);
  
    // Summary Table
    doc.autoTable({
      head: [["Metric", "Value"]],
      body: data.summaryMetrics, // as array of [label, value]
      startY: 32
    });
  
    // Employee Assignment Table
    // doc.autoTable({
    //   head: [["Employee", "Days Scheduled", "Days Attended", "Days Absent", "Holidays", "Total Hours", "Late (h)", "Early Leave (h)"]],
    //   body: data.employees.map(e => [...]),
    //   startY: doc.lastAutoTable.finalY + 8,
    // });
  

  
    doc.save(`${data.monthName}_Shift_Report_${data.shiftName}.pdf`);
  }
  
  export default exportShiftMonthlyReportPDF;