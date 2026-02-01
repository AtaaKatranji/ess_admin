"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CalendarIcon, ClockIcon, Star, Rabbit, Turtle, Loader2, Download, LucideArchiveRestore, ChevronDown } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Input } from "@/components/ui/input";
//import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchTimeShifts } from "@/app/api/shifts/shifts";
import exportMonthlyReportPDF from "@/app/components/ExportPDF";
import exportMonthlyReportPDF_AR from "@/app/components/ExportPDF-ar";
// import AbsentTab from "@/app/components/AbsentTab";
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
import { AnnualLeaveProvider } from "@/app/context/AnnualLeaveContext";
import AttendanceAdjustmentsTab from "@/app/components/AttendanceAdjustmentsTab";
import { useI18n } from "@/app/context/I18nContext";

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

type Adjustment = {
  id: number;
  logDate: string;
  oldCheckIn: string | null;
  oldCheckOut: string | null;
  newCheckIn: string | null;
  newCheckOut: string | null;
  editedByName: string;
  editedAt: string;
  note: string;
};

type ShiftType = {
  name: string;
  mode: 'standard' | 'advanced';
  startTime: string; // e.g., "08:00:00"
  endTime: string;   // e.g., "16:00:00"
  days: string[];    // ['Monday', ...]
  overrides?: Record<string, { start: string; end: string }>; // Advanced
};
type MeContext = {
  id: number;
  name: string;
  globalRole: "superAdmin" | "regular";
  activeInstitution: {
    id: number;
    slug: string;
    role: { id: number; name: string } | null;
    permissions: string[];
  };
};
type Break = {
  id: number
  userId: number
  breakTypeId: number | null
  startTime: string
  endTime: string | null
  duration: number
  durationTaken: number | null
  isCustomBreak: boolean
  customBreakName: string | null
  status: "Pending" | "Approved" | "Rejected" | ""
  addedByAdmin: boolean
  approvedBy: number | null
  createdAt: string
  updatedAt: string
  user?: { id: number; name: string }
  breakType?: { id: number; name: string } | null
}

type EmployeeBreakBlock = {
  breaks: Break[]
  totalDuration: number
}

type EmployeeBreaksApi = {
  data: {
    custom: EmployeeBreakBlock
    regular: EmployeeBreakBlock
  }
}


interface MonthlyAttendanceResponse {
  employeeId: string;
  monthlyAttendance: Record<string, { totalAttendance: number; absences: number; tardies: number }>;
}

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

