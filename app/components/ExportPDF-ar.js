// components/export-monthly-report-pdf-ar.tsx
import { vfsCairo } from "../../src/pdfmake/vfs_cairo"

const getRowBackground = (type) => {
  switch (type) {
    case "Offical Holiday":
      return "#E8F4FD"
    case "Weekend":
      return "#FFF9E6"
    case "Paid Leave":
      return "#FFF4E8"
    case "Unpaid Leave":
      return "#FFE8E8"
    case "Absent":
      return "#FFCDD2"
    default:
      return undefined
  }
}

const editedMarker = (isEdited) => {
  if (!isEdited) return { text: "-", alignment: "center", color: "#9E9E9E" }

  return {
    text: "!!",
    color: "#F57C00",
    bold: true,
    fontSize: 11,
    alignment: "center",
  }
}

const exportMonthlyReportPDF_AR = async (data, adjustments,) => {
  if (typeof window === "undefined") return

  const adjustmentsArray = (Array.isArray(adjustments) ? adjustments : adjustments?.items || [])
    .slice()
    .sort((a, b) => String(b.editedAt).localeCompare(String(a.editedAt)))

  const adjustmentsByDate = adjustmentsArray.reduce((acc, a) => {
    const key = a.logDate
    if (!acc[key]) acc[key] = []
    acc[key].push(a)
    return acc
  }, {})

  const hasAdjustments = Array.isArray(adjustmentsArray) && adjustmentsArray.length > 0

  const pdfMakeModule = await import("@digicole/pdfmake-rtl/build/pdfmake")
  const pdfFontsModule = await import("@digicole/pdfmake-rtl/build/vfs_fonts")

  const pdfMake = (pdfMakeModule ).default || pdfMakeModule
  const pdfFonts = (pdfFontsModule).default || pdfFontsModule

  if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs
  }

  // ensure custom Cairo fonts are registered in the internal VFS
  if (typeof pdfMake.addVirtualFileSystem === "function") {
    pdfMake.addVirtualFileSystem(vfsCairo)
  } else {
    pdfMake.vfs = {
      ...(pdfMake.vfs || {}),
      ...vfsCairo,
    }
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
    Nilima: cairoFont,
    Nillima: cairoFont,
    Helvetica: cairoFont,
    Arial: cairoFont,
    Times: cairoFont,
    Courier: cairoFont,
  }

  const { summary, details } = data

  const bonusHours = Number(summary.extraAdjustmentHours || 0)
  const baseTotal = Number(summary.totalHoursAttendance || 0)
  const grandTotalWithBonus = (baseTotal + bonusHours).toFixed(2)

  // Total Hours: صف مفرد (1 و2 مستخدمين، 3 و4 فاضيين)
  // لاحظ: طلبت سابقاً نقل القيمة للعمود الثاني؛ لذلك وضعتها في col 2
  const totalHoursRow = [
    { text: `⏰ إجمالي الساعات`, fillColor: "#FFFFFF", fontSize: 10 },
    { text: "", fillColor: "#FFFFFF", border: [false, false, false, false] },
    { text: "", fillColor: "#FFFFFF", border: [false, false, false, false] },
    { text: String(summary.totalHours), fillColor: "#FFFFFF", fontSize: 11, alignment: "right" },
  ]

  const bonusHoursRow =
    Number(summary.extraAdjustmentHours) > 0
      ? [
          { text: `🎁 ساعات مكافأة (قرار إداري)`, fillColor: "#FFF8DC", fontSize: 10 },
          {
            text: `+${summary.extraAdjustmentHours}`,
            fillColor: "#FFF8DC",
            fontSize: 11,
            alignment: "right",
            bold: true,
            color: "#F57C00",
          },
          { text: "", fillColor: "#FFF8DC", border: [false, false, false, false] },
          { text: "", fillColor: "#FFF8DC", border: [false, false, false, false] },
        ]
      : null

  const groupedSummaryPairs = [
    [
      { label: "ساعات التأخير", value: summary.lateHours, icon: "⏱️" },
      { label: "ساعات الخروج المبكر", value: summary.earlyLeaveHours, icon: "🚪" },
    ],
    [
      { label: "ساعات الحضور المبكر", value: summary.earlyArrivalHours, icon: "🌅" },
      { label: "ساعات الحضور الإضافية", value: summary.extraAttendanceHours, icon: "⭐" },
    ],
    [
      { label: "عدد أيام الحضور", value: summary.totalDays, icon: "📅" },
      { label: "عدد أيام الغياب", value: summary.totalAbsents, icon: "❌" },
    ],
    [
      { label: "عدد أيام العطل", value: summary.totalHolidays, icon: "🎉" },
      { label: "ساعات العطل", value: `+${summary.totalHolidayHours}`, icon: "🎊" },
    ],
    [
      { label: "الإجازات المدفوعة", value: summary.totalLeaves, icon: "🏖️" },
      { label: "ساعات الإجازات المدفوعة", value: `+${summary.totalPaidLeaveHours}`, icon: "✅" },
    ],
  ]
