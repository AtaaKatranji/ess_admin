// components/ExportPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';

const exportMonthlyReportPDF = (data) => {
  if (typeof window === 'undefined') return; // Check if window is available for Next.js

  const doc = new jsPDF();
  doc.text(`${data.summary.monthName} Attendance Report`, 14, 10);
  doc.text(`Employee: ${data.summary.employeeName}`,14, 16);

  // Adding summary section
  const summaryData = [
    ["Total Hours", data.summary.totalHours],
    ["Late Hours", data.summary.lateHours],
    ["Early Leave Hours", data.summary.earlyLeaveHours],
    ["Early Arrival Hours", data.summary.earlyArrivalHours],
    ["Extra Attendance Hours", data.summary.extraAttendanceHours],
    ["Total Days Attendanced", data.summary.totalDays],
    ["Paid Leaves", data.summary.totalPaidLeaveDays],
    ["Unpaid Leaves", data.summary.totalUnpaidLeaveDays],
  ];

  doc.autoTable({
    head: [["Metric", "Value"]],
    body: summaryData,
    startY: 20,
  });

  // Adding details section for each day
  const checkInOutData = data.details.map(entry => {
    const date = new Date(entry.date);
    const year = date.getFullYear();
    const month = String(date.getMonth() ).padStart(2, '0'); // Ensure month is two-digit
    const day = String(date.getDate()).padStart(2, '0'); // Ensure day is two-digit

    // Format options
    const shortOptions = { weekday: 'short' };
    const longOptions = { weekday: 'long' };
    
    // Determine how to format the date
    let formattedDate;
    if (entry.type !== "Attendance") {
      const longDayName = new Intl.DateTimeFormat('en-US', longOptions).format(date);
      formattedDate = `${year}-${month}-${day}: ${longDayName}    ${entry.type}`;
    } else {
      const shortDayName = new Intl.DateTimeFormat('en-US', shortOptions).format(date);
      formattedDate = `${year}-${month}-${day}: ${shortDayName}`;
    }

    // Return the row based on the type
    if (entry.type !== "Attendance") {
      return [formattedDate, "-", "-", "-"]; // Display type with no check-in/out details
    } else {
      return [
        formattedDate,
        entry.checkIn || "-", // Display "-" if no check-in
        entry.checkOut || "-", // Display "-" if no check-out
        entry.dailyHours || "-" // Display "-" if no daily hours
      ];
    }
  });

  doc.autoTable({
    head: [["Date", "Check-In", "Check-Out", "Daily Hours"]],
    body: checkInOutData,
    startY: doc.lastAutoTable.finalY + 10, // Start after the summary table
  });

  doc.save(`${data.summary.monthName}_Attendance_Report_${data.summary.employeeName}.pdf`);
  toast.info("Monthly report exported as PDF!");
};

export default exportMonthlyReportPDF;
