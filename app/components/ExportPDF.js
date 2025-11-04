// components/ExportPDF.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const exportMonthlyReportPDF = (data) => {
  if (typeof window === 'undefined') return;
  const doc = new jsPDF();

  const { summary } = data;
  const monthNameText = summary.monthName;
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
  doc.text(summary.employeeName, 15 + employeeLabelWidth, 16);

  // === بيانات الملخص (بدون أي حساب يدوي) ===
  // === بيانات الملخص (بدون حسابات يدوية) ===
          const summaryData = [
            ["Total Hours", summary.totalHours],
            ["Late Hours", summary.lateHours],
            ["Early Leave Hours", summary.earlyLeaveHours],
            ["Early Arrival Hours", summary.earlyArrivalHours],
            ["Extra Attendance Hours", summary.extraAttendanceHours],
            ["Total Days Attendanced", summary.totalDays],
            ["Total Days Absents", summary.totalAbsents],
            ["Total Days Holidays", summary.totalHolidays],
            ["Total Hours Holidays", `+${summary.totalHolidayHours}`],
            ["Paid Leaves", summary.totalLeaves],
            ["Paid Leave Hours", `+${summary.totalPaidLeaveHours}`],
          ];

          // ✅ أضف صف “Extra Adjustment Hours” فقط إذا كانت > 0
          if (Number(summary.extraAdjustmentHours) > 0) {
            summaryData.push([
              { content: "Bonus Hours (Manager Reward)", styles: { fontStyle: 'italic', textColor: [120, 85, 0] } },
              { content: `+${summary.extraAdjustmentHours}`, styles: { fontStyle: 'bold', textColor: [120, 85, 0] } }
            ]);
          }

  // === إنشاء جدول الملخص ===
  doc.autoTable({
    head: [["Metric", "Value"]],
    body: summaryData,
    startY: 20,
  });

  // === إضافة صف "Grand Total Hours (Including Paid Leaves & Holidays)" ===
  doc.autoTable({
    body: [
      [
        { 
          content: "Grand Total Hours (Including Paid Leaves & Holidays)", 
          styles: { fontStyle: 'bold', textColor: [0, 0, 0], fillColor: [230, 230, 230] } 
        },
        { 
          content: `${summary.totalHoursAttendance.toFixed(2)}`, 
          styles: { fontStyle: 'bold', textColor: [0, 0, 0], fillColor: [230, 230, 230] } 
        }
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
        if (rowType === "Weekend") data.cell.styles.fillColor = [255, 255, 237]; // Light yellowish
        if (rowType === "Paid Leave") data.cell.styles.fillColor = [255, 240, 220]; // Light orange
        if (rowType === "Unpaid Leave") data.cell.styles.fillColor = [255, 220, 220]; // Light red-pink
        if (rowType === "Absent") data.cell.styles.fillColor = [255, 200, 200]; // Slightly darker red

      }
    }
  });

  // === حفظ الملف ===
  const fileName = `${summary.monthName}_Attendance_Report_${summary.employeeName.trim()}.pdf`;
  doc.save(fileName);
};

export default exportMonthlyReportPDF;
