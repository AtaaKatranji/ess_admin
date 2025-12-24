// components/export-monthly-report-pdf.tsx
import { vfsCairo } from "../../src/pdfmake/vfs_cairo";
const getRowBackground = (type) => {
  switch (type) {
    case "Offical Holiday":
      return "#E8F4FD" // لون أزرق فاتح أكثر نعومة
    case "Weekend":
      return "#FFF9E6" // لون أصفر أكثر دفئ
    case "Paid Leave":
      return "#FFF4E8" // لون برتقالي دافئ
    case "Unpaid Leave":
      return "#FFE8E8" // لون أحمر فاتح محسّن
    case "Absent":
      return "#FFCDD2" // لون أحمر أغمق محسّن
    default:
      return undefined
  }
}

const editedMarker = (isEdited) => {
  if (!isEdited) return { text: "-", alignment: "center", color: "#9E9E9E" }

  return {
    text: "!!",
    color: "#F57C00", // برتقالي أكثر وضوح
    bold: true,
    fontSize: 11,
    alignment: "center",
  }
}
const formatDate = (value) => {
  const d = new Date(value)
  if (isNaN(d.getTime())) return "-"
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

const formatTime = (value) => {
  if (!value) return "-"
  const t = String(value)
  const parts = t.split("T")[1] || t
  return parts.substring(0, 5) // hh:mm
}

const formatMinutesToHHMM = (minutes) => {
  const total = Number(minutes || 0)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}
const formatHourlyLeaveValue = (totalMinutes) => {
  const decimalHours = +(totalMinutes / 60).toFixed(2)

  

  return `${decimalHours} (${totalMinutes} min)`
}

const exportMonthlyReportPDF = async (data, adjustments, breaksData) => {
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
  const hasAdjustments = Array.isArray(adjustmentsArray) && adjustmentsArray.length > 0;

  const pdfMakeModule = await import("@digicole/pdfmake-rtl/build/pdfmake")
  const pdfFontsModule = await import("@digicole/pdfmake-rtl/build/vfs_fonts")

  const pdfMake = pdfMakeModule.default || pdfMakeModule
  const pdfFonts = pdfFontsModule.default || pdfFontsModule

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
    // alias common font names to Cairo to avoid “font … not defined”
    Roboto: cairoFont,
    Nilima: cairoFont,
    Nillima: cairoFont,
    Helvetica: cairoFont,
    Arial: cairoFont,
    Times: cairoFont,
    Courier: cairoFont,
  }

  const { summary, details } = data
  const breaksRoot = breaksData?.data || breaksData || {}

  const customBreaksBlock = breaksRoot.custom || { breaks: [], totalDuration: 0 }
  const regularBreaksBlock = breaksRoot.regular || { breaks: [], totalDuration: 0 }

  const customBreaks = Array.isArray(customBreaksBlock.breaks) ? customBreaksBlock.breaks : []
  const regularBreaks = Array.isArray(regularBreaksBlock.breaks) ? regularBreaksBlock.breaks : []

  const allBreaks = [...customBreaks, ...regularBreaks]
    .filter((b) => b.status === "Approved") // نعرض فقط الموافق عليها
    .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)))

  const totalHourlyLeaveMinutes =
    Number(customBreaksBlock.totalDuration || 0) +
    Number(regularBreaksBlock.totalDuration || 0)
  

  const totalHourlyLeavesCount = allBreaks.length
  const summaryRows = [
    { label: "Total Hours", value: summary.totalHours, icon: "⏰" },
    { label: "Late Hours", value: summary.lateHours, icon: "⏱️" },
    { label: "Early Leave Hours", value: summary.earlyLeaveHours, icon: "🚪" },
    { label: "Early Arrival Hours", value: summary.earlyArrivalHours, icon: "🌅" },
    { label: "Extra Attendance Hours", value: summary.extraAttendanceHours, icon: "⭐" },
    { label: "Total Days Attendanced", value: summary.totalDays, icon: "📅" },
    { label: "Total Days Absents", value: summary.totalAbsents, icon: "❌" },
    { label: "Total Days Holidays", value: summary.totalHolidays, icon: "🎉" },
    { label: "Total Hours Holidays", value: `+${summary.totalHolidayHours}`, icon: "🎊" },
    { label: "Paid Leaves", value: summary.totalLeaves, icon: "🏖️" },
    { label: "Paid Leave Hours", value: `+${summary.totalPaidLeaveHours}`, icon: "✅" },
  ]

  if (Number(summary.extraAdjustmentHours) > 0) {
    summaryRows.push({
      label: "Bonus Hours (Manager Reward)",
      value: `+${summary.extraAdjustmentHours}`,
      isBonus: true,
      icon: "🎁",
    })
  }

  const bonusHours = Number(summary.extraAdjustmentHours || 0)
  const baseTotal = Number(summary.totalHoursAttendance || 0)
  const grandTotalWithBonus = (baseTotal + bonusHours).toFixed(2)

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
      text: String(grandTotalWithBonus ?? ""),
      fillColor: "#E3F2FD",
      color: "#0D47A1",
      bold: true,
      alignment: "right",
      fontSize: 11,
    },
  ];
  

  const totalHoursRow = [
    { text: `⏰ Total Hours`, fillColor: "#FFFFFF", fontSize: 10 }, // col 1
    { text: "", fillColor: "#FFFFFF", border: [false, false, false, false] }, // col 2
    { text: "", fillColor: "#FFFFFF", border: [false, false, false, false] }, // col 3
    { text: String(summary.totalHours), fillColor: "#FFFFFF", fontSize: 11 , alignment: "right" }, // col 4
  ];
  const bonusHoursRow =
  Number(summary.extraAdjustmentHours) > 0
    ? [
        { text: `🎁 Bonus Hours (Manager Reward)`, fillColor: "#FFF8DC",fontSize: 10 },
        { text: "", fillColor: "#FFF8DC", border: [false, false, false, false] },
        { text: "", fillColor: "#FFF8DC", border: [false, false, false, false] },
        { text: `+${summary.extraAdjustmentHours}`, fillColor: "#FFF8DC",fontSize: 11, alignment: "right", bold: true, color: "#F57C00" },
      ]
    : null;
  
  const groupedSummaryPairs = [
    [
      { label: "Late Hours", value: summary.lateHours, icon: "⏱️" },
      { label: "Early Leave Hours", value: summary.earlyLeaveHours, icon: "🚪" },
    ],
    [
      { label: "Early Arrival Hours", value: summary.earlyArrivalHours, icon: "🌅" },
      { label: "Extra Attendance Hours", value: summary.extraAttendanceHours, icon: "⭐" },
    ],
    [
      { label: "Total Days Attendanced", value: summary.totalDays, icon: "📅" },
      { label: "Total Days Absents", value: summary.totalAbsents, icon: "❌" },
    ],
    [
      { label: "Total Days Holidays", value: summary.totalHolidays, icon: "🎉" },
      { label: "Total Hours Holidays", value: `+${summary.totalHolidayHours}`, icon: "🎊" },
    ],
    [
      { label: "Paid Leaves", value: summary.totalLeaves, icon: "🏖️" },
      { label: "Paid Leave Hours", value: `+${summary.totalPaidLeaveHours}`, icon: "✅" },
    ],
    [{
      label: "Hourly Leaves Count",
      value: totalHourlyLeavesCount,
      icon: "⏳",
    },
    {
      label: "Hourly Leave Duration (Hours)",
      value: formatHourlyLeaveValue(totalHourlyLeaveMinutes),
      icon: "⌛",
    },
    ]
  ];
  
  const summaryTableBody = [
    // Header (4 خلايا)
    [
      { text: "Metric", bold: true, color: "#FFF", fillColor: "#1565C0" },
      { text: "Value",  bold: true, color: "#FFF", fillColor: "#1565C0", alignment: "right" },
      { text: "Metric", bold: true, color: "#FFF", fillColor: "#1565C0" },
      { text: "Value",  bold: true, color: "#FFF", fillColor: "#1565C0", alignment: "right" },
    ],
  
    // Total Hours (صف مفرد: العمود 1 و2 فقط)
    totalHoursRow,
  
    // باقي الأزواج
    ...groupedSummaryPairs.map((pair, idx) => {
      const stripe = idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA";
      const [a, b] = pair;
  
      return [
        { text: `${a.icon} ${a.label}`, fillColor: stripe, fontSize: 10  },
        { text: String(a.value), fillColor: stripe, fontSize: 10 , alignment: "right" },
        { text: `${b.icon} ${b.label}`, fillColor: stripe ,fontSize: 10  },
        { text: String(b.value), fillColor: stripe,fontSize: 10 , alignment: "right" },
      ];
    }),
  
    // Bonus Hours (قبل Grand Total مباشرة) — صف مفرد
    ...(bonusHoursRow ? [bonusHoursRow] : []),
    
  
    // Grand total
    grandTotalRow,
  ];

  const detailsTableBody = [
    [
      { text: "Date", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Day", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Type", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Check-In", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Check-Out", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Daily Hours", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Edited?", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Holiday Name", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
    ],

    ...details.map((entry, index) => {
      const dateObj = new Date(entry.date)
      let dateDisplay = "Invalid Date"
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
        { text: dateDisplay, fillColor: rowBgFinal, fontSize: 9, margin: [1, 1, 1, 1], color: "#424242" },
        { text: entry.dayOfWeek ?? "-", fillColor: rowBgFinal, fontSize: 9, margin: [1, 1, 1, 1], color: "#424242" },
        { text: entry.type || "-", fillColor: rowBgFinal, fontSize: 9, margin: [1, 1, 1, 1], color: "#424242" },
        { text: entry.checkIn || "-", fillColor: rowBgFinal, fontSize: 10, margin: [1, 1, 1, 1], color: "#424242" },
        { text: entry.checkOut || "-", fillColor: rowBgFinal, fontSize: 10, margin: [1, 1, 1, 1], color: "#424242" },
        {
          text: entry.dailyHours || "-",
          fillColor: rowBgFinal,
          fontSize: 10,
          margin: [1, 1, 1, 1],
          color: "#212121",
          bold: !!entry.dailyHours,
        },
        { ...editedMarker(isEdited), fillColor: rowBgFinal, margin: [1, 1, 1, 1] },
        { text: entry.holidayName || "", fillColor: rowBgFinal, fontSize: 8, margin: [1, 1, 1, 1], color: "#616161" },
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
      { text: "Date", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Old In", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Old Out", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "New In", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "New Out", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "By", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Edited At", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Note", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
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
        { ...timeCell(oldIn, changedIn), fillColor: changedIn ? "#FFE8E8" : stripe },
        { ...timeCell(oldOut, changedOut), fillColor: changedOut ? "#FFE8E8" : stripe },
        { ...timeCell(newIn, changedIn), fillColor: changedIn ? "#E8F5E9" : stripe },
        { ...timeCell(newOut, changedOut), fillColor: changedOut ? "#E8F5E9" : stripe },
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
  const adjustmentsSection = hasAdjustments
  ? [
      {
        canvas: [
          { type: "rect", x: 0, y: -2, w: 270, h: 24, r: 4, color: "#FFF3E0" },
        ],
      },
      {
        text: "⚙️ Attendance Adjustments (Audit Log)",
        style: "subheader",
        margin: [8, -25, 0, 0],
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
  : [];
  const hasHourlyBreaks = allBreaks.length > 0

  const hourlyBreaksTableBody = [
    [
      { text: "Date", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "From", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "To", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Duration (HH:MM)", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Type", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
      { text: "Approved By", bold: true, color: "#FFFFFF", fillColor: "#1565C0", fontSize: 9, margin: [1, 3, 1, 3] },
    ],
  
    ...allBreaks.map((b, idx) => {
      const stripe = idx % 2 === 0 ? "#FAFAFA" : "#FFFFFF"
  
      const minutes =
        b.durationTaken != null && b.durationTaken !== 0
          ? b.durationTaken
          : b.duration
  
      const durationText = formatMinutesToHHMM(minutes)
  
      const typeLabel = b.isCustomBreak
        ? (b.customBreakName || "Custom Break")
        : (b.breakType?.name || "Regular Break")
  
      const approvedByName =
        b.approvedByUser?.name || b.approvedBy || "-" // لو لاحقاً ترجمت ID لاسم
  
      return [
        { text: formatDate(b.startTime), fillColor: stripe, fontSize: 9, margin: [1, 2, 1, 2], color: "#424242" },
        { text: formatTime(b.startTime), fillColor: stripe, fontSize: 9, margin: [1, 2, 1, 2], color: "#424242" },
        { text: formatTime(b.endTime),   fillColor: stripe, fontSize: 9, margin: [1, 2, 1, 2], color: "#424242" },
        { text: durationText,            fillColor: stripe, fontSize: 9, margin: [1, 2, 1, 2], color: "#212121", bold: true },
        { text: typeLabel,               fillColor: stripe, fontSize: 8, margin: [1, 2, 1, 2], color: "#616161" },
        { text: approvedByName,          fillColor: stripe, fontSize: 8, margin: [1, 2, 1, 2], color: "#616161" },
      ]
    }),
  ]
  const hourlyBreaksSection = hasHourlyBreaks
  ? [
      {
        canvas: [
          { type: "rect", x: 0, y: -2, w: 260, h: 24, r: 4, color: "#E8F5E9" },
        ],
      },
      {
        text: "⏳ Hourly Leaves / Breaks",
        style: "subheader",
        margin: [8, -25, 0, 0],
        color: "#1B5E20",
        fontSize: 13,
        bold: true,
      },
      {
        text: "This section shows all approved hourly permissions / breaks during the month.",
        margin: [0, 4, 0, 4],
        fontSize: 8,
        color: "#757575",
      },
      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "auto", "*", "auto"],
          body: hourlyBreaksTableBody,
        },
        layout: {
          hLineWidth: (i) => (i === 1 ? 1.5 : 0.5),
          vLineWidth: () => 0,
          hLineColor: (i) => (i === 1 ? "#2E7D32" : "#E0E0E0"),
          paddingLeft: () => 7,
          paddingRight: () => 7,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 8, 0, 28],
      },
    ]
  : []

  const docDefinition = {
    pageMargins: [20, 10, 10, 20],
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
        margin: [0, 0, 0, 10],
      },
      {
        text: "📊 Performance Summary",
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
        canvas: [
          {
            type: "rect",
            x: 0,
            y: -2,
            w: 230,
            h: 24,
            r: 4,
            color: "#E3F2FD",
          },
        ],
        margin: [0, 0, 0, 0],
      },
      {
        text: "📅 Daily Attendance Details",
        style: "subheader",
        margin: [8, -25, 0, 0],
        color: "#0D47A1",
        fontSize: 13,
        bold: true,
      },

      {
        table: {
          headerRows: 1,
          widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "*"],
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
      ...hourlyBreaksSection,
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: -2,
            w: 130,
            h: 24,
            r: 4,
            color: "#F5F5F5",
          },
        ],
        margin: [0, 0, 0, 0],
      },
      {
        text: "✍️ Signatures",
        style: "subheader",
        margin: [8, -24, 0, 0],
        color: "#424242",
        fontSize: 13,
        bold: true,
      },

      {
        columns: [
          {
            width: "48%",
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 1,
                    y: 3,
                    w: 230,
                    h: 75,
                    r: 6,
                    color: "#E0E0E0",
                  },
                  {
                    type: "rect",
                    x: 0,
                    y: 0,
                    w: 230,
                    h: 75,
                    r: 6,
                    color: "#FFFFFF",
                    lineWidth: 1.5,
                    lineColor: "#BDBDBD",
                  },
                ],
              },
              {
                text: "👤 Manager Signature",
                margin: [12, -67, 0, 0],
                fontSize: 10,
                color: "#757575",
                bold: true,
              },
              {
                canvas: [
                  {
                    type: "line",
                    x1: 12,
                    y1: 38,
                    x2: 218,
                    y2: 38,
                    lineWidth: 1,
                    dash: { length: 4, space: 2 },
                    lineColor: "#BDBDBD",
                  },
                ],
              },
              {
                text: "Date: _____________",
                margin: [12, 8, 0, 0],
                fontSize: 8,
                color: "#9E9E9E",
              },
            ],
          },
          {
            width: "4%",
            text: "",
          },
          {
            width: "48%",
            stack: [
              {
                canvas: [
                  {
                    type: "rect",
                    x: 1,
                    y: 3,
                    w: 230,
                    h: 75,
                    r: 6,
                    color: "#E0E0E0",
                  },
                  {
                    type: "rect",
                    x: 0,
                    y: 0,
                    w: 230,
                    h: 75,
                    r: 6,
                    color: "#FFFFFF",
                    lineWidth: 1.5,
                    lineColor: "#BDBDBD",
                  },
                ],
              },
              {
                text: "✏️ Employee Signature",
                margin: [12, -67, 0, 0],
                fontSize: 10,
                color: "#757575",
                bold: true,
              },
              {
                canvas: [
                  {
                    type: "line",
                    x1: 12,
                    y1: 38,
                    x2: 218,
                    y2: 38,
                    lineWidth: 1,
                    dash: { length: 4, space: 2 },
                    lineColor: "#BDBDBD",
                  },
                ],
              },
              {
                text: "Date: _____________",
                margin: [12, 8, 0, 0],
                fontSize: 8,
                color: "#9E9E9E",
              },
            ],
          },
        ],
        margin: [0, 15, 0, 0],
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
      },
      subheader: {
        fontSize: 13,
        bold: true,
      },
    },
    defaultStyle: {
      font: "Cairo",
    },
  }

  const fileName = `${summary.monthName}_Attendance_Report_${summary.employeeName.trim()}.pdf`
  pdfMake.createPdf(docDefinition).download(fileName)
}

export default exportMonthlyReportPDF
