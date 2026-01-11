"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, FileDown, TrendingUp, ArrowLeft, FileText, AlertCircle, LogOut, LogIn,  } from "lucide-react"
//import exportShiftReportPDF from "@/app/components/ShiftReportPDF"
import * as shiftAPI from '@/app/api/shifts/shifts'
import { Shift, ShiftReportType, ShiftTimes } from '@/app/types/Shift'
import { TableBody } from "@mui/material"
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { fetchShifts,fetchAttendanceIssues, AttendanceIssueUI } from '@/app/api/shifts/shifts'
import exportShiftMonthlyReportPDF_AR from "./ShiftReportPDFar"

type ShiftReportProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    shiftId: string
    institutionKey: string

  }
  const generateLastMonths = (count = 6) => {
    const months = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // "YYYY-MM"
      const label = date.toLocaleDateString("en-US", { year: 'numeric', month: 'long' }); // "June 2025"
      months.push({ value, label });
    }
    return months;
  };

 


  const months = generateLastMonths();
export default function ShiftReport({open, onOpenChange, shiftId, institutionKey}: ShiftReportProps) {
  console.log("months",months, open);
  const [selectedMonth, setSelectedMonth] = useState(months[0].value)
  const [selectedShift, setSelectedShift] = useState(shiftId)
  const [
    shiftData, setShiftData] = useState<ShiftReportType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendanceIssues, setAttendanceIssues] = useState<AttendanceIssueUI[]>([])
  const [issuesLoading, setIssuesLoading] = useState(false);
  const [issuesError, setIssuesError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!institutionKey) return;
    const fetchAndSetShifts = async () => {
      try {
        const data = await fetchShifts(institutionKey);
        setShifts(data);
        if (data.length > 0 && !selectedShift) {
          setSelectedShift(data[0].id); // Only set default if not set already
        }
      } catch (err) {
        console.error("Error fetching shifts:", err);
      }
    };
    fetchAndSetShifts();
  }, [institutionKey]);
  console.log("before fetch shift report page",selectedMonth);
  // 2. Fetch report when selectedMonth, selectedShift, or institutionKey changes
  useEffect(() => {
    if (!selectedShift || !selectedMonth || !institutionKey) return;
  
    setLoading(true);
    setIssuesLoading(true);
    setIssuesError(null);
  
    // تقرير المناوبة
    shiftAPI.fetchShiftReport(selectedShift, selectedMonth, institutionKey)
      .then((data: ShiftReportType) => setShiftData(data))
      .catch((err) => {
        setShiftData(null);
        console.error(err);
        setError(err.message || "Failed to load data.");
      })
      .finally(() => setLoading(false));
  
    // مشاكل الحضور
    fetchAttendanceIssues(selectedShift, selectedMonth)
      .then((data: AttendanceIssueUI[]) => {
        setAttendanceIssues(data);
      })
      .catch((err) => {
        setAttendanceIssues([]);
        console.error(err);
        setIssuesError(err.message || "Failed to load attendance issues.");
      })
      .finally(() => setIssuesLoading(false));
  
  }, [selectedShift, selectedMonth, institutionKey]);
  
  

  const handleExportPDF = () => {
    // exportShiftReportPDF(shiftData)
    exportShiftMonthlyReportPDF_AR(shiftData)
  }

  // const getAttendanceRateColor = (rate: number) => {
  //   if (rate >= 90) return "text-green-600"
  //   if (rate >= 80) return "text-yellow-600"
  //   return "text-red-600"
  // }
  const getIssueIcon = (issueType: AttendanceIssueUI["issueType"]) => {
    switch (issueType) {
      case "MISSING_CHECKOUT":
        return <LogOut className="w-4 h-4" />
      case "SHORT_DAY":
        return <Clock className="w-4 h-4" />
    }
  }

  const getIssueLabel = (issueType: AttendanceIssueUI["issueType"]) => {
    switch (issueType) {
      case "MISSING_CHECKOUT":
        return "Missing Check-out"
      case "SHORT_DAY":
        return "Short Day (<3hrs)"
    }
  }

  const getIssueBadgeColor = (issueType: AttendanceIssueUI["issueType"]) => {
    switch (issueType) {
      case "MISSING_CHECKOUT":
        return "bg-orange-100 text-orange-800"
      case "SHORT_DAY":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return "bg-green-600";
    if (rate >= 80) return "bg-yellow-500";
    return "bg-red-600";
  };

  const getStatusBadge = (attendanceRate: number) => {
    if (attendanceRate >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (attendanceRate >= 75) return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
    if (attendanceRate >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>
  }

  // const getSummaryValue = (label: string) =>
  //   shiftData?.summaryMetrics.find(m => m.label === label)?.value ?? '';

  const getAttendanceRate = (attended: number, scheduled: number) => {
    return Math.round((attended / scheduled) * 100)
  }
  function formatShiftTimes(shiftTimes: ShiftTimes) {
    const daysOrder = [
      'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 
    ];
  
    // Map time string to a list of days
    const timeGroups: { [time: string]: string[] } = {};
  
    for (const day of daysOrder) {
      const shift = shiftTimes[day];
      if (shift) {
        const time = `${shift.start}-${shift.end}`;
        if (!timeGroups[time]) timeGroups[time] = [];
        timeGroups[time].push(day+',');
      }
    }
  
    // Format each group
    return Object.entries(timeGroups)
      .map(([time, days]) => `${days.join(' ')} : ${time}`)
      .join(', ');
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}  <Button variant="ghost" className="hover:bg-gray-500" onClick={() =>{onOpenChange(false)}}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shifts
        </Button>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    
        <div>
        
          <h1 className="text-3xl font-bold text-gray-800">Shift Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive shift performance and attendance analytics</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]" aria-label="Select Month">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-[180px]" aria-label="Select Shift">
              <SelectValue placeholder="Select Shift" />
            </SelectTrigger>
            <SelectContent>
            {shifts.map((shift) => (
              <SelectItem key={shift.id} value={shift.id!}>
                {shift.name}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} className="bg-blackhover:bg-gray-100">
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-40 space-y-6">
           <svg className="animate-spin h-6 w-6 text-blue-800 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      ) : shiftData ? (
        // ...render shift report as normal here...
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900"><span className="text-sm text-gray-800">Shift:</span> {shiftData?.shiftName}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {/* <span>Shift: {shiftData?.shiftName}</span> */}
                  <span>month: {shiftData?.monthName}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-800">
                  <Badge variant="outline">{shiftData?.shiftType}</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4" />
              <span>{formatShiftTimes(shiftData!.shiftTimes)}</span>
            </div>
          </div>
        </div>
          {/* Shift Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shiftData.summaryMetrics.slice(0, 4).map((metric, index) => {
              const icons = [Calendar, Users, Clock, TrendingUp];
              const Icon = icons[index] || FileText;

              const bgColors = [
                'bg-blue-50 text-blue-800',
                'bg-green-50 text-green-800',
                'bg-yellow-50 text-yellow-800',
                'bg-purple-50 text-purple-800',
              ];

              const iconBg = bgColors[index % bgColors.length]; // fallback if more than 4

              return (
                <Card key={metric.label} className={`${iconBg} p-4`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium ">{metric.label}</CardTitle>
                    <Icon className="h-5 w-5" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metric.value === 'NaN' ? 'N/A' : metric.value}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Shift Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shiftData.summaryMetrics.slice(4).map((metric) => (
            <Card key={metric.label}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-gray-800">{metric.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        {issuesLoading && <p>Loading attendance issues...</p>}

        {!issuesLoading && attendanceIssues.length === 0 && !issuesError && (
          <p className="text-sm text-gray-600">No attendance issues found.</p>
        )}
        {attendanceIssues.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Attendance Issues
                </CardTitle>
                <CardDescription>
                  Days with missing check-out or work duration less than 3 hours requiring admin review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceIssues.map((issue, index) => (
                    <div
                      key={`${issue.employeeId}-${issue.date}-${index}`}
                      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[150px]">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{issue.employeeName}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(issue.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <Badge className={`${getIssueBadgeColor(issue.issueType)} flex items-center gap-1`}>
                          {getIssueIcon(issue.issueType)}
                          {getIssueLabel(issue.issueType)}
                        </Badge>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          {issue.checkIn && (
                            <span className="flex items-center gap-1">
                              <LogIn className="w-3 h-3" />
                              {issue.checkIn}
                            </span>
                          )}
                          {issue.checkOut && (
                            <span className="flex items-center gap-1">
                              <LogOut className="w-3 h-3" />
                              {issue.checkOut}
                            </span>
                          )}
                          {issue.workedHours !== null && (
                            <span className="font-medium text-yellow-700">{issue.workedHours}h worked</span>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="text-gray-700 hover:bg-gray-100 bg-transparent">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>

                {attendanceIssues.length > 10 && (
                  <div className="mt-4 text-center">
                    <Button variant="ghost" className="text-gray-600">
                      View All {attendanceIssues.length} Issues
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        
          {/* Employee Details */}
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Users className="w-5 h-5" />
                  Employee Attendance Details
                </CardTitle>
                <CardDescription>Detailed breakdown of employee attendance and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Attendance Rate</TableHead>
                        <TableHead>Days Attended</TableHead>
                        <TableHead>Days Absent</TableHead>
                        <TableHead>Total Hours</TableHead>
                        <TableHead>Late Hours</TableHead>
                        <TableHead>Early Leave</TableHead>
                        <TableHead>Overtime</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-gray-800">
                      {shiftData.employees.map((employee) => {
                        const attendanceRate = getAttendanceRate(employee.daysAttended, employee.daysScheduled)

                        return (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={attendanceRate} className="w-16 text-gray-800" color={getProgressColor(attendanceRate)} />
                                <span className="text-sm">{attendanceRate}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-green-600 font-medium">{employee.daysAttended}</span>
                            </TableCell>
                            <TableCell>
                              <span className={employee.daysAbsent > 0 ? "text-red-600 font-medium" : "text-gray-500"}>
                                {employee.daysAbsent}
                              </span>
                            </TableCell>
                            <TableCell>
                              {employee.totalHours === "NaN"
                                ? "N/A"
                                : `${Number.parseFloat(employee.totalHours).toFixed(1)}h`}
                            </TableCell>
                            <TableCell>
                              <span className="text-orange-600">{Number.parseFloat(employee.lateHours).toFixed(1)}h</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-orange-600">
                                {Number.parseFloat(employee.earlyLeaveHours).toFixed(1)}h
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-blue-600">{employee.overTimeHours.toFixed(1)}h</span>
                            </TableCell>
                            <TableCell>{getStatusBadge(attendanceRate)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          
        </div>
      ) : (
        
        <div className="text-center text-gray-500 py-10">
          {error && <div className="text-red-500">{error}</div>}
          No data to display</div>
      )}
      
    </div>
  )
}