// بدل صف Grand total الحالي (الذي فيه colSpan)
const grandTotalRow = [
  {
    text: "📊 Grand Total Hours (Including Paid Leaves & Holidays & Bonus)",
    fillColor: "#E3F2FD",
    color: "#0D47A1",
    bold: true,
    fontSize: 10,
  },
  { text: "", fillColor: "#E3F2FD" },
  { text: "", fillColor: "#E3F2FD" },
  {
    text: grandTotalWithBonus,
    fillColor: "#E3F2FD",
    color: "#0D47A1",
    bold: true,
    alignment: "right",
    fontSize: 11,
  },
]

  const summaryTableBody = [
    // Header
    [
      { text: "المؤشر", bold: true, color: "#FFF", fillColor: "#1565C0" },
      { text: "القيمة", bold: true, color: "#FFF", fillColor: "#1565C0", alignment: "right" },
      { text: "المؤشر", bold: true, color: "#FFF", fillColor: "#1565C0" },
      { text: "القيمة", bold: true, color: "#FFF", fillColor: "#1565C0", alignment: "right" },
    ],

    // Total Hours
    totalHoursRow,

    // باقي الأزواج
    ...groupedSummaryPairs.map((pair, idx) => {
      const stripe = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA"
      const [a, b] = pair

      return [
        { text: `${a.icon} ${a.label}`, fillColor: stripe, fontSize: 10 },
        { text: String(a.value), fillColor: stripe, fontSize: 10, alignment: "right" },
        { text: `${b.icon} ${b.label}`, fillColor: stripe, fontSize: 10 },
        { text: String(b.value), fillColor: stripe, fontSize: 10, alignment: "right" },
      ]
    }),

    // Bonus Hours قبل الإجمالي النهائي
    ...(bonusHoursRow ? [bonusHoursRow] : []),

    // Grand total
    grandTotalRow,
  ]

  const detailsTableBody = [
    [
      { text: "اسم العطلة", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "تم التعديل؟", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "ساعات اليوم", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "الخروج", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "الدخول", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "النوع", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "اليوم", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "التاريخ", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
    ],

    ...details.map((entry, index) => {
      const dateObj = new Date(entry.date)
      let dateDisplay = "تاريخ غير صالح"
      if (!isNaN(dateObj.getTime())) {
        const y = dateObj.getUTCFullYear()
        const m = String(dateObj.getUTCMonth() + 1).padStart(2, "0")
        const d = String(dateObj.getUTCDate()).padStart(2, "0")
        dateDisplay = `${y}-${m}-${d}`
      }

      const typeColor = getRowBackground(entry.type)
      const stripeColor = index % 2 === 0 ? "#FAFAFA" : "#FFFFFF"
      const isEdited = !!adjustmentsByDate[dateDisplay]?.length
      const editedOverlay = isEdited ? "#FFF9E6" : null
      const rowBgFinal = typeColor || editedOverlay || stripeColor

      return [
        { text: entry.holidayName || "", fillColor: rowBgFinal, fontSize: 8, margin: [1, 1, 1, 1], color: "#616161" },
        { ...(editedMarker(isEdited)), fillColor: rowBgFinal, margin: [1, 1, 1, 1] },
        {
          text: entry.dailyHours || "-",
          fillColor: rowBgFinal,
          fontSize: 10,
          margin: [1, 1, 1, 1],
          color: "#212121",
          bold: !!entry.dailyHours,
        },
        { text: entry.checkOut || "-", fillColor: rowBgFinal, fontSize: 10, margin: [1, 1, 1, 1], color: "#424242" },
        { text: entry.checkIn || "-", fillColor: rowBgFinal, fontSize: 10, margin: [1, 1, 1, 1], color: "#424242" },
        { text: entry.type || "-", fillColor: rowBgFinal, fontSize: 9, margin: [1, 1, 1, 1], color: "#424242" },
        { text: entry.dayOfWeek ?? "-", fillColor: rowBgFinal, fontSize: 9, margin: [1, 1, 1, 1], color: "#424242" },
        { text: dateDisplay, fillColor: rowBgFinal, fontSize: 9, margin: [1, 1, 1, 1], color: "#424242" },
      ]
    }),
  ]

  const timeCell = (t, changed) => ({
    text: t || "-",
    alignment: "center",
    fillColor: changed ? "#FFF9E6" : undefined,
    fontSize: 9,
    margin: [1, 2, 1, 2],
    color: changed ? "#E65100" : "#424242",
    bold: changed,
  })

  const adjustmentsTableBody = [
    [
      { text: "التاريخ", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "الدخول القديم", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "الخروج القديم", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "الدخول الجديد", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "الخروج الجديد", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "بواسطة", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "تاريخ التعديل", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "ملاحظة", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
    ],

    ...(adjustmentsArray || []).map((a, idx) => {
      const stripe = idx % 2 === 0 ? "#FAFAFA" : "#FFFFFF"

      const oldIn = a.oldCheckIn || null
      const oldOut = a.oldCheckOut || null
      const newIn = a.newCheckIn || null
      const newOut = a.newCheckOut || null

      const changedIn = String(oldIn || "") !== String(newIn || "")
      const changedOut = String(oldOut || "") !== String(newOut || "")

      return [
        { text: a.logDate, fillColor: stripe, fontSize: 9, margin: [1, 2, 1, 2], color: "#424242" },
        { ...(timeCell(oldIn, changedIn) ), fillColor: changedIn ? "#FFE8E8" : stripe },
        { ...(timeCell(oldOut, changedOut) ), fillColor: changedOut ? "#FFE8E8" : stripe },
        { ...(timeCell(newIn, changedIn) ), fillColor: changedIn ? "#E8F5E9" : stripe },
        { ...(timeCell(newOut, changedOut) ), fillColor: changedOut ? "#E8F5E9" : stripe },
        { text: a.editedByName || "-", fillColor: stripe, fontSize: 9, margin: [1, 2, 1, 2], color: "#424242" },
        {
          text: a.editedAt ? String(a.editedAt).replace("T", " ").replace(".000Z", "") : "-",
          fillColor: stripe,
          fontSize: 8,
          margin: [1, 2, 1, 2],
          color: "#616161",
        },
        { text: a.note || "-", fillColor: stripe, fontSize: 8, margin: [1, 2, 1, 2], color: "#616161", italics: true },
      ]
    }),
  ]

  // إخفاء قسم التعديلات بالكامل إذا ما في تعديلات
  const adjustmentsSection = hasAdjustments
    ? [
        {
          canvas: [{ type: "rect", x: 0, y: -2, w: 270, h: 24, r: 4, color: "#FFF3E0" }],
        },
        {
          text: "⚙️ سجل تعديلات الحضور والانصراف",
          style: "subheader",
          margin: [0, -25, 8, 0],
          color: "#E65100",
          fontSize: 13,
          bold: true,
        },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "*"],
            body: adjustmentsTableBody,
          },
          layout: {
            hLineWidth: (i) => (i === 1 ? 1.5 : 0.5),
            vLineWidth: () => 0,
            hLineColor: (i) => (i === 1 ? "#F57C00" : "#E0E0E0"),
            paddingLeft: () => 7,
            paddingRight: () => 7,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
          margin: [0, 12, 0, 32],
        },
      ]
    : []

  const docDefinition = {
    pageMargins: [20, 10, 10, 20],
    // RTL for Arabic
    defaultStyle: {
      font: "Cairo",
      alignment: "right",
      rtl: true,
    },
    content: [
      {
        text: `${summary.monthName} - تقرير الحضور والانصراف`,
        style: "header",
        alignment: "center",
        margin: [0, 0, 0, 10],
      },
      {
        text: [{ text: "الموظف: " }, { text: summary.employeeName, bold: true }],
        margin: [0, 0, 0, 10],
      },

      {
        text: "📊 ملخص الأداء",
        style: "subheader",
        margin: [0, 0, 0, 0],
        color: "#0D47A1",
        fontSize: 13,
        bold: true,
      },

      {
        table: {
          widths: ["*", "auto", "*", "auto"],
          body: summaryTableBody,
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 0.5),
          vLineWidth: () => 0,
          hLineColor: () => "#BDBDBD",
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 0,
          paddingBottom: () => 0,
        },
        margin: [0, 12, 0, 28],
      },

      {
        canvas: [{ type: "rect", x: 0, y: -2, w: 230, h: 24, r: 4, color: "#E3F2FD" }],
        margin: [0, 0, 0, 0],
      },
      {
        text: "📅 تفاصيل الحضور اليومية",
        style: "subheader",
        margin: [0, -25, 8, 0],
        color: "#0D47A1",
        fontSize: 13,
        bold: true,
      },

      {
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
          body: detailsTableBody,
        },
        layout: {
          hLineWidth: (i) => (i === 1 ? 1.5 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i) => (i === 1 ? "#1565C0" : "#E0E0E0"),
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 2,
          paddingBottom: () => 2,
        },
        margin: [0, 12, 0, 28],
      },

      ...adjustmentsSection,

      {
        canvas: [{ type: "rect", x: 0, y: -5, w: 130, h: 24, r: 4, color: "#F5F5F5" }],
        margin: [0, 0, 0, 0],
      },
      {
        text: "✍️ التواقيع",
        style: "subheader",
        alignment: "right",
        margin: [0, -22, 0, 0],   // ✅ ارفع العنوان فوق شوي
        color: "#424242",
        fontSize: 13,
        bold: true,
      },

      {
        columns: [
          // يمين: توقيع الموظف (لـ RTL عادةً الموظف على اليمين)
          {
            width: "48%",
            stack: [
              {
                canvas: [
                  { type: "rect", x: 1, y: 3, w: 230, h: 75, r: 6, color: "#E0E0E0" },
                  { type: "rect", x: 0, y: 0, w: 230, h: 75, r: 6, color: "#FFFFFF", lineWidth: 1.5, lineColor: "#BDBDBD" },
                  { type: "line", x1: 18, y1: 40, x2: 218, y2: 40, lineWidth: 1, dash: { length: 4, space: 2 }, lineColor: "#BDBDBD" },
                ],
              },
      
              // العنوان داخل البوكس
              {
                text: "👤 توقيع المدير",
                fontSize: 10,
                color: "#757575",
                bold: true,
                alignment: "right",
                relativePosition: { x: 0, y: -66 },
                margin: [0, 0, 0, 0],
              },
      
              {
                text: "التاريخ: _____________",
                fontSize: 8,
                color: "#9E9E9E",
                alignment: "right",
                relativePosition: { x: 0, y: -22 },
                margin: [0, 0, 0, 0],
              },
            ],
          },
      
          { width: "4%", text: "" },
      
          // يسار: توقيع المدير
          {
            width: "48%",
            stack: [
              {
                canvas: [
                  { type: "rect", x: 1, y: 3, w: 230, h: 75, r: 6, color: "#E0E0E0" },
                  { type: "rect", x: 0, y: 0, w: 230, h: 75, r: 6, color: "#FFFFFF", lineWidth: 1.5, lineColor: "#BDBDBD" },
                  { type: "line", x1: 18, y1: 40, x2: 218, y2: 40, lineWidth: 1, dash: { length: 4, space: 2 }, lineColor: "#BDBDBD" },
                ],
              },

              {
                text: "✏️ توقيع الموظف",
                fontSize: 10,
                color: "#757575",
                bold: true,
                alignment: "right",
                relativePosition: { x: 0, y: -66 },
                margin: [0, 0, 0, 0],
              },
      
              // التاريخ داخل البوكس
              {
                text: "التاريخ: _____________",
                fontSize: 8,
                color: "#9E9E9E",
                alignment: "right",
                relativePosition: { x: 0, y: -22 },
                margin: [0, 0, 0, 0],
              },
      
              
            ],
          },
        ],
        margin: [0, 6, 0, 0],
      },
    ],
  }      

  const fileName = `${summary.monthName}_تقرير_الحضور_${String(summary.employeeName || "").trim()}.pdf`
  pdfMake.createPdf(docDefinition).download(fileName)
}

export default exportMonthlyReportPDF_AR
