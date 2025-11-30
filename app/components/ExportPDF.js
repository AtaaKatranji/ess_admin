// components/ExportPDF.js

const getRowBackground = (type) => {
  switch (type) {
    case "Offical Holiday":
      return "#DCEBFF"; // أزرق فاتح
    case "Weekend":
      return "#FFFFED"; // أصفر فاتح
    case "Paid Leave":
      return "#FFF0DC"; // برتقالي فاتح
    case "Unpaid Leave":
      return "#FFDCDC"; // أحمر فاتح
    case "Absent":
      return "#FFC8C8"; // أحمر أغمق
    default:
      return undefined;
  }
};

const exportMonthlyReportPDF = async (data) => {
  if (typeof window === "undefined") return;

  // import ديناميكي عشان ما يخرب الـ SSR
  const pdfMakeModule = await import("@digicole/pdfmake-rtl/build/pdfmake");
  const pdfFontsModule = await import("@digicole/pdfmake-rtl/build/vfs_fonts");

  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const pdfFonts = pdfFontsModule.default || pdfFontsModule;

  // ربط الـ vfs حتى يلاقي Roboto-Medium.ttf و غيرها
  if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  const { summary, details } = data;

  // === جدول الملخص ===
  const summaryRows = [
    { label: "Total Hours", value: summary.totalHours },
    { label: "Late Hours", value: summary.lateHours },
    { label: "Early Leave Hours", value: summary.earlyLeaveHours },
    { label: "Early Arrival Hours", value: summary.earlyArrivalHours },
    { label: "Extra Attendance Hours", value: summary.extraAttendanceHours },
    { label: "Total Days Attendanced", value: summary.totalDays },
    { label: "Total Days Absents", value: summary.totalAbsents },
    { label: "Total Days Holidays", value: summary.totalHolidays },
    { label: "Total Hours Holidays", value: `+${summary.totalHolidayHours}` },
    { label: "Paid Leaves", value: summary.totalLeaves },
    { label: "Paid Leave Hours", value: `+${summary.totalPaidLeaveHours}` },
  ];

  if (Number(summary.extraAdjustmentHours) > 0) {
    summaryRows.push({
      label: "Bonus Hours (Manager Reward)",
      value: `+${summary.extraAdjustmentHours}`,
      isBonus: true,
    });
  }

  const summaryTableBody = [
    [
      { text: "Metric", bold: true },
      { text: "Value", bold: true },
    ],
    ...summaryRows.map((row) => [
      {
        text: row.label,
        italics: !!row.isBonus,
        fillColor: row.isBonus ? "#FFF8E6" : undefined,
      },
      {
        text: String(row.value),
        bold: !!row.isBonus,
        fillColor: row.isBonus ? "#FFF8E6" : undefined,
      },
    ]),
    [
      {
        text: "Grand Total Hours (Including Paid Leaves & Holidays)",
        bold: true,
        fillColor: "#E6E6E6",
      },
      {
        text: summary.totalHoursAttendance.toFixed(2),
        bold: true,
        fillColor: "#E6E6E6",
      },
    ],
  ];

  // === جدول تفاصيل الأيام ===
  const detailsTableBody = [
    [
      { text: "Date", bold: true },
      { text: "Day", bold: true },
      { text: "Type", bold: true },
      { text: "Check-In", bold: true },
      { text: "Check-Out", bold: true },
      { text: "Daily Hours", bold: true },
      { text: "Holiday Name", bold: true },
    ],
    ...details.map((entry) => {
      const dateObj = new Date(entry.date);
      let dateDisplay = "Invalid Date";
      if (!isNaN(dateObj.getTime())) {
        const y = dateObj.getUTCFullYear();
        const m = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getUTCDate()).padStart(2, "0");
        dateDisplay = `${y}-${m}-${d}`;
      }

      const rowBg = getRowBackground(entry.type);

      return [
        { text: dateDisplay, fillColor: rowBg },
        { text: entry.dayOfWeek ?? "-", fillColor: rowBg },
        { text: entry.type || "-", fillColor: rowBg },
        { text: entry.checkIn || "-", fillColor: rowBg },
        { text: entry.checkOut || "-", fillColor: rowBg },
        { text: entry.dailyHours || "-", fillColor: rowBg },
        { text: entry.holidayName || "", fillColor: rowBg },
      ];
    }),
  ];

  // === تعريف الـ PDF ===
  const docDefinition = {
    content: [
      {
        text: `${summary.monthName} Attendance Report`,
        style: "header",
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      {
        text: [
          { text: "Employee: ", bold: false },
          { text: summary.employeeName, bold: true },
        ],
        margin: [0, 0, 0, 15],
      },
      {
        table: {
          widths: ["*", "auto"],
          body: summaryTableBody,
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 20],
      },
      {
        text: "Daily Details",
        style: "subheader",
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "auto", "auto", "auto", "*"],
          body: detailsTableBody,
        },
        layout: "lightHorizontalLines",
        margin: [0, 0, 0, 25],
      },
      {
        text: "Signatures",
        style: "subheader",
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            width: "50%",
            stack: [
              { text: "Manager Signature:", margin: [0, 0, 0, 5] },
              {
                canvas: [
                  { type: "line", x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.5 },
                ],
              },
            ],
          },
          {
            width: "50%",
            stack: [
              { text: "Employee Signature:", margin: [0, 0, 0, 5] },
              {
                canvas: [
                  { type: "line", x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 0.5 },
                ],
              },
            ],
          },
        ],
      },
    ],
    styles: {
      header: {
        fontSize: 14,
        bold: true,
      },
      subheader: {
        fontSize: 12,
        bold: true,
      },
    },
    defaultStyle: {
      // direction: "rtl",  // فعّلها لو حاب كل النص RTL
      // font: "YourArabicFont" // لو ضفت خط عربي مخصص لـ pdfmake
    },
  };

  const fileName = `${summary.monthName}_Attendance_Report_${summary.employeeName.trim()}.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
};

export default exportMonthlyReportPDF;
