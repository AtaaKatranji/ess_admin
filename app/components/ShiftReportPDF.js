import jsPDF from "jspdf";
import "jspdf-autotable";

// Helper for status color
const statusColors = {
  Good: "#4ade80",
  Fair: "#fde047",
  Poor: "#f87171",
};

const exportShiftMonthlyReportPDF = (data) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header: Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const title = `${data.monthName} ${data.year} Shift Report`;
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 14);

  // Sub-header info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Shift: ${data.shiftName}`, 14, 22);
  doc.text(`Type: ${data.shiftType}`, 14, 28);
  doc.text(data.scheduleDescription, 14, 34);

  // Summary "cards" (table style)
  doc.autoTable({
    startY: 38,
    head: [["Total Days Scheduled", "Total Employees Assigned", "Total Hours Scheduled", "Total Hours Worked"]],
    body: [[
      data.totalDaysScheduled,
      data.totalEmployeesAssigned,
      data.totalHoursScheduled,
      data.totalHoursWorked || "N/A"
    ]],
    styles: { halign: "center" },
    headStyles: { fillColor: [243, 244, 246], textColor: 60 },
    bodyStyles: { fillColor: [255, 255, 255] }
  });

  // Below summary
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 6,
    head: [["Holiday Names", "Avg. Daily Attendance", "Avg. Attendance Rate"]],
    body: [[
      data.holidays || "-",
      data.avgDailyAttendance,
      data.avgAttendanceRate + "%"
    ]],
    styles: { halign: "center" },
    headStyles: { fillColor: [243, 244, 246], textColor: 60 }
  });

  // Employee Table
  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 12,
    head: [[
      "Employee", "Attendance Rate", "Days Attended", "Days Absent",
      "Total Hours", "Late Hours", "Early Leave", "Overtime", "Status"
    ]],
    body: data.employees.map(e => [
      e.name,
      e.attendanceRate + "%",
      e.daysAttended,
      e.daysAbsent,
      e.totalHours !== undefined ? e.totalHours : "N/A",
      e.lateHours,
      e.earlyLeave,
      e.overtime,
      e.status
    ]),
    styles: { fontSize: 9 },
    didParseCell: function (data) {
      // Color the Status cell background based on value
      if (data.column.index === 8 && data.cell.raw) {
        data.cell.styles.fillColor = statusColors[data.cell.raw] || [255,255,255];
        data.cell.styles.textColor = 60;
        data.cell.styles.fontStyle = "bold";
      }
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.text(
    `Report generated on ${data.generatedDate} - ${data.monthName} ${data.year} Shift Report`,
    14,
    doc.internal.pageSize.getHeight() - 10
  );

  doc.save(`${data.monthName}_${data.year}_Shift_Report.pdf`);
};

export default exportShiftMonthlyReportPDF;
