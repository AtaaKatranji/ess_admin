"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CalendarIcon, ClockIcon, Star, Rabbit, Turtle, Search, Loader2, Download, LucideArchiveRestore } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
//import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTimeShifts } from "@/app/api/shifts/shifts";
import exportMonthlyReportPDF from "@/app/components/ExportPDF";
import AbsentTab from "@/app/components/AbsentTab";
import AttendanceTab from "@/app/components/AttendanceTab";
import AddExtraHoursModal from "@/app/components/AddExtraHoursModal";
import AnnualLeaveCard from "@/app/components/AnnualLeaveCard";
import HourlyLeavesTab from "@/app/components/TabHourlyLeaves";
import moment from "moment";
import NonAttendanceTab from "@/app/components/nonAttendanceDays";
import { fetchInstitution } from "@/app/api/institutions/institutions";
import OccasionCard from "@/app/components/OccasionCard";
import { Holiday, Employee } from "@/app/types/Employee";
import { EmployeeCard } from "@/app/components/employeeCard"; 

type Leave = {
  id: string;
  startDate: string;
  endDate: string;
  type: "Paid" | "Unpaid";
  status: string;
  reason: string;
  durationInDays: number;
};

type MonthlySummary = {
  month: string;
  totalAttendance: number;
  absences: number;
  tardies: number;
};

type Comp = {
  name: string;
  attendance: number;
  absences: number;
  tardies: number;
};

// type Holiday = {
//   id: number;
//   name: string;
//   startDate: string;
//   endDate: string;
//   description?: string;
//   institutionId: number;
// };
type ShiftType = {
  mode: 'standard' | 'advanced';
  startTime: string; // e.g., "08:00:00"
  endTime: string;   // e.g., "16:00:00"
  days: string[];    // ['Monday', ...]
  overrides?: Record<string, { start: string; end: string }>; // Advanced
};

interface MonthlyAttendanceResponse {
  employeeId: string;
  monthlyAttendance: Record<string, { totalAttendance: number; absences: number; tardies: number }>;
}

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

