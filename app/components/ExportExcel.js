// components/ExportExcel.js
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const exportMonthlyReportExcel = async (data) => {
  if (typeof window === 'undefined') return; // Ensure this only runs in the browser

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Monthly Attendance Report');

  data.forEach((item) => {
    worksheet.addRow([`Month: ${item.month}`]).font = { bold: true };
    worksheet.addRow(["Metric", "Value"]).font = { bold: true };

    worksheet.addRow(["Total Hours", item.totalHours]);
    worksheet.addRow(["Early Arrivals", item.earlyArrivals]);
    worksheet.addRow(["Late Hours", item.lateHours]);
    worksheet.addRow(["Early Leaves", item.earlyLeaves]);
    worksheet.addRow(["Extra Hours", item.extraHours]);
    worksheet.addRow([]);

    worksheet.addRow(["Date", "Check-In", "Check-Out"]).font = { bold: true };
    item.checkInOutHistory.forEach((entry) => {
      worksheet.addRow([entry.date, entry.checkIn, entry.checkOut]);
    });

    worksheet.addRow([]);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, 'Monthly_Attendance_Report.xlsx');
  toast.info("Monthly report exported as Excel!");
};

export default exportMonthlyReportExcel;