const EmployeeDetails = () => {
  const { t, lang, dir } = useI18n();
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
  const [me, setMe] = useState<MeContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingMe, setIsLoadingMe] = useState(true);
  // const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  //const [institutionKey, setInstitutionKey] = useState<string>("");
  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId as string;
  //const isSuperAdmin = me?.globalRole === "superAdmin";

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
      let shifts = [];
      if (!shiftsResRaw) {
        console.log("No shift assigned for this employee");
        // اعرض رسالة بالـ UI أو اعطي default values
      } else {

        shifts = Array.isArray(shiftsResRaw) ? shiftsResRaw[0] : shiftsResRaw;
        // const startTime = shiftsResRaw?.startTime ? shiftsResRaw.startTime.split(":") : [];
        // const endTime   = shiftsResRaw?.endTime   ? shiftsResRaw.endTime.split(":")   : [];
        // باقي حساباتك…
      }

      const formattedMonth = moment(month).format('YYYY-MM-01');

      const [hoursRes, leavesRes, summaryRes, holidaysRes, empRes] = await Promise.all([
        fetch(`${BaseUrl}/checks/calculate-hours`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: employeeId, date: formattedMonth }),
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch total hours")),

        fetch(`${BaseUrl}/institutions/${slug}/leaves/month?userId=${employeeId}&month=${month.getMonth() + 1}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch leaves")),

        fetch(`${BaseUrl}/checks/summaryLastTwoMonth/${employeeId}`)
          .then(res => {
            if (res.status === 404) {
              // ما في بيانات لهالموظف
              return {};
            }
            return res.ok ? res.json() : Promise.reject("Failed to fetch summary");
          }),

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
            month: month.getMonth() + 1,
            year: month.getFullYear(),
            shiftStart: data.startTime || shifts?.startTime,
            shiftEnd: data.endTime || shifts?.endTime,
          }),
        }).then(res => {
          if (res.status === 404) {
            console.warn("No summary data found for this employee");
            return [];
          }
          return res.ok ? res.json() : Promise.reject("Failed to fetch time shift")
        });
      } else {
        console.warn("No shift assigned for this employee");
      }

      const summary = Object.entries((summaryRes as MonthlyAttendanceResponse).monthlyAttendance).map(([month, stats]) => ({
        month,
        totalAttendance: stats.totalAttendance,
        absences: stats.absences,
        tardies: stats.tardies,
      }));

      const shiftName = shifts?.name || empRes?.shift?.name || "Unassigned";

      // 🔹 شكّل نسخة جديدة من الموظف مع shiftName مضافة
      const employee: Employee = {
        ...empRes,
        shiftName, // ✅ ضفنا اسم الشفت
      };

      setData({
        totalHours: hoursRes.totalHours,
        lateHours: timeShiftRes?.lateHours ?? 0,
        earlyLeaveHours: timeShiftRes?.earlyLeaveHours ?? 0,
        earlyArrivalHours: timeShiftRes?.earlyArrivalHours ?? 0,
        extraAttendanceHours: timeShiftRes?.extraAttendanceHours ?? 0,
        addedHours: timeShiftRes?.extraAdjusmentHours ?? 0,
        startTime: shifts?.startTime || "",
        endTime: shifts?.endTime || "",
        worksDays: shiftsResRaw?.days || [],
        monthlySummary: summary,
        comparisonData: summary.map(s => ({
          name: s.month,
          attendance: s.totalAttendance,
          absences: s.absences,
          tardies: s.tardies
        })),
        paidLeaves: leavesRes.leaveDays?.totalPaidLeaveDays || 0,
        unpaidLeaves: leavesRes.leaveDays?.totalUnpaidLeaveDays || 0,
        leaves: leavesRes.leaves?.leaves || [],
        holidays: holidaysRes || [],
        employee,
        shift: shifts ? {
          name: shifts.name || "",
          mode: shifts.mode || "standard",
          startTime: shifts.startTime || "",
          endTime: shifts.endTime || "",
          days: shifts.days || [],
          overrides: shifts.overrides || {}
        } : null
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(`Failed to load data: ${error}`);
    } finally {
      setIsLoading(false);

    }
  }, [employeeId, slug, BaseUrl, data.startTime, data.endTime]);
  type ReportLang = "en" | "ar"
  const can = useCallback((permission: string) =>
    me?.activeInstitution?.permissions?.includes("*") ||
    me?.activeInstitution?.permissions?.includes(permission) ||
    false, [me]);

  const exportMonthlyReport = useCallback(async (lang: ReportLang) => {
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
      let adjustmentsData: Adjustment[] = [];
      let breaksData: EmployeeBreaksApi["data"] | null = null

      if (can("edit_logs.report_read")) {
        const adjustmentsResponse = await fetch(`${BaseUrl}/institutions/${slug}/checks/edit-logs?userId=${employeeId}&month=${dateToSend}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });




        if (adjustmentsResponse.ok) {
          adjustmentsData = await adjustmentsResponse.json();


        } else if (adjustmentsResponse.status !== 403) {
          // 403 طبيعي إذا ما عنده صلاحية (لكن نحن أصلاً شرطنا فوق)
          throw new Error("Failed to fetch adjustments");
        }
      }
      const breaksResponse = await fetch(
        `${BaseUrl}/break/employee-breaks/AllEmployeeBreaksByUserId`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: employeeId, month: dateToSend }),
        }
      )
      const breaksJson: EmployeeBreaksApi = await breaksResponse.json()


      // 4) الآن breaksData فيها { custom, regular }
      breaksData = breaksJson.data



      if (lang === "ar") {
        await exportMonthlyReportPDF_AR(data, adjustmentsData, breaksData)
      } else {
        await exportMonthlyReportPDF(data, adjustmentsData, breaksData)
      }

      toast.info("Monthly report exported as PDF!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.warning(errorMessage);
    } finally {
      setIsLoadingPdf(false);
    }
  }, [employeeId, selectedMonth, slug, BaseUrl, can, me]);

  useEffect(() => {
    // fetchData();

    fetchAllData(selectedMonth);
    const loadMeContext = async () => {
      setIsLoadingMe(true);
      try {
        const res = await fetch(`${BaseUrl}/institutions/${slug}/me-context`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          // 403 يعني ما عنده صلاحية للمؤسسة (regular)
          // 401 يعني غير مسجل دخول
          console.error("Failed to load me-context", res.status);
          setMe(null);
          return;
        }

        const data: MeContext = await res.json();
        setMe(data);
      } catch (e) {
        console.error("Error loading me-context", e);
        setMe(null);
      } finally {
        setIsLoadingMe(false);
      }
    };

    if (slug) loadMeContext();
  }, [fetchAllData, selectedMonth, slug, BaseUrl]);
  const canViewAdjustmentsUI = can("edit_logs.read");         // UI
  // Function to format the month display
  const getMonthDisplay = (date: Date) => {
    const now = new Date();
    const isCurrentMonth =
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    return isCurrentMonth
      ? t("attendance.thisMonth")
      : date.toLocaleString(lang === "ar" ? "ar-EG" : "default", { month: 'long' });
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
    <AnnualLeaveProvider employeeId={employeeId}>
      <div className="container px-4 space-y-4" dir={dir}>
        <ToastContainer />
        <Tabs defaultValue={data.employee?.status === "active" ? "attendance" : "general"} dir={dir}>
          <TabsList>
            {data.employee?.status === "active" && (
              <TabsTrigger value="attendance">
                {t("employee.tabs.attendance")}
              </TabsTrigger>
            )}
            <TabsTrigger value="general">
              {t("employee.tabs.general")}
            </TabsTrigger>
          </TabsList>

          {/* Attendance Tab */}
          {data.employee?.status === "active" && (
            <TabsContent value="attendance">

              <div className="flex justify-between items-center mb-4 gap-4">
                <h1 className="hidden md:block lg:hidden xl:block text-xl md:text-2xl font-bold">
                  {data.employee.name || "Employee"}
                </h1>
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-cyan-900 text-white"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {t("employee.addExtraHours")}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="bg-cyan-900 text-white" disabled={isLoadingPdf || isLoadingMe || !me}>
                        {isLoadingPdf ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        {isLoadingPdf ? t("employee.exporting") : t("employee.exportReport")}
                        <ChevronDown className="ml-2 h-4 w-4 opacity-80" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled={isLoadingPdf || isLoadingMe || !me} onClick={() => exportMonthlyReport("en")}>
                        English (EN)
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={isLoadingPdf || isLoadingMe || !me} onClick={() => exportMonthlyReport("ar")}>
                        العربية (AR)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {/* باقي محتوى التاب (الكروت والجداول...) بتحطو هون بس بشرط انه يظهر فقط لما في shift */}
              {data.employee?.status === "active" && data.shift && (
                <>
                  {/* Cards + AnnualLeaveCard + OccasionCard + Comparison + Summary + Tabs الداخلية */}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
                    <Card className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("employee.stats.totalHours")}</CardTitle>
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(data.totalHours || 0) + (data.addedHours || 0)} <span className="text-base font-medium">{t("common.hours")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("employee.stats.lateHours")}</CardTitle>
                        <Turtle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{data.lateHours || 0} <span className="text-base font-medium">{t("common.hours")}</span></div>
                        <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("employee.stats.earlyLeaves")}</CardTitle>
                        <Rabbit className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{data.earlyLeaveHours || 0} <span className="text-base font-medium">{t("common.hours")}</span></div>
                        <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("employee.stats.earlyArrivals")}</CardTitle>
                        <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{data.earlyArrivalHours || 0} <span className="text-base font-medium">{t("common.hours")}</span></div>
                        <p className="text-xs text-muted-foreground">{getMonthDisplay(selectedMonth)}</p>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t("employee.stats.extraHours")}</CardTitle>
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
                    <Card className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">{t("employee.stats.leaveDays")}</CardTitle>
                        <LucideArchiveRestore className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between">
                          <div className="flex flex-col items-start">
                            <div className="text-lg font-bold">{data.paidLeaves || 0}</div>
                            <p className="text-xs text-muted-foreground">{t("employee.stats.paidLeave")}</p>
                          </div>
                          <div className="px-2 text-muted-foreground">|</div>
                          <div className="flex flex-col items-start">
                            <div className="text-lg font-bold">{data.unpaidLeaves || 0}</div>
                            <p className="text-xs text-muted-foreground">{t("employee.stats.unpaidLeave")}</p>
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
                      <Card className="overflow-hidden">
                        <CardContent>
                          <p className="text-muted-foreground">
                            {t("employee.resigned")}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Card className="overflow-hidden">
                      <CardHeader>
                        <CardTitle>{t("employee.comparison.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data.comparisonData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="attendance" fill="#8884d8" name={t("employee.comparison.attendance")} />
                            <Bar dataKey="absences" fill="#82ca9d" name={t("employee.comparison.absences")} />
                            <Bar dataKey="tardies" fill="#ffc658" name={t("employee.comparison.tardies")} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t("employee.summary.title")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* موبايل: بطاقات بدل جدول */}
                        <div className="sm:hidden space-y-3">
                          {data.monthlySummary.map((row) => (
                            <div key={row.month} className="rounded-lg border p-3">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{row.month}</div>
                              </div>
                              <dl className="mt-2 grid grid-cols-3 gap-3 text-sm text-center">
                                <div>
                                  <dt className="text-muted-foreground">{t("common.attendance")}</dt>
                                  <dd className="font-medium tabular-nums">{row.totalAttendance}</dd>
                                </div>
                                <div>
                                  <dt className="text-muted-foreground">{t("common.absences")}</dt>
                                  <dd className="font-medium tabular-nums">{row.absences}</dd>
                                </div>
                                <div>
                                  <dt className="text-muted-foreground">{t("common.tardies")}</dt>
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
                                <th className="px-3 py-2 text-start font-medium">{t("common.month")}</th>
                                <th className="px-3 py-2 text-end font-medium">{t("common.attendance")}</th>
                                <th className="px-3 py-2 text-end font-medium">{t("common.absences")}</th>
                                <th className="px-3 py-2 text-end font-medium">{t("common.tardies")}</th>
                              </tr>
                            </thead>

                            <tbody className="[&_tr:last-child]:border-0">
                              {data.monthlySummary.map((row) => (
                                <tr key={row.month} className="border-b">
                                  <td className="px-3 py-2 whitespace-nowrap text-start">{row.month}</td>
                                  <td className="px-3 py-2 text-end tabular-nums">{row.totalAttendance}</td>
                                  <td className="px-3 py-2 text-end tabular-nums">{row.absences}</td>
                                  <td className="px-3 py-2 text-end tabular-nums">{row.tardies}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>


                  </div>
                  <section className="mx-auto max-w-6xl min-w-0">
                    <Tabs defaultValue="attendance" className="space-y-6 w-full" dir={dir}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <TabsList>
                          <TabsTrigger value="attendance" >{t("employee.tabs.inner.attendance")}</TabsTrigger>
                          {/* <TabsTrigger value="leave">Leave Requests</TabsTrigger>
                <TabsTrigger value="absent">Absences</TabsTrigger> */}
                          <TabsTrigger value="hourlyLeaves">{t("employee.tabs.inner.hourlyLeaves")}</TabsTrigger>
                          <TabsTrigger value="dayRecords">{t("employee.tabs.inner.dayRecords")}</TabsTrigger>
                          {canViewAdjustmentsUI && (
                            <TabsTrigger value="adjustments">{t("employee.tabs.inner.adjustments")}</TabsTrigger>
                          )}
                        </TabsList>
                      </div>

                      <TabsContent value="attendance" className="space-y-4">
                        <AttendanceTab employeeId={employeeId} selectedMonth={selectedMonth} ourSlug={slug!} />
                      </TabsContent>
                      <TabsContent value="hourlyLeaves" className="space-y-4">
                        <HourlyLeavesTab employeeId={employeeId} selectedMonth={selectedMonth} />
                      </TabsContent>
                      <TabsContent value="dayRecords" className="space-y-4">
                        <NonAttendanceTab employeeId={employeeId} selectedMonth={selectedMonth} slug={slug!} holidays={data.holidays} />
                      </TabsContent>
                      {canViewAdjustmentsUI && (
                        <TabsContent value="adjustments">
                          <AttendanceAdjustmentsTab
                            employeeId={employeeId}
                            selectedMonth={selectedMonth}
                            slug={slug!}
                          />
                        </TabsContent>
                      )}
                    </Tabs>
                  </section>
                </>
              )}
            </TabsContent>
          )}


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
    </AnnualLeaveProvider>
  );
};

export default EmployeeDetails;