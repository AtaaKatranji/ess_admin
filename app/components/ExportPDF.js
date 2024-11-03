// components/ExportPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-toastify';

const exportMonthlyReportPDF = (data) => {
  if (typeof window === 'undefined') return; // Check if window is available for Next.js

  const doc = new jsPDF();
  doc.text("Monthly Attendance Report", 14, 10);

  // Adding summary section
  const summaryData = [
    ["Total Hours", data.summary.totalHours],
    ["Late Hours", data.summary.lateHours],
    ["Early Leave Hours", data.summary.earlyLeaveHours],
    ["Early Arrival Hours", data.summary.earlyArrivalHours],
    ["Extra Attendance Hours", data.summary.extraAttendanceHours],
    ["Total Days", data.summary.totalDays],
  ];

  doc.autoTable({
    head: [["Metric", "Value"]],
    body: summaryData,
    startY: 20,
  });

  // Adding details section for each day
  const checkInOutData = data.details.map(entry => [
    entry.date.slice(0, 10), // Extracting date in YYYY-MM-DD format
    entry.checkIn,
    entry.checkOut,
    entry.dailyHours
  ]);

  doc.autoTable({
    head: [["Date", "Check-In", "Check-Out", "Daily Hours"]],
    body: checkInOutData,
    startY: doc.lastAutoTable.finalY + 10, // Start after the summary table
  });

  doc.save("Monthly_Attendance_Report.pdf");
  toast.info("Monthly report exported as PDF!");
};

export default exportMonthlyReportPDF;
