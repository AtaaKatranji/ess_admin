import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { format, eachDayOfInterval } from "date-fns";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { Holiday } from "@/app/types/Employee";
import AddManualLeave from "@/app/components/AddManualLeave";
import { useI18n } from "@/app/context/I18nContext";
import { cn } from "@/lib/utils";

type Leave = {
  startDate: string;
  endDate: string;
  type: string;
  reason?: string;
  durationInDays?: number;
};

type DayRecord = {
  date: Date;
  type: "Absent" | "Leave" | "Holiday";
  name?: string; // For holidays
  description?: string; // For holidays
  leaveType?: string;
  reason?: string;
  durationInDays?: number;
};

type Props = {
  employeeId: string;
  selectedMonth: Date;
  slug: string;
  holidays: Holiday[];
};

const NonAttendanceTab: React.FC<Props> = ({
  employeeId,
  selectedMonth,
  slug,
  holidays,
}) => {
  const { t, lang, dir } = useI18n();
  const [absentDays, setAbsentDays] = useState<string[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    const formattedMonth = moment(selectedMonth).format("YYYY-MM");
    setLoading(true);
    try {
      const [absences, leaves] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/checks/absences?employeeId=${employeeId}&month=${formattedMonth}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }).then((r) => r.json()).then((d) => d.absentDates || []),

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/institutions/${slug}/leaves/month?userId=${employeeId}&month=${formattedMonth}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }).then((r) => r.json()).then((d) => Array.isArray(d.leaves) ? d.leaves : d.leaves?.leaves || []),
      ]);

      setAbsentDays(absences);
      setLeaves(leaves);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ استدعها داخل useEffect أول مرة
  useEffect(() => {
    fetchData();
  }, [employeeId, selectedMonth, slug]);

  // Utility to get all dates of the selected month
  function getAllDatesInMonth(monthDate: Date): Date[] {
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    return eachDayOfInterval({ start, end });
  }

  // Build and memoize day records
  const dayRecords: DayRecord[] = useMemo(() => {
    const allDates = getAllDatesInMonth(selectedMonth);
    return allDates
      .map((date) => {
        const dateStr = format(date, "yyyy-MM-dd");

        // 1. Check Holiday
        const holiday = holidays.find(
          (h) =>
            dateStr >= format(new Date(h.startDate), "yyyy-MM-dd") &&
            dateStr <= format(new Date(h.endDate), "yyyy-MM-dd")
        );
        if (holiday) {
          return {
            date,
            type: "Holiday",
            name: holiday.name,
            description: holiday.description,
          };
        }

        // 2. Check Leave
        const leave = leaves.find(
          (l) =>
            dateStr >= format(new Date(l.startDate), "yyyy-MM-dd") &&
            dateStr <= format(new Date(l.endDate), "yyyy-MM-dd")
        );
        if (leave) {
          return {
            date,
            type: "Leave",
            leaveType: leave.type,
            reason: leave.reason,
            durationInDays: leave.durationInDays,
          };
        }

        // 3. Check Absence
        if (absentDays.includes(dateStr)) {
          return {
            date,
            type: "Absent",
          };
        }

        // 4. Skip attended days
        return null;
      })
      .filter(Boolean) as DayRecord[];
  }, [selectedMonth, absentDays, leaves, holidays]);

  // Search/filter logic
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return dayRecords;
    const term = searchTerm.toLowerCase();
    return dayRecords.filter(
      (rec) =>
        new Date(rec.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          weekday: "long"
        }).toLowerCase().includes(term) ||
        t(`nonAttendance.type.${rec.type}`).toLowerCase().includes(term) ||
        (rec.name && rec.name.toLowerCase().includes(term)) ||
        (rec.description && rec.description.toLowerCase().includes(term)) ||
        (rec.leaveType && rec.leaveType.toLowerCase().includes(term)) ||
        (rec.reason && rec.reason.toLowerCase().includes(term))
    );
  }, [dayRecords, searchTerm, lang, t]);

  // Render
  if (loading) return <p>{t("common.loading")}</p>;
  if (filteredRecords.length === 0)
    return (
      <p className="text-muted-foreground">
        {t("nonAttendance.noRecords")}
      </p>
    );

  return (
    <div className="flex-col space-y-4" dir={dir}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">{t("nonAttendance.title")}</h2>

        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", dir === "rtl" ? "right-2" : "left-2")} />
            <Input
              placeholder={t("nonAttendance.searchPlaceholder")}
              className={cn("w-full sm:w-[260px]", dir === "rtl" ? "pr-8" : "pl-8")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <AddManualLeave employeeId={employeeId} onLeaveAdded={fetchData} />
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* <ScrollArea className="h-[400px]"> */}
        <div className="p-4 space-y-4">
          {filteredRecords.map((record, idx) => (
            <div
              key={idx}
              className={cn("flex flex-col sm:flex-row sm:items-center py-2 border-b last:border-b-0 gap-2 sm:gap-4", dir === "rtl" && "text-right")}
            >
              <span className="min-w-[200px] text-sm font-medium">
                {new Date(record.date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  weekday: "long"
                })}
              </span>
              <span
                className={cn(
                  "font-bold",
                  record.type === "Holiday"
                    ? "text-green-700"
                    : record.type === "Leave"
                      ? "text-blue-700"
                      : "text-red-700"
                )}
              >
                {t(`nonAttendance.type.${record.type}`)}
              </span>
              {record.type === "Holiday" && (
                <span className="text-sm">
                  <b>{record.name}</b>
                  {record.description && (
                    <span className="mx-2 text-muted-foreground">
                      ({record.description})
                    </span>
                  )}
                </span>
              )}
              {record.type === "Leave" && (
                <span className="text-sm">
                  <span className={
                    record.leaveType === "Paid"
                      ? "font-medium text-blue-700"
                      : "font-medium text-gray-500"
                  }>{record.leaveType === "Paid" ? t("nonAttendance.paidLeave") : t("nonAttendance.unpaidLeave")}</span>
                  {record.reason && (
                    <span className="mx-2 text-muted-foreground">
                      ({record.reason})
                    </span>
                  )}
                  {record.durationInDays && (
                    <span className="mx-2 text-xs text-gray-500">
                      • {record.durationInDays} {t("nonAttendance.days")}
                    </span>
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
        {/* </ScrollArea> */}
      </Card>
    </div>
  );
};

export default NonAttendanceTab;
