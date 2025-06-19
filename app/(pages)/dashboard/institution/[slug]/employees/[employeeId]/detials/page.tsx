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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Holiday } from "@/app/types/Employee";

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
    employeeName: "",
    holidays: [] as Holiday[],
    
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [institutionKey, setInstitutionKey] = useState("");

  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId as string;
  const fetchData = async () => {
    const dataIns = await fetchInstitution(slug!)
    setInstitutionKey( dataIns.uniqueKey);
    console.log("InstitutionKey from data Ins", institutionKey);
    console.log("InstitutionKey dirctly", await fetchInstitution(slug!));
  };
  const fetchAllData = useCallback(async (month: Date) => {
    setIsLoading(true);
    try {
      console.log("Slug in page detiles: ", slug);
      // Fetch shifts once outside Promise.all
      console.log("Employee Id in page detiles: ", employeeId);
      const shiftsResRaw = await fetchTimeShifts(employeeId);
      const shifts = Array.isArray(shiftsResRaw) ? shiftsResRaw[0] : shiftsResRaw;
      
      const formattedMonth = moment(month).format('YYYY-MM-01');
      console.log("month", formattedMonth);
      const [hoursRes, leavesRes, summaryRes, timeShiftRes, holidaysRes] = await Promise.all([
        fetch(`${BaseUrl}/checks/calculate-hours`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: employeeId, date:formattedMonth }),
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch total hours")),
        fetch(`${BaseUrl}/leaves/month?userId=${employeeId}&month=${month.getDate()}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials : "include",
          //body: JSON.stringify({ userId: employeeId, month }),
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch leaves")),
        fetch(`${BaseUrl}/checks/summaryLastTwoMonth/${employeeId}`).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch summary")),        
        fetch(`${BaseUrl}/checks/timeShift`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: employeeId,
            month: month.getMonth()+1,
            year: month.getFullYear(),
            shiftStart: data.startTime || shifts?.startTime,
            shiftEnd: data.endTime || shifts?.endTime,
          }),
        }).then(res => res.ok ? res.json() : Promise.reject("Failed to fetch time shift")),
        fetch(`${BaseUrl}/holidays/institution/${institutionKey}`)
        .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch holidays")),
      ]);
      console.log("timeShiftRes", timeShiftRes);
      console.log("holidaysRes", holidaysRes);
      console.log("hoursRes", hoursRes);
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
        monthlySummary: summary,
        comparisonData: summary.map(s => ({ name: s.month, attendance: s.totalAttendance, absences: s.absences, tardies: s.tardies })),
        paidLeaves: leavesRes.leaveDays?.totalPaidLeaveDays || 0,
        unpaidLeaves: leavesRes.leaveDays?.totalUnpaidLeaveDays || 0,
        leaves: leavesRes.leaves?.leaves || [],
        holidays: holidaysRes || [],
        employeeName: "",
      });
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
        const dateToSend = `${year}-${month}-${normalizedDate.getDate()}`;
        console.log("selectedMonth:", selectedMonth, typeof selectedMonth);
        console.log("dateToSend:", dateToSend, typeof dateToSend);
        const response = await fetch(`${BaseUrl}/checks/summary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId, date: dateToSend, dateString: selectedMonth }),
        });
        if (!response.ok) throw new Error("Failed to fetch report");
        const data = await response.json();
        console.log('Full response:', JSON.stringify(data, null, 2)); // Log full response
        console.log('Details length:', data.details.length); // Log number of days
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
    fetchData();
    fetchAllData(selectedMonth);
    console.log("holiday test fetching: ", data.holidays);
    console.log("See Start&End Time: ", data.startTime , " ", data.endTime);
    console.log("hours per shift: ", parseInt(data.startTime!.split(":")[0]) - parseInt(data.endTime!.split(":")[0]));

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
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block lg:hidden xl:block text-xl md:text-2xl font-bold">
          {data.employeeName || "Employee"}'s Attendance Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <Button className="bg-cyan-900 text-white" onClick={() => setIsModalOpen(true)}>
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
          <Button onClick={exportMonthlyReport} className="bg-cyan-900 text-white">
            {isLoadingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {isLoadingPdf ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnnualLeaveCard employeeId={employeeId} />
      <OccasionCard holidays={data.holidays} shiftStart={data.startTime} shiftEnd={data.endTime}/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Month</th>
                    <th className="text-left">Attendance</th>
                    <th className="text-left">Absences</th>
                    <th className="text-left">Tardies</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlySummary.map((summary) => (
                    <tr key={summary.month}>
                      <td>{summary.month}</td>
                      <td>{summary.totalAttendance}</td>
                      <td>{summary.absences}</td>
                      <td>{summary.tardies}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
          <TabsTrigger value="absent">Absences</TabsTrigger>
          <TabsTrigger value="hourlyLeaves">Hourly Leaves</TabsTrigger>
          <TabsTrigger value="dayRecords">Day Records</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-4">
          <AttendanceTab employeeId={employeeId} selectedMonth={selectedMonth} />
        </TabsContent>
        <TabsContent value="leave" className="space-y-4">
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
            <div className="flex p-4 space-x-8">
              <div>
                <ScrollArea className="h-[400px]">
                  <h3 className="text-lg font-bold">Paid Leaves</h3>
                  {filteredLeaves.filter(record => record.type === "Paid").length > 0 ? (
                    filteredLeaves
                      .filter(record => record.type === "Paid")
                      .map(record => (
                        <div
                          key={record.id}
                          className="flex justify-between items-center py-2 border-b last:border-b-0 cursor-pointer hover:bg-accent"
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
                </ScrollArea>
              </div>
              <div>
                <ScrollArea className="h-[400px]">
                  <h3 className="text-lg font-medium">Unpaid Leaves</h3>
                  {filteredLeaves.filter(record => record.type === "Unpaid").length > 0 ? (
                    filteredLeaves
                      .filter(record => record.type === "Unpaid")
                      .map(record => (
                        <div
                          key={record.id}
                          className="flex justify-between items-center py-2 border-b last:border-b-0 cursor-pointer hover:bg-accent"
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
                </ScrollArea>
              </div>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="absent">
          <AbsentTab employeeId={employeeId} selectedMonth={selectedMonth} />
        </TabsContent>
        <TabsContent value="hourlyLeaves">
          <HourlyLeavesTab employeeId={employeeId} selectedMonth={selectedMonth} />
        </TabsContent>
        <TabsContent value="dayRecords">
          <NonAttendanceTab employeeId={employeeId} selectedMonth={selectedMonth} institutionKey={institutionKey} holidays={data.holidays}  />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeDetails;