// components/ExportPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const exportMonthlyReportPDF = (data) => {
  if (typeof window === 'undefined') return;
  console.log("Full data in export:", JSON.stringify(data, null, 2));
  console.log("Details length in export:", data.details.length);
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
      ["Paid Leaves", data.summary.totalLeaves || 0], // Fix mismatch
      ["Unpaid Leaves", 0], // Fix mismatch
      ["Extra Added Hours", data.summary.extraAdjusmentHours],
  ];
  doc.autoTable({
      head: [["Metric", "Value"]],
      body: summaryData,
      startY: 20,
  });
  const checkInOutData = data.details.map(entry => {
      console.log("Processing entry:", entry);
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
          console.error("Invalid date:", entry.date);
          return ["Invalid Date", "-", "-", "-"];
      }
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const shortOptions = { weekday: 'short' };
      const longOptions = { weekday: 'long' };
      let formattedDate;
      if (entry.type !== "Attendance") {
          const longDayName = new Intl.DateTimeFormat('en-US', longOptions).format(date);
          formattedDate = `${year}-${month}-${day}: ${longDayName}    ${entry.type}`;
      } else {
          const shortDayName = new Intl.DateTimeFormat('en-US', shortOptions).format(date);
          formattedDate = `${year}-${month}-${day}: ${shortDayName}`;
      }
      console.log("Formatted row:", [formattedDate, entry.checkIn || "-", entry.checkOut || "-", entry.dailyHours || "-"]);
      if (entry.type !== "Attendance") {
          return [formattedDate, "-", "-", "-"];
      } else {
          return [
              formattedDate,
              entry.checkIn || "-",
              entry.checkOut || "-",
              entry.dailyHours || "-"
          ];
      }
  });
  console.log("checkInOutData:", JSON.stringify(checkInOutData, null, 2));
  doc.autoTable({
      head: [["Date", "Check-In", "Check-Out", "Daily Hours"]],
      body: checkInOutData,
      startY: doc.lastAutoTable.finalY + 10,
  });
  doc.save(`${data.summary.monthName}_Attendance_Report_${data.summary.employeeName}.pdf`);
};

export default exportMonthlyReportPDF;
