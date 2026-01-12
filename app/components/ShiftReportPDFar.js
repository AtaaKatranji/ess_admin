// components/export-shift-monthly-report-pdf-ar.js
import { vfsCairo } from "../../src/pdfmake/vfs_cairo"

// ---------- Helpers (Arabic) ----------

const DAY_AR = {
  Sun: "الأحد",
  Mon: "الاثنين",
  Tue: "الثلاثاء",
  Wed: "الأربعاء",
  Thu: "الخميس",
  Fri: "الجمعة",
  Sat: "السبت",

  Sunday: "الأحد",
  Monday: "الاثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",

  "0": "الأحد",
  "1": "الاثنين",
  "2": "الثلاثاء",
  "3": "الأربعاء",
  "4": "الخميس",
  "5": "الجمعة",
  "6": "السبت",
}

const DAY_ORDER = {
  الأحد: 1,
  الاثنين: 2,
  الثلاثاء: 3,
  الأربعاء: 4,
  الخميس: 5,
  الجمعة: 6,
  السبت: 7,
}

function dayToArabic(dayKey) {
  const k = String(dayKey).trim()
  return DAY_AR[k] || k
}

function normalizeTime(t) {
  if (!t) return "-"
  const s = String(t)
  const m = s.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return s
  const hh = m[1].padStart(2, "0")
  const mm = m[2]
  return `${hh}:${mm}`
}

function formatTimeRange(start, end) {
  const s = normalizeTime(start)
  const e = normalizeTime(end)
  return `${s} – ${e}`
}

/**
 * يجمع الأيام التي لها نفس وقت الدوام
 * مثال: "الأحد، الاثنين: 08:00 – 16:00"
 */
function formatShiftTimesAR(shiftTimes) {
  const timeGroups = {}

  Object.entries(shiftTimes || {}).forEach(([day, v]) => {
    const start = v?.start
    const end = v?.end
    const timeKey = `${normalizeTime(start)}-${normalizeTime(end)}`
    if (!timeGroups[timeKey]) timeGroups[timeKey] = []
    timeGroups[timeKey].push(dayToArabic(day))
  })

  return Object.entries(timeGroups)
    .map(([timeKey, days]) => {
      const [s, e] = timeKey.split("-")
      const daysSorted = [...days].sort(
        (a, b) => (DAY_ORDER[a] || 99) - (DAY_ORDER[b] || 99)
      )
      return `${daysSorted.join("، ")}: ${formatTimeRange(s, e)}`
    })
    .join("\n")
}

function safeHours(v) {
  const n = typeof v === "string" ? Number(v) : Number(v);
  if (!Number.isFinite(n)) return "-";
  return n.toFixed(2);
}

function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// ---------- Main Export ----------

