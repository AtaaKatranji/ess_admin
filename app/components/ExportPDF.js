// components/ExportPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const exportMonthlyReportPDF = (data) => {
  if (typeof window === 'undefined') return;
  const doc = new jsPDF();
  doc.text(`${data.summary.monthName} Attendance Report`, 14, 10);
  doc.text(`Employee: ${data.summary.employeeName}`, 14, 16);
  let totalHours = Number(data.summary.totalHours) || 0;
  if (Number(data.summary.extraAdjusmentHours) > 0) {
      totalHours += Number(data.summary.extraAdjusmentHours) || 0;
  }
  const summaryData = [
      ["Total Hours", totalHours],
      ["Late Hours", data.summary.lateHours],
      ["Early Leave Hours", data.summary.earlyLeaveHours],
      ["Early Arrival Hours", data.summary.earlyArrivalHours],
      ["Extra Attendance Hours", data.summary.extraAttendanceHours],
      ["Total Days Attendanced", data.summary.totalDays],
      ["Total Days Holidays", data.summary.totalHolidays],
      ["Paid Leaves", data.summary.totalLeaves || 0], // Fix mismatch
      ["Unpaid Leaves", 0], // Fix mismatch
      ["Extra Added Hours", data.summary.extraAdjusmentHours],
  ];
  doc.autoTable({
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: 20,
  });
  doc.autoTable({
    head: [["Date", "Day", "Type", "Check-In", "Check-Out", "Daily Hours", "Holiday Name"]],
    body: data.details.map(entry => {
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) return ["Invalid Date", "-", "-", "-", "-", "-", "-"];
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const dayNum = String(date.getUTCDate()).padStart(2, '0');
      const shortDay = entry.dayOfWeek || new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
      return [
        `${year}-${month}-${dayNum}`,
        shortDay,
        entry.type || "-",
        entry.checkIn || "-",
        entry.checkOut || "-",
        entry.dailyHours || "-",
        entry.holidayName || ""
      ];
    }),
    startY: doc.lastAutoTable.finalY + 10,
    didParseCell: function (data) {
      if (data.section === 'body') {
        const rowType = data.row.raw[2];
        if (rowType === "Public Holiday") data.cell.styles.fillColor = [220, 235, 255]; // Light blue
        if (rowType === "Weekend") data.cell.styles.fillColor = [245, 245, 245]; // Light gray
        if (rowType === "Leave") data.cell.styles.fillColor = [255, 240, 220]; // Light orange
        if (rowType === "Absent") data.cell.styles.fillColor = [255, 225, 225]; // Light red
      }
    }
  });
  doc.save(`${data.summary.monthName}_Attendance_Report_${data.summary.employeeName}.pdf`);
};

export default exportMonthlyReportPDF;
