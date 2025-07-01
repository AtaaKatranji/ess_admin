"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, FileDown, TrendingUp, ArrowLeft, FileText } from "lucide-react"
import exportShiftReportPDF from "@/app/components/ShiftReportPDF"
import * as shiftAPI from '@/app/api/shifts/shifts'
import { ShiftReportType, ShiftTimes } from '@/app/types/Shift'

// Sample data - replace with your actual data source
// const sampleShiftData = {
//   shiftId: "SHIFT_001",
//   shiftName: "Morning Shift",
//   shiftTime: "08:00 - 16:00",
//   department: "Operations",
//   supervisor: "Sarah Johnson",
//   month: "June 2025",
//   summary: {
//     totalEmployees: 12,
//     activeEmployees: 10,
//     averageAttendanceRate: 85.5,
//     totalShiftHours: 1920, // 8 hours * 12 employees * 20 working days
//     actualWorkedHours: 1641.6,
//     totalLateHours: 45.2,
//     totalEarlyLeaveHours: 12.8,
//     totalOvertimeHours: 28.5,
//     totalAbsentDays: 18,
//     totalHolidayDays: 48, // 4 holidays * 12 employees
//     averageDailyAttendance: 10.2,
//   },
//   employees: [
//     {
//       id: 1,
//       name: "Ataa Katranji",
//       position: "Senior Operator",
//       totalHours: 126.03,
//       attendanceDays: 18,
//       absentDays: 5,
//       holidayDays: 4,
//       lateHours: 8.58,
//       earlyLeaveHours: 0.37,
//       overtimeHours: 0.95,
//       attendanceRate: 78.3,
//     },
//     {
//       id: 2,
//       name: "Ahmed Hassan",
//       position: "Operator",
//       totalHours: 142.5,
//       attendanceDays: 20,
//       absentDays: 2,
//       holidayDays: 4,
//       lateHours: 3.2,
//       earlyLeaveHours: 1.1,
//       overtimeHours: 6.5,
//       attendanceRate: 90.9,
//     },
//     {
//       id: 3,
//       name: "Fatima Al-Zahra",
//       position: "Quality Inspector",
//       totalHours: 138.75,
//       attendanceDays: 19,
//       absentDays: 3,
//       holidayDays: 4,
//       lateHours: 2.8,
//       earlyLeaveHours: 0.5,
//       overtimeHours: 4.75,
//       attendanceRate: 86.4,
//     },
//     {
//       id: 4,
//       name: "Omar Khalil",
//       position: "Technician",
//       totalHours: 134.2,
//       attendanceDays: 19,
//       absentDays: 3,
//       holidayDays: 4,
//       lateHours: 5.1,
//       earlyLeaveHours: 2.3,
//       overtimeHours: 2.2,
//       attendanceRate: 86.4,
//     },
//     {
//       id: 5,
//       name: "Layla Mahmoud",
//       position: "Supervisor Assistant",
//       totalHours: 145.8,
//       attendanceDays: 21,
//       absentDays: 1,
//       holidayDays: 4,
//       lateHours: 1.5,
//       earlyLeaveHours: 0.2,
//       overtimeHours: 9.8,
//       attendanceRate: 95.5,
//     },
//   ],
// }
type ShiftReportProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    shiftId: string
    institutionKey: string

  }
