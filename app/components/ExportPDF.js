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
    ["Total Days Attendanced", data.summary.totalDays],
    ["Paid Leaves", data.summary.paidLeaves],
    ["Unpaid Leaves", data.summary.unpaidLeaves],
  ];

  doc.autoTable({
    head: [["Metric", "Value"]],
    body: summaryData,
    startY: 20,
  });

  // Adding details section for each day
  const checkInOutData = data.details.map(entry => {
    // Create a new Date object from the entry date
    const date = new Date(entry.date);
    
    // Extract the year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1); // Months are zero-based
    const day = String(date.getDate()); // Get the day of the month
    
    // Get the abbreviated day name (e.g., Mon, Tue)
    const options = { weekday: 'short' };
    const dayName = new Intl.DateTimeFormat('en-US', options).format(date);
    
    // Format the date as "YYYY-MM-D: Day"
    const formattedDate = `${year}-${month}-${day}: ${dayName}`;
    
    return [
        formattedDate,   // Use the formatted date
        entry.checkIn,
        entry.checkOut,
        entry.dailyHours
    ];
});
  doc.autoTable({
    head: [["Date", "Check-In", "Check-Out", "Daily Hours"]],
    body: checkInOutData,
    startY: doc.lastAutoTable.finalY + 10, // Start after the summary table
  });

  doc.save("Monthly_Attendance_Report.pdf");
  toast.info("Monthly report exported as PDF!");
};

export default exportMonthlyReportPDF;