const EmployeeDetails = () => {
  const [data, setData] = useState({
    totalHours: null as number | null,
    lateHours: null as number | null,
    earlyLeaveHours: null as number | null,
    earlyArrivalHours: null as number | null,
    extraAttendanceHours: null as number | null,
    addedHours: null as number | null,
    startTime: "",
    endTime: "",
    monthlySummary: [] as MonthlySummary[],
    comparisonData: [] as Comp[],
    paidLeaves: null as number | null,
    unpaidLeaves: null as number | null,
    leaves: [] as Leave[],
    employee: {} as Employee,
    holidays: [] as Holiday[],
    worksDays: [],
    shift: null as ShiftType | null,
    
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  //const [institutionKey, setInstitutionKey] = useState<string>("");
  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId as string;

  const fetchAllData = useCallback(async (month: Date) => {
    setIsLoading(true);
    try {
      if (!slug) {
        toast.error("Missing institution slug");
        return; // رح يمرّ على finally ويطفي اللودينغ
      }
      // Fetch shifts once outside Promise.all
      const insRes = await fetchInstitution(slug as string);
      if (!insRes.ok) {
        toast.error(insRes.data?.message ?? `Failed to load institution (HTTP ${insRes.status})`);
        // setInstitutionKey("");       // صفّر المفتاح حتى ما تمرّره للتبويبات
        return;                        // finally رح يشتغل ويطفي اللودينغ
      }
      
      // setInstitutionKey(insRes.data.uniqueKey);
      
      const shiftsResRaw = await fetchTimeShifts(employeeId);
      console.log("shiftsResRaw:", shiftsResRaw);
      const shifts = Array.isArray(shiftsResRaw) ? shiftsResRaw[0] : shiftsResRaw;      
      const formattedMonth = moment(month).format('YYYY-MM-01');
      // console.log("test fomat selscted month",format(month, "yyyy"),format(month, "MM") )
      // if (!shifts || (!shifts.startTime && !shifts.endTime)) {
      //   console.warn("No shift assigned for this employee");
      //   // ممكن تعرض رسالة عالشاشة: "لا يوجد شفت لهذا الموظف"
      //   return;
      // }
      // const [hoursRes, leavesRes, summaryRes, timeShiftRes, holidaysRes,empRes] = await Promise.all([
      //   fetch(`${BaseUrl}/checks/calculate-hours`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ userId: employeeId, date:formattedMonth }),
      //   }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch total hours")),
      //   fetch(`${BaseUrl}/institutions/${slug}/leaves/month?userId=${employeeId}&month=${month.getMonth()+1}`, {
      //     method: "GET",
      //     headers: { "Content-Type": "application/json" },
      //     credentials : "include",
      //     //body: JSON.stringify({ userId: employeeId, month }),
      //   }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch leaves")),
      //   fetch(`${BaseUrl}/checks/summaryLastTwoMonth/${employeeId}`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch summary")),        
      //   fetch(`${BaseUrl}/checks/timeShift`, {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({
      //       userId: employeeId,
      //       month: month.getMonth()+1,
      //       year: month.getFullYear(),
      //       shiftStart: data.startTime || shifts?.startTime,
      //       shiftEnd: data.endTime || shifts?.endTime,
      //     }),
      //   }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch time shift")),
        
      //   fetch(`${BaseUrl}/institutions/${slug}/holidays?year=${format(month, "yyyy")}&month=${format(month, "MM")}`,{credentials: "include"})
      //   .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch holidays")),
      //   fetch(`${BaseUrl}/api/users/personal?employeeId=${employeeId}`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch employee's name")),
      // ]);
      // جلب الداتا الأساسية (الي ما إلها علاقة بالشفت)
const [hoursRes, leavesRes, summaryRes, holidaysRes, empRes] = await Promise.all([
  fetch(`${BaseUrl}/checks/calculate-hours`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: employeeId, date: formattedMonth }),
  }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch total hours")),

  fetch(`${BaseUrl}/institutions/${slug}/leaves/month?userId=${employeeId}&month=${month.getMonth()+1}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials : "include",
  }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch leaves")),

  fetch(`${BaseUrl}/checks/summaryLastTwoMonth/${employeeId}`)
    .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch summary")),

  fetch(`${BaseUrl}/institutions/${slug}/holidays?year=${format(month, "yyyy")}&month=${format(month, "MM")}`, {
    credentials: "include"
  }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch holidays")),

  fetch(`${BaseUrl}/api/users/personal?employeeId=${employeeId}`)
    .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch employee's name")),
]);

// جلب الـ timeShift إذا في شفت
let timeShiftRes = null;
if (shifts && (shifts.startTime || shifts.endTime)) {
  timeShiftRes = await fetch(`${BaseUrl}/checks/timeShift`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: employeeId,
      month: month.getMonth()+1,
      year: month.getFullYear(),
      shiftStart: data.startTime || shifts?.startTime,
      shiftEnd: data.endTime || shifts?.endTime,
    }),
  }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch time shift"));
} else {
  console.warn("No shift assigned for this employee");
}

      const summary = Object.entries((summaryRes as MonthlyAttendanceResponse).monthlyAttendance).map(([month, stats]) => ({
        month,
        totalAttendance: stats.totalAttendance,
        absences: stats.absences,
        tardies: stats.tardies,
      }));
  
      setData({
        totalHours: hoursRes.totalHours,
        lateHours: timeShiftRes.lateHours,
        earlyLeaveHours: timeShiftRes.earlyLeaveHours,
        earlyArrivalHours: timeShiftRes.earlyArrivalHours,
        extraAttendanceHours: timeShiftRes.extraAttendanceHours,
        addedHours: timeShiftRes.extraAdjusmentHours,
        startTime: shifts?.startTime || "",
        endTime: shifts?.endTime || "",
        worksDays: shiftsResRaw.days || [],
        monthlySummary: summary,
        comparisonData: summary.map(s => ({ name: s.month, attendance: s.totalAttendance, absences: s.absences, tardies: s.tardies })),
        paidLeaves: leavesRes.leaveDays?.totalPaidLeaveDays || 0,
        unpaidLeaves: leavesRes.leaveDays?.totalUnpaidLeaveDays || 0,
        leaves: leavesRes.leaves?.leaves || [],
        holidays: holidaysRes || [],
        employee: empRes  || {} as Employee,
        shift: shifts ? {
          mode: shifts.mode || "standard",
          startTime: shifts.startTime || "",
          endTime: shifts.endTime || "",
          days: shifts.days || [],
          overrides: shifts.overrides || {}
        } : null
      });
      console.log("data in effect see if it works",data.shift);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(`Failed to load data: ${error}`);
    } finally {
      setIsLoading(false);
      
    }
  }, [employeeId]);
  const exportMonthlyReport = useCallback(async () => {
    setIsLoadingPdf(true);
    try {
        if (!selectedMonth || isNaN(new Date(selectedMonth).getTime())) {
            throw new Error("Invalid date provided");
        }
        const normalizedDate = new Date(selectedMonth);
        const year = normalizedDate.getFullYear();
        const month = String(normalizedDate.getMonth() + 1).padStart(2, "0");
        const dateToSend = `${year}-${month}`;
        const response = await fetch(`${BaseUrl}/checks/summary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId, date: dateToSend, dateString: selectedMonth }),
        });
        if (!response.ok) throw new Error("Failed to fetch report");
        const data = await response.json(); // Log number of days
        setData(prev => ({ ...prev, employeeName: data.summary.employeeName }));
        exportMonthlyReportPDF(data);
        toast.info("Monthly report exported as PDF!");
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.warning(errorMessage);
    } finally {
        setIsLoadingPdf(false);
    }
}, [employeeId, selectedMonth]);

  useEffect(() => {
    // fetchData();
    console.log("in effect",selectedMonth, format(selectedMonth, "yyyy"), format(selectedMonth, "MM"));
    fetchAllData(selectedMonth);


  }, [fetchAllData, selectedMonth]);

  const filteredLeaves = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return data.leaves.filter(leave =>
      format(new Date(leave.startDate), "MMMM d, yyyy").toLowerCase().includes(lowerSearch) ||
      leave.reason.toLowerCase().includes(lowerSearch)
    );
  }, [data.leaves, searchTerm]);
  // Function to format the month display
  const getMonthDisplay = (date: Date) => {
    const now = new Date();
    const isCurrentMonth = 
      date.getMonth() === now.getMonth() && 
      date.getFullYear() === now.getFullYear();
    
    return isCurrentMonth 
      ? "This month" 
      : date.toLocaleString('default', { month: 'long' });
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
// هون شرط إذا ما في shift

  return (
    <div className="container px-4 space-y-4">
      <ToastContainer />
      <Tabs defaultValue={data.employee?.status === "active" ? "attendance" : "general"}>
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="general">General Info</TabsTrigger>
        </TabsList>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
  <div className="flex justify-between items-center mb-4">
    {data.employee?.status === "terminated" ? (
      <div className="flex justify-center items-center w-full">
        <p className="text-muted-foreground">
          This employee has been terminated. No attendance records available.
        </p>
      </div>
    ) : !data.shift ? (
      <div className="flex justify-center items-center w-full">
        <p className="text-muted-foreground">
          This employee has resigned or is not assigned to any shift. No active shift available.
        </p>
      </div>
    ) : (
      <>
        <h1 className="hidden md:block lg:hidden xl:block text-xl md:text-2xl font-bold">
          {data.employee.name || "Employee"}'s Attendance Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Button
            className="bg-cyan-900 text-white"
            onClick={() => setIsModalOpen(true)}
          >
            Add Extra Hours
          </Button>
          <AddExtraHoursModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            employeeId={employeeId}
            monthIndex={selectedMonth}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {format(selectedMonth, "MMMM yyyy")}
                <CalendarIcon className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 font-bold" align="end">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={exportMonthlyReport}
            className="bg-cyan-900 text-white"
          >
            {isLoadingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isLoadingPdf ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </>
    )}
  </div>

  {/* باقي محتوى التاب (الكروت والجداول...) بتحطو هون بس بشرط انه يظهر فقط لما في shift */}
  {data.employee?.status === "active" && data.shift && (
    <>
      {/* Cards + AnnualLeaveCard + OccasionCard + Comparison + Summary + Tabs الداخلية */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(data.totalHours || 0) + (data.addedHours || 0)} <span className="text-base font-medium">hours</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late Hours</CardTitle>
                  <Turtle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.lateHours || 0} <span className="text-base font-medium">hours</span></div>
                  <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Early Leaves</CardTitle>
                  <Rabbit className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.earlyLeaveHours || 0} <span className="text-base font-medium">hours</span></div>
                  <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Early Arrivals</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.earlyArrivalHours || 0} <span className="text-base font-medium">hours</span></div>
                  <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Extra Hours</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.extraAttendanceHours || 0}
                    {data.addedHours ? <> + <span className="text-cyan-800">{data.addedHours}</span></> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
                  <LucideArchiveRestore className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between">
                    <div className="flex flex-col items-start">
                      <div className="text-lg font-bold">{data.paidLeaves || 0}</div>
                      <p className="text-xs text-muted-foreground">Paid Leave</p>
                    </div>
                    <div className="px-2 text-muted-foreground">|</div>
                    <div className="flex flex-col items-start">
                      <div className="text-lg font-bold">{data.unpaidLeaves || 0}</div>
                      <p className="text-xs text-muted-foreground">Unpaid Leave</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <AnnualLeaveCard employeeId={employeeId} />
            {data.shift ? (
          <OccasionCard holidays={data.holidays} shiftType={data.shift} />
            ) : (
              <Card>
                <CardContent>
                  <p className="text-muted-foreground">
                    This employee has resigned. No active shift assigned.
                  </p>
                </CardContent>
              </Card>
            )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.comparisonData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="attendance" fill="#8884d8" />
                      <Bar dataKey="absences" fill="#82ca9d" />
                      <Bar dataKey="tardies" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Monthly Summary</CardTitle>
                </CardHeader>

                <CardContent>

                  {/* موبايل: بطاقات بدل جدول */}
                  <div className="sm:hidden space-y-3">
                    {data.monthlySummary.map((row) => (
                      <div key={row.month} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{row.month}</div>
                        </div>
                        <dl className="mt-2 grid grid-cols-3 gap-3 text-sm">
                          <div>
                            <dt className="text-muted-foreground">Attendance</dt>
                            <dd className="font-medium tabular-nums">{row.totalAttendance}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Absences</dt>
                            <dd className="font-medium tabular-nums">{row.absences}</dd>
                          </div>
                          <div>
                            <dt className="text-muted-foreground">Tardies</dt>
                            <dd className="font-medium tabular-nums">{row.tardies}</dd>
                          </div>
                        </dl>
                      </div>
                    ))}
                  </div>

                  {/* تابلِت/ديسكتوب: جدول بلا سكرول */}
                  <div className="hidden sm:block">
                    <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                      {/* نسب الأعمدة حتى يضل الجدول ضمن الكارد */}
                      <colgroup>
                        <col className="w-[40%]" />
                        <col className="w-[20%]" />
                        <col className="w-[20%]" />
                        <col className="w-[20%]" />
                      </colgroup>

                      <thead className="bg-muted/50">
                        <tr className="text-muted-foreground">
                          <th className="px-3 py-2 text-left font-medium">Month</th>
                          <th className="px-3 py-2 text-right font-medium">Attendance</th>
                          <th className="px-3 py-2 text-right font-medium">Absences</th>
                          <th className="px-3 py-2 text-right font-medium">Tardies</th>
                        </tr>
                      </thead>

                      <tbody className="[&_tr:last-child]:border-0">
                        {data.monthlySummary.map((row) => (
                          <tr key={row.month} className="border-b">
                            <td className="px-3 py-2 whitespace-nowrap">{row.month}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{row.totalAttendance}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{row.absences}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{row.tardies}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>


            </div>
            <section className="mx-auto max-w-6xl px-4 sm:px-6 min-w-0 min-h-0 overflow-x-hidden">
            <Tabs defaultValue="attendance" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <TabsList>
                <TabsTrigger value="attendance" >Attendance Records</TabsTrigger>
                <TabsTrigger value="leave">Leave Requests</TabsTrigger>
                <TabsTrigger value="absent">Absences</TabsTrigger>
                <TabsTrigger value="hourlyLeaves">Hourly Leaves</TabsTrigger>
                <TabsTrigger value="dayRecords">Day Records</TabsTrigger>
              </TabsList>
              </div>
              <TabsContent value="attendance" className="space-y-4 min-h-0">
                <AttendanceTab employeeId={employeeId} selectedMonth={selectedMonth} />
              </TabsContent>
              <TabsContent value="leave" className="space-y-4 min-h-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Leave Requests</h2>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search records"
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Card>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
                      {/* Paid */}
                      <section>
                        <h3 className="text-lg font-bold mb-2">Paid Leaves</h3>
                        {filteredLeaves.filter(r => r.type === "Paid").length ? (
                          filteredLeaves.filter(r => r.type === "Paid").map((record) => (
                            <div
                              key={record.id}
                              className="flex justify-between items-center py-2 border-b last:border-b-0 hover:bg-accent cursor-pointer"
                            >
                              <div>
                                <p className="font-medium">{format(new Date(record.startDate), "MMMM d, yyyy")}</p>
                                <p className="text-sm text-muted-foreground">
                                  Start: {format(new Date(record.startDate), "yyyy MM dd")}, End: {format(new Date(record.endDate), "yyyy MM dd")}
                                </p>
                                <p>For: {record.reason}</p>
                              </div>
                              <p>No. of days: {record.durationInDays}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No paid leave records available.</p>
                        )}
                      </section>

                      {/* Unpaid */}
                      <section>
                        <h3 className="text-lg font-medium mb-2">Unpaid Leaves</h3>
                        {filteredLeaves.filter(r => r.type === "Unpaid").length ? (
                          filteredLeaves.filter(r => r.type === "Unpaid").map((record) => (
                            <div
                              key={record.id}
                              className="flex justify-between items-center py-2 border-b last:border-b-0 hover:bg-accent cursor-pointer"
                            >
                              <div>
                                <p className="font-medium">{format(new Date(record.startDate), "MMMM d, yyyy")}</p>
                                <p className="text-sm text-muted-foreground">
                                  Start: {format(new Date(record.startDate), "yyyy MM dd")}, End: {format(new Date(record.endDate), "yyyy MM dd")}
                                </p>
                                <p>For: {record.reason}</p>
                              </div>
                              <p>No. of days: {record.durationInDays}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No unpaid leave records available.</p>
                        )}
                      </section>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="absent" className="space-y-4 min-h-0">
                <AbsentTab employeeId={employeeId} selectedMonth={selectedMonth} />
              </TabsContent>
              <TabsContent value="hourlyLeaves" className="space-y-4 min-h-0">
                <HourlyLeavesTab employeeId={employeeId} selectedMonth={selectedMonth} />
              </TabsContent>
              <TabsContent value="dayRecords" className="space-y-4 min-h-0">
                <NonAttendanceTab employeeId={employeeId} selectedMonth={selectedMonth} slug={slug!} holidays={data.holidays}  />
              </TabsContent>
            </Tabs>
            </section>
    </>
  )}
</TabsContent>



        {/* General Info Tab */}
        <TabsContent value="general">

        <div className="container mx-auto max-w-6xl">
          {/* <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Employee Information</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Modern employee management interface
            </p>
          </div> */}

          <EmployeeCard employee={data.employee} slug={slug!} />
        </div>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default EmployeeDetails;