export default function ShiftReport({open, onOpenChange, shiftId, institutionKey}: ShiftReportProps) {
  const [selectedMonth, setSelectedMonth] = useState("2025-06")
  const [selectedShift, setSelectedShift] = useState(shiftId)
  const [shiftData, setShiftData] = useState<ShiftReportType | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null);

  useEffect(() =>  {
    if (!selectedShift || !selectedMonth) return
    setLoading(true)
    shiftAPI.fetchShiftReport(selectedShift, selectedMonth, institutionKey)
      .then((data: ShiftReportType) => setShiftData(data))
      .catch((err) => {setShiftData(null);setError(err.message || "Failed to load data."); }) 
      .finally(() => setLoading(false))
       
  }, [selectedShift, selectedMonth, institutionKey])
  const handleExportPDF = () => {
    exportShiftReportPDF(shiftData)
  }

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600"
    if (rate >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getAttendanceRateBadge = (rate: number) => {
    if (rate >= 90) return "bg-green-100 text-green-800"
    if (rate >= 80) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }
  const getSummaryValue = (label: string) =>
    shiftData?.summaryMetrics.find(m => m.label === label)?.value ?? '';

  // function formatShiftTimes(shiftTimes: ShiftTimes) {
  //   const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  //   const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  //   // Collect { dayIdx, shortDay, time } for days with shifts
  //   const shifts = daysOrder
  //     .map((day, idx) => {
  //       const times = shiftTimes[day];
  //       if (times) {
  //         return {
  //           idx,
  //           shortDay: shortDays[idx],
  //           time: `${times.start}–${times.end}`,
  //         };
  //       }
  //       return null;
  //     })
  //     .filter(Boolean) as { idx: number, shortDay: string, time: string }[];
  
  //   // Group consecutive days with the same shift time
  //   const groups: { startIdx: number, endIdx: number, time: string }[] = [];
  //   let groupStart = 0;
  
  //   while (groupStart < shifts.length) {
  //     let groupEnd = groupStart;
  //     while (
  //       groupEnd + 1 < shifts.length &&
  //       shifts[groupEnd + 1].time === shifts[groupStart].time &&
  //       shifts[groupEnd + 1].idx === shifts[groupEnd].idx + 1
  //     ) {
  //       groupEnd++;
  //     }
  //     groups.push({
  //       startIdx: groupStart,
  //       endIdx: groupEnd,
  //       time: shifts[groupStart].time,
  //     });
  //     groupStart = groupEnd + 1;
  //   }
  
  //   // Format output
  //   return groups
  //     .map(({ startIdx, endIdx, time }) => {
  //       const startDay = shifts[startIdx].shortDay;
  //       const endDay = shifts[endIdx].shortDay;
  //       return startIdx === endIdx
  //         ? `${startDay}: ${time}`
  //         : `${startDay}–${endDay}: ${time}`;
  //     })
  //     .join(', ');
  // }
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
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        <div>
        <Button variant="ghost" onClick={() =>{ console.log("show reports out", open);onOpenChange(false)}}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shifts
        </Button>
          <h1 className="text-3xl font-bold text-gray-900">Shift Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive shift performance and attendance analytics</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-06">June 2025</SelectItem>
              <SelectItem value="2025-05">May 2025</SelectItem>
              <SelectItem value="2025-04">April 2025</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Shift" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SHIFT_001">Morning Shift</SelectItem>
              <SelectItem value="SHIFT_002">Evening Shift</SelectItem>
              <SelectItem value="SHIFT_003">Night Shift</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} className="bg-blue-600 hover:bg-blue-700">
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-40 space-y-6">
           <svg className="animate-spin h-6 w-6 text-blue-500 mr-2" viewBox="0 0 24 24">
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
              <h1 className="text-3xl font-bold text-gray-900"><span className="text-sm">Shift:</span> {shiftData?.shiftName}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {/* <span>Shift: {shiftData?.shiftName}</span> */}
                  <span>month: {shiftData?.monthName}</span>
                </div>
                <div className="flex items-center gap-1">
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
            const icons = [Calendar, Users, Clock, TrendingUp]
            const Icon = icons[index] || FileText

            return (
              <Card key={metric.label}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{metric.label}</CardTitle>
                  <Icon className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value === "NaN" ? "N/A" : metric.value}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

          {/* Shift Statistics */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Shift Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for {shiftData.monthName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Total Scheduled Hours</span>
                    <span className="font-semibold">{getSummaryValue("Total Hours Scheduled")}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Actual Worked Hours</span>
                    <span className="font-semibold text-green-600">
                    {getSummaryValue("Total Hours Worked")}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Total Late Hours</span>
                    <span className="font-semibold text-red-600">{shiftData.summary.totalLateHours}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Total Early Leave Hours</span>
                    <span className="font-semibold text-orange-600">{shiftData.summary.totalEarlyLeaveHours}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Total Overtime Hours</span>
                    <span className="font-semibold text-blue-600">{shiftData.summary.totalOvertimeHours}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Total Absent Days</span>
                    <span className="font-semibold text-red-600">{shiftData.summary.totalAbsentDays}</span>
                  </div>*/}
                </div> 
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
                <CardDescription>Monthly attendance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Active Employees</span>
                    <span className="font-semibold">
                      {shiftData.summary.activeEmployees} / {shiftData.summary.totalEmployees}
                    </span>
                  </div> */}
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Average Daily Attendance</span>
                    <span className="font-semibold">{getSummaryValue("Average Daily Attendance")}%</span>
                  </div>
                  {/* <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Total Holiday Days</span>
                    <span className="font-semibold text-blue-600">{shiftData.summary.totalHolidayDays}</span>
                  </div> */}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Shift Efficiency</span>
                    <span
                      className={`font-semibold ${getAttendanceRateColor(Number(getSummaryValue("Average Attendance Rate")))}`}
                    >
                      {(
                        (Number(getSummaryValue("Total Hours Worked")) / Number(getSummaryValue("Total Hours Scheduled"))) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Employee Details */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Employees</CardTitle>
              <CardDescription>Individual performance breakdown for all shift members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-semibold">Employee</th>
                      <th className="text-left py-3 px-2 font-semibold">Position</th>
                      <th className="text-center py-3 px-2 font-semibold">Total Hours</th>
                      <th className="text-center py-3 px-2 font-semibold">Attendance</th>
                      <th className="text-center py-3 px-2 font-semibold">Absent</th>
                      <th className="text-center py-3 px-2 font-semibold">Late Hours</th>
                      <th className="text-center py-3 px-2 font-semibold">Overtime</th>
                      <th className="text-center py-3 px-2 font-semibold">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftData.employees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="font-medium">{employee.name}</div>
                        </td>
                        <td className="py-3 px-2 text-gray-600">{employee.role}</td>
                        <td className="py-3 px-2 text-center font-medium">{employee.totalHours}</td>
                        <td className="py-3 px-2 text-center">{employee.daysAttended}</td>
                        <td className="py-3 px-2 text-center">
                          <span className={employee.daysAbsent > 3 ? "text-red-600 font-medium" : ""}>
                            {employee.daysAbsent}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={Number(employee.lateHours) > 5 ? "text-red-600 font-medium" : ""}>
                            {employee.lateHours}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center text-blue-600 font-medium">{employee.overTimeHours}</td>
                        <td className="py-3 px-2 text-center">
                          <Badge className={getAttendanceRateBadge(Number(employee.totalHours)/employee.daysAttended)}>
                            {Number(employee.totalHours)/employee.daysAttended}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
