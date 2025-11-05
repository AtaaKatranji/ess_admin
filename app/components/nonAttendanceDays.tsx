import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { format, eachDayOfInterval } from "date-fns";
import { Input } from "@/components/ui/input";
import moment from "moment";
import { Holiday } from "@/app/types/Employee";
import AddManualLeave from "@/app/components/AddManualLeave";

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
  const [absentDays, setAbsentDays] = useState<string[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  //const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  console.log("institutionKey", slug);
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
        }).then((r) => r.json()).then((d) => d.leaves?.leaves || []),
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
            date >= new Date(l.startDate) &&
            date <= new Date(l.endDate)
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
        format(rec.date, "MMMM dd, yyyy: EEEE").toLowerCase().includes(term) ||
        rec.type.toLowerCase().includes(term) ||
        (rec.name && rec.name.toLowerCase().includes(term)) ||
        (rec.description && rec.description.toLowerCase().includes(term)) ||
        (rec.leaveType && rec.leaveType.toLowerCase().includes(term)) ||
        (rec.reason && rec.reason.toLowerCase().includes(term))
    );
  }, [dayRecords, searchTerm]);

  // Render
  if (loading) return <p>Loading...</p>;
  if (filteredRecords.length === 0)
    return (
      <p className="text-muted-foreground">
        No non-attendance records this month.
      </p>
    );

  return (
    <div className="flex-col space-y-4">
      <div className="flex justify-between items-center">
  <h2 className="text-xl font-semibold">Non-Attendance Records</h2>
  
  <div className="flex space-x-2 items-center">
    {/* 🔍 مربع البحث */}
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search records"
        className="pl-8"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* 🟦 زر إضافة إجازة يدوية */}
    <AddManualLeave employeeId={employeeId} onLeaveAdded={fetchData} />
  </div>
</div>

      <Card>
        {/* <ScrollArea className="h-[400px]"> */}
          <div className="p-4 space-y-4">
            {filteredRecords.map((record, idx) => (
              <div
                key={idx}
                className="flex items-center py-2 border-b last:border-b-0 space-x-4"
              >
                <span className="min-w-[180px]">
                  {format(new Date(record.date), "MMMM dd, yyyy: EEEE")}
                </span>
                <span
                  className={
                    record.type === "Holiday"
                      ? "font-bold text-green-700"
                      : record.type === "Leave"
                      ? "font-bold text-blue-700"
                      : "font-bold text-red-700"
                  }
                >
                  {record.type}
                </span>
                {record.type === "Holiday" && (
                  <span>
                    <b>{record.name}</b>
                    {record.description && (
                      <span className="ml-2 text-muted-foreground">
                        ({record.description})
                      </span>
                    )}
                  </span>
                )}
                {record.type === "Leave" && (
                  <span>
                    <span className="font-medium">{record.leaveType}</span>
                    {record.reason && (
                      <span className="ml-2 text-muted-foreground">
                        ({record.reason})
                      </span>
                    )}
                    {record.durationInDays && (
                      <span className="ml-2 text-xs text-gray-500">
                        • {record.durationInDays} day(s)
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
