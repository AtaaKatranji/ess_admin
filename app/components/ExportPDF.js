// components/ExportPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportMonthlyReportPDF = (data) => {
  if (typeof window === 'undefined') return;
  const doc = new jsPDF();

  const monthNameText = data.summary.monthName;
  const reportText = " Attendance Report";
  const fullLine = monthNameText + reportText;
  const fullLineWidth = doc.getTextWidth(fullLine);
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = (pageWidth - fullLineWidth) / 2;

  // === Header ===
  doc.setFont(undefined, 'bold');
  doc.setFontSize(11);
  doc.text(monthNameText, centerX, 10);

  const monthNameWidth = doc.getTextWidth(monthNameText);
  doc.setFont(undefined, 'normal');
  doc.text(reportText, centerX + monthNameWidth, 10);

  // === Employee name ===
  const employeeLabel = "Employee: ";
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(employeeLabel, 14, 16);

  const employeeLabelWidth = doc.getTextWidth(employeeLabel);
  doc.setFont(undefined, 'bold');
  doc.text(data.summary.employeeName, 15 + employeeLabelWidth, 16);

  // === حساب الساعات الكلية مع الإجازات والعطل ===
  let totalHoursAttendance = Number(data.summary.totalHours) || 0;

  // أضف الساعات الإضافية
  if (Number(data.summary.extraAdjusmentHours) > 0) {
    totalHoursAttendance += Number(data.summary.extraAdjusmentHours);
  }

  // أضف ساعات العطل الرسمية
  const totalHolidayHours = Number(data.summary.totalHolidayHours) || 0;
  totalHoursAttendance += totalHolidayHours;

  // أضف ساعات الإجازات المدفوعة (نفترض أن كل يوم = 8 ساعات)
  const paidLeaveDays = Number(data.summary.totalLeaves) || 0;
  const paidLeaveHours = paidLeaveDays * 8;
  totalHoursAttendance += paidLeaveHours;

  // === بيانات الملخص ===
  const summaryData = [
    ["Total Hours Attendance", (Number(data.summary.totalHours) || 0).toFixed(2)],
    ["Late Hours", data.summary.lateHours],
    ["Early Leave Hours", data.summary.earlyLeaveHours],
    ["Early Arrival Hours", data.summary.earlyArrivalHours],
    ["Extra Attendance Hours", data.summary.extraAttendanceHours],
    ["Total Days Attendanced", data.summary.totalDays],
    ["Total Days Absents", data.summary.totalAbsents],
    ["Total Days Holidays", data.summary.totalHolidays],
    ["Total Hours Holidays", `+${totalHolidayHours}`],
    ["Paid Leaves", paidLeaveDays],
    ["Unpaid Leaves", 0],
    ["Extra Added Hours", data.summary.extraAdjusmentHours],
  ];

  // === إنشاء الجدول ===
  doc.autoTable({
    head: [["Metric", "Value"]],
    body: summaryData,
    startY: 20,
  });

  // === إضافة الصف النهائي "Grand Total" بخط غامق ولون رمادي فاتح ===
  doc.autoTable({
    body: [
      [
        { content: "Grand Total Hours (Including Paid Leaves & Holidays)", styles: { fontStyle: 'bold', textColor: [0, 0, 0], fillColor: [230, 230, 230] } },
        { content: `${totalHoursAttendance.toFixed(2)}`, styles: { fontStyle: 'bold', textColor: [0, 0, 0], fillColor: [230, 230, 230] } }
      ]
    ],
    startY: doc.lastAutoTable.finalY,
    theme: 'plain',
  });

  // === تفاصيل الأيام ===
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
        if (rowType === "Offical Holiday") data.cell.styles.fillColor = [220, 235, 255]; // Light blue
        if (rowType === "Weekend") data.cell.styles.fillColor = [255, 255, 237]; // Light gray
        if (rowType === "Leave") data.cell.styles.fillColor = [255, 240, 220]; // Light orange
        if (rowType === "Absent") data.cell.styles.fillColor = [255, 225, 225]; // Light red
      }
    }
  });

  // === حفظ الملف ===
  doc.save(`${data.summary.monthName}_Attendance_Report_${data.summary.employeeName}.pdf`);
};

export default exportMonthlyReportPDF;
