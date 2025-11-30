"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Summary = {
  monthName: string;
  employeeName: string;
  totalHours: number;
  lateHours: number;
  earlyLeaveHours: number;
  earlyArrivalHours: number;
  extraAttendanceHours: number;
  totalDays: number;
  totalAbsents: number;
  totalHolidays: number;
  totalHolidayHours: number;
  totalLeaves: number;
  totalPaidLeaveHours: number;
  extraAdjustmentHours: number;
  totalHoursAttendance: number;
};

type Detail = {
  date: string;
  dayOfWeek?: string;
  type?: string;
  checkIn?: string;
  checkOut?: string;
  dailyHours?: string;
  holidayName?: string;
};

export default function MonthlyReportPrintPage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const month = searchParams.get("month");
  const autoPrint = searchParams.get("autoPrint"); // 1 = يفتح نافذة الطباعة للمستخدم

  const [summary, setSummary] = useState<Summary | null>(null);
  const [details, setDetails] = useState<Detail[]>([]);

  useEffect(() => {
    if (!employeeId || !month) return;

    (async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/monthly-summary?employeeId=${employeeId}&month=${month}`
      );
      const data = await res.json();
      setSummary(data.summary);     // عدّل حسب شكل الـ API عندك
      setDetails(data.details ?? []); // مهم: نخزن التفاصيل كمان
    })();
  }, [employeeId, month]);

  useEffect(() => {
    if (autoPrint === "1") {
      window.print();
    }
  }, [autoPrint]);

  if (!summary) return <div>Loading...</div>;

  // ✅ هون منعرّف summaryRows (مو جوا الـ JSX)
  const summaryRows: Array<{ label: string; value: string | number; isBonus?: boolean }> = [
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

  const getRowBackground = (type?: string) => {
    switch (type) {
      case "Offical Holiday":
        return "rgb(220,235,255)"; // أزرق فاتح
      case "Weekend":
        return "rgb(255,255,237)"; // أصفر فاتح
      case "Paid Leave":
        return "rgb(255,240,220)"; // برتقالي فاتح
      case "Unpaid Leave":
        return "rgb(255,220,220)"; // أحمر فاتح
      case "Absent":
        return "rgb(255,200,200)"; // أحمر أغمق شوي
      default:
        return "transparent";
    }
  };

  return (
    <div className="report-wrapper">
      {/* العنوان */}
      <h1 style={{ textAlign: "center" }}>
        <span style={{ fontWeight: "bold" }}>{summary.monthName}</span>{" "}
        Attendance Report
      </h1>

      {/* اسم الموظف */}
      <p style={{ marginTop: 20, fontSize: 12 }}>
        Employee:{" "}
        <span style={{ fontWeight: "bold" }}>{summary.employeeName}</span>
      </p>

      {/* 🔹 جدول الملخص */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 20,
          fontSize: 11,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #ccc",
                padding: "4px 6px",
                textAlign: "left",
              }}
            >
              Metric
            </th>
            <th
              style={{
                border: "1px solid #ccc",
                padding: "4px 6px",
                textAlign: "left",
              }}
            >
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {summaryRows.map((row) => (
            <tr
              key={row.label}
              style={
                row.isBonus
                  ? {
                      fontStyle: "italic",
                      fontWeight: "bold",
                      backgroundColor: "rgb(255, 248, 230)",
                    }
                  : {}
              }
            >
              <td
                style={{
                  border: "1px solid #eee",
                  padding: "3px 6px",
                }}
              >
                {row.label}
              </td>
              <td
                style={{
                  border: "1px solid #eee",
                  padding: "3px 6px",
                }}
              >
                {row.value}
              </td>
            </tr>
          ))}

          {/* صف Grand Total */}
          <tr
            style={{
              fontWeight: "bold",
              backgroundColor: "rgb(230,230,230)",
            }}
          >
            <td
              style={{
                border: "1px solid #ddd",
                padding: "4px 6px",
              }}
            >
              Grand Total Hours (Including Paid Leaves & Holidays)
            </td>
            <td
              style={{
                border: "1px solid #ddd",
                padding: "4px 6px",
              }}
            >
              {summary.totalHoursAttendance.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 🔹 جدول تفاصيل الأيام */}
      <h2 style={{ marginTop: 25, fontSize: 12 }}>Daily Details</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 8,
          fontSize: 10,
        }}
      >
        <thead>
          <tr>
            {[
              "Date",
              "Day",
              "Type",
              "Check-In",
              "Check-Out",
              "Daily Hours",
              "Holiday Name",
            ].map((head) => (
              <th
                key={head}
                style={{
                  border: "1px solid #ccc",
                  padding: "3px 4px",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                }}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {details.map((entry) => {
            const dateObj = new Date(entry.date);
            let dateDisplay = "Invalid Date";
            if (!isNaN(dateObj.getTime())) {
              const y = dateObj.getUTCFullYear();
              const m = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
              const d = String(dateObj.getUTCDate()).padStart(2, "0");
              dateDisplay = `${y}-${m}-${d}`;
            }

            const rowBg = getRowBackground(entry.type);

            return (
              <tr
                key={entry.date + (entry.type ?? "")}
                style={{ backgroundColor: rowBg }}
              >
                <td style={{ border: "1px solid #eee", padding: "2px 4px" }}>
                  {dateDisplay}
                </td>
                <td style={{ border: "1px solid #eee", padding: "2px 4px" }}>
                  {entry.dayOfWeek ?? "-"}
                </td>
                <td style={{ border: "1px solid #eee", padding: "2px 4px" }}>
                  {entry.type || "-"}
                </td>
                <td style={{ border: "1px solid #eee", padding: "2px 4px" }}>
                  {entry.checkIn || "-"}
                </td>
                <td style={{ border: "1px solid #eee", padding: "2px 4px" }}>
                  {entry.checkOut || "-"}
                </td>
                <td style={{ border: "1px solid #eee", padding: "2px 4px" }}>
                  {entry.dailyHours || "-"}
                </td>
                <td style={{ border: "1px solid #eee", padding: "2px 4px" }}>
                  {entry.holidayName || ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 🔹 التواقيع */}
      <div style={{ marginTop: 30, fontSize: 11 }}>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>Signatures</div>

        <div style={{ display: "flex", gap: 50, marginTop: 10 }}>
          <div>
            <div>Manager Signature:</div>
            <div
              style={{
                borderBottom: "1px solid #000",
                width: "180px",
                marginTop: 6,
              }}
            />
          </div>

          <div>
            <div>Employee Signature:</div>
            <div
              style={{
                borderBottom: "1px solid #000",
                width: "180px",
                marginTop: 6,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