const exportShiftMonthlyReportPDF_AR = async (data, options = {}) => {
  if (typeof window === "undefined") return

  const pdfMakeModule = await import("@digicole/pdfmake-rtl/build/pdfmake")
  const pdfFontsModule = await import("@digicole/pdfmake-rtl/build/vfs_fonts")

  const pdfMake = pdfMakeModule.default || pdfMakeModule
  const pdfFonts = pdfFontsModule.default || pdfFontsModule

  if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs
  }

  // Register Cairo fonts
  if (typeof pdfMake.addVirtualFileSystem === "function") {
    pdfMake.addVirtualFileSystem(vfsCairo)
  } else {
    pdfMake.vfs = { ...(pdfMake.vfs || {}), ...vfsCairo }
  }

  const cairoFont = {
    normal: "Cairo-Regular.ttf",
    bold: "Cairo-Bold.ttf",
    italics: "Cairo-Regular.ttf",
    bolditalics: "Cairo-Bold.ttf",
  }

  pdfMake.fonts = {
    Cairo: cairoFont,
    Roboto: cairoFont,
    Helvetica: cairoFont,
    Arial: cairoFont,
    Times: cairoFont,
    Courier: cairoFont,
    Nillima: cairoFont,
  }

  // const includeHolidayColumn = (data.employees || []).some(
  //   (e) => Number(e.holidays || 0) > 0
  // )
  const emps = Array.isArray(data.employees) ? data.employees : [];

  const showHolidayHours = emps.some(e => Number(e.holidayHours || 0) > 0);
  const showPaidLeaveHours = emps.some(e => Number(e.paidLeaveHours || 0) > 0);
  const showAdminRewardHours = emps.some(e => Number(e.adminRewardHours || 0) > 0);
  
  // "الإجمالي شامل" منطقي يظهر فقط إذا في شي إضافي (عطل ساعات/إجازات/مكافأة)
  const showTotalIncluding = showHolidayHours || showPaidLeaveHours || showAdminRewardHours;
  
  const scheduleText = formatShiftTimesAR(data.shiftTimes)
  const watermarkText = options.watermarkText || "سري"

  const METRIC_AR = {
    "Total Days Scheduled": "عدد أيام الدوام",
    "Total Employees Assigned": "عدد الموظفين",
    "Total Hours Scheduled": "إجمالي الساعات المجدولة",
    "Total Hours Worked": "إجمالي ساعات العمل",
    "Holiday Names": "أسماء العطل الرسمية",
    "Total Holiday Days": "عدد أيام العطل الرسمية",
    "Total Holiday Hours (Shift Calendar)": "ساعات العطل (حسب التقويم)",
    "Total Holiday Hours (All Employees)": "ساعات العطل (كل الموظفين)",
    "Total Paid Leave Hours (All Employees)": "ساعات الإجازات المدفوعة (كل الموظفين)",
    "Total Admin Reward Hours (All Employees)": "ساعات المكافأة الإدارية (كل الموظفين)",
    "Total Hours Including Paid Leave + Holidays + Admin Rewards (All Employees)":
      "إجمالي الساعات شامل الإجازات والعطل والمكافآت",
    "Average Daily Attendance": "متوسط الحضور اليومي",
    "Average Attendance Rate": "نسبة الحضور",
  };
  
  const metrics = Array.isArray(data.summaryMetrics) ? data.summaryMetrics : [];
  const metricsAR = metrics.map(m => ({
    ...m,
    label: METRIC_AR[m.label] || m.label
  }));
  

  // حوّلها لأزواج: [ [m0,m1], [m2,m3], ... ]
  const metricPairs = [];
  for (let i = 0; i < metricsAR.length; i += 2) {
    metricPairs.push([metricsAR[i], metricsAR[i + 1]]);
  }
  
  const summaryTableBody = [
    // Header
    [
      { text: "المؤشر", style: "th" },
      { text: "القيمة", style: "th", alignment: "left" },
      { text: "المؤشر", style: "th" },
      { text: "القيمة", style: "th", alignment: "left" },
    ],
  
    // Rows
    ...metricPairs.map((pair, idx) => {
      const stripe = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA"
      const a = pair[0] || {}
      const b = pair[1] || {}
  
      return [
        { text: String(a.label ?? "-"), fillColor: stripe, fontSize: 10 },
        { text: String(a.value ?? "-"), fillColor: stripe, fontSize: 10, alignment: "left" },
  
        { text: String(b.label ?? "-"), fillColor: stripe, fontSize: 10 },
        { text: String(b.value ?? "-"), fillColor: stripe, fontSize: 10, alignment: "left" },
      ]
    }),
  ]

  // ===== Employees table =====
  const employeeHead = [
    { text: "الموظف", style: "th" },
    { text: "أيام الحضور", style: "th" },
    { text: "أيام الغياب", style: "th" },

    ...(showPaidLeaveHours ? [{ text: "ساعات الإجازات", style: "th" }] : []),
    ...(showAdminRewardHours ? [{ text: "مكافأة إدارية", style: "th" }] : []),
  
    { text: "إجمالي الساعات", style: "th" },
  
    ...(showTotalIncluding ? [{ text: "الإجمالي شامل", style: "th" }] : []),
  
    { text: "التوقيع", style: "th" },
  ];
  

  const employeeBody = emps.map((e, idx) => {
    const stripe = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA";
  
    return [
      { text: e.name || "-", fillColor: stripe, fontSize: 10 },
  
      { text: String(e.daysAttended ?? "-"), fillColor: stripe, fontSize: 10, alignment: "center" },
      { text: String(e.daysAbsent ?? "-"), fillColor: stripe, fontSize: 10, alignment: "center" },
  
  
      ...(showPaidLeaveHours
        ? [{ text: safeHours(e.paidLeaveHours), fillColor: stripe, fontSize: 10, alignment: "center" }]
        : []),
  
      ...(showAdminRewardHours
        ? [{ text: safeHours(e.adminRewardHours), fillColor: stripe, fontSize: 10, alignment: "center" }]
        : []),
  
      {
        text: safeHours(e.totalHours),
        fillColor: stripe,
        fontSize: 10,
        alignment: "center",
        bold: true,
      },
  
      ...(showTotalIncluding
        ? [{
            text: safeHours(e.totalHoursIncludingPaidLeaveHolidayAdmin),
            fillColor: stripe,
            fontSize: 10,
            alignment: "center",
            bold: true,
          }]
        : []),
  
      { text: "", fillColor: stripe },
    ];
  });
  const employeeColCount = employeeHead.length;
  const employeeWidths = ["*"]; // الموظف
  for (let i = 1; i < employeeColCount; i++) employeeWidths.push("auto");
  const employeeTableBody = [employeeHead, ...employeeBody]

  const pageMargins = [10, 8, 10, 10];

  const docDefinition = {
    pageMargins,

    watermark: {
      text: watermarkText,
      color: "#BDBDBD",
      opacity: 0.15,
      bold: true,
      fontSize: 48,
      angle: 45,
    },

    defaultStyle: {
      font: "Cairo",
      alignment: "right",
      rtl: true,
      fontSize: 10,
      color: "#212121",
    },

    styles: {
      header: {
        fontSize: 14,
        bold: true,
        alignment: "center",
        margin: [0, 0, 0, 4],
      },
      subheader: {
        fontSize: 11,
        bold: true,
        margin: [0, 5, 0, 6],
        color: "#0D47A1",
      },
      label: { fontSize: 10, color: "#424242" },
      th: {
        bold: true,
        color: "#FFFFFF",
        fillColor: "#1565C0",
        fontSize: 10,
        margin: [2, 2, 2, 2],
      },
      small: { fontSize: 9, color: "#616161" },
      hint: { fontSize: 8, color: "#757575" },
    },

    footer: (currentPage, pageCount) => {
      const genDate = todayISO()
      const by = data.generatedBy ? String(data.generatedBy) : ""

      return {
        margin: [pageMargins[0], 0, pageMargins[2], 10],
        columns: [
          { text: `تاريخ الإنشاء: ${genDate}`, style: "small", alignment: "right" },
          { text: `${currentPage} / ${pageCount}`, style: "small", alignment: "center" },
          { text: `بواسطة: ${by}`.trim(), style: "small", alignment: "left" },
        ],
      }
    },

    content: [
      // Header
      // ===== Compact Header =====
      {
        columns: [
          data.logoBase64
            ? { width: 48, image: data.logoBase64, fit: [40, 40], alignment: "left" }
            : { width: 48, text: "" },

          {
            width: "*",
            text: `تقرير الشهر - ${data.monthName}`,
            style: "header",
            margin: [0, 2, 0, 0],
          },

          { width: 48, text: "" },
        ],
        margin: [0, 0, 0, 4],
      },

      // ===== Compact Shift Card =====
      {
        table: {
          widths: ["auto", "*"],
          body: [
            [
              { text: "المناوبة:", style: "small", bold: true },
              { text: String(data.shiftName || "-"), style: "small" },
            ],
            [
              { text: "النوع:", style: "small", bold: true },
              { text: String(data.shiftType || "-"), style: "small" },
            ],
            [
              { text: "الجدول:", style: "small", bold: true },
              { text: scheduleText || "-", style: "small", lineHeight: 1.1 },
            ],
            [
              { text: "ملاحظة:", style: "hint", bold: true },
              { text: "تم تجميع الأيام التي لها نفس وقت الدوام.", style: "hint" },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => "#E0E0E0",
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 2,
          paddingBottom: () => 2,
        },
        margin: [0, 0, 0, 6],
      },



    // Summary (4 columns)
{ text: "ملخص المؤشرات", style: "subheader" },
{
  table: {
    headerRows: 1,
    widths: ["*", "auto", "*", "auto"],
    body: summaryTableBody,
  },
  layout: {
    hLineWidth: (i) => (i === 0 ? 0 : 0.5),
    vLineWidth: () => 0,
    hLineColor: () => "#E0E0E0",
    paddingLeft: () => 7,
    paddingRight: () => 7,
    paddingTop: () => 1,
    paddingBottom: () => 1,
  },
},

      // Employees
      { text: "قائمة الموظفين", style: "subheader" },
      {
        table: {
          headerRows: 1,
          widths:employeeWidths,

          body: employeeTableBody,
        },
        layout: {
          hLineWidth: (i) => (i === 1 ? 1.2 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i) => (i === 1 ? "#1565C0" : "#E0E0E0"),
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 1,
          paddingBottom: () => 1,
        },
        margin: [0, 0, 0, 10],
      },

      // Notes
      { text: "ملاحظات", style: "subheader", color: "#424242" },
      {
        canvas: [
          { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: "#BDBDBD" },
          { type: "line", x1: 0, y1: 18, x2: 515, y2: 18, lineWidth: 1, lineColor: "#E0E0E0" },
          { type: "line", x1: 0, y1: 36, x2: 515, y2: 36, lineWidth: 1, lineColor: "#E0E0E0" },
        ],
        margin: [0, 4, 0, 0],
      },
    ],
  }

  const fileName = `${data.monthName}_تقرير_المناوبة_${String(data.shiftName || "").trim()}.pdf`
  pdfMake.createPdf(docDefinition).download(fileName)
}

export default exportShiftMonthlyReportPDF_AR
