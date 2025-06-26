"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, FileDown, TrendingUp, ArrowLeft } from "lucide-react"
import exportShiftReportPDF from "@/app/components/ShiftReportPDF"

// Sample data - replace with your actual data source
const sampleShiftData = {
  shiftId: "SHIFT_001",
  shiftName: "Morning Shift",
  shiftTime: "08:00 - 16:00",
  department: "Operations",
  supervisor: "Sarah Johnson",
  month: "June 2025",
  summary: {
    totalEmployees: 12,
    activeEmployees: 10,
    averageAttendanceRate: 85.5,
    totalShiftHours: 1920, // 8 hours * 12 employees * 20 working days
    actualWorkedHours: 1641.6,
    totalLateHours: 45.2,
    totalEarlyLeaveHours: 12.8,
    totalOvertimeHours: 28.5,
    totalAbsentDays: 18,
    totalHolidayDays: 48, // 4 holidays * 12 employees
    averageDailyAttendance: 10.2,
  },
  employees: [
    {
      id: 1,
      name: "Ataa Katranji",
      position: "Senior Operator",
      totalHours: 126.03,
      attendanceDays: 18,
      absentDays: 5,
      holidayDays: 4,
      lateHours: 8.58,
      earlyLeaveHours: 0.37,
      overtimeHours: 0.95,
      attendanceRate: 78.3,
    },
    {
      id: 2,
      name: "Ahmed Hassan",
      position: "Operator",
      totalHours: 142.5,
      attendanceDays: 20,
      absentDays: 2,
      holidayDays: 4,
      lateHours: 3.2,
      earlyLeaveHours: 1.1,
      overtimeHours: 6.5,
      attendanceRate: 90.9,
    },
    {
      id: 3,
      name: "Fatima Al-Zahra",
      position: "Quality Inspector",
      totalHours: 138.75,
      attendanceDays: 19,
      absentDays: 3,
      holidayDays: 4,
      lateHours: 2.8,
      earlyLeaveHours: 0.5,
      overtimeHours: 4.75,
      attendanceRate: 86.4,
    },
    {
      id: 4,
      name: "Omar Khalil",
      position: "Technician",
      totalHours: 134.2,
      attendanceDays: 19,
      absentDays: 3,
      holidayDays: 4,
      lateHours: 5.1,
      earlyLeaveHours: 2.3,
      overtimeHours: 2.2,
      attendanceRate: 86.4,
    },
    {
      id: 5,
      name: "Layla Mahmoud",
      position: "Supervisor Assistant",
      totalHours: 145.8,
      attendanceDays: 21,
      absentDays: 1,
      holidayDays: 4,
      lateHours: 1.5,
      earlyLeaveHours: 0.2,
      overtimeHours: 9.8,
      attendanceRate: 95.5,
    },
  ],
}
type ShiftReportProps = {
    open: boolean
    onOpenChange: (open: boolean) => void

  }
export default function ShiftReport({open, onOpenChange}: ShiftReportProps) {
  const [selectedMonth, setSelectedMonth] = useState("2025-06")
  const [selectedShift, setSelectedShift] = useState("SHIFT_001")
  useEffect(() => {
    
  }, [ open])
  const handleExportPDF = () => {
    exportShiftReportPDF(sampleShiftData)
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

      {/* Shift Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{sampleShiftData.shiftName}</CardTitle>
              <CardDescription className="mt-1">
                {sampleShiftData.department} • Supervised by {sampleShiftData.supervisor}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-sm">
              <Clock className="w-3 h-3 mr-1" />
              {sampleShiftData.shiftTime}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 mx-auto text-blue-600 mb-1" />
              <div className="text-2xl font-bold text-blue-600">{sampleShiftData.summary.totalEmployees}</div>
              <div className="text-sm text-gray-600">Total Employees</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 mx-auto text-green-600 mb-1" />
              <div className="text-2xl font-bold text-green-600">{sampleShiftData.summary.averageAttendanceRate}%</div>
              <div className="text-sm text-gray-600">Avg Attendance</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Clock className="w-6 h-6 mx-auto text-purple-600 mb-1" />
              <div className="text-2xl font-bold text-purple-600">
                {sampleShiftData.summary.actualWorkedHours.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Hours Worked</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Calendar className="w-6 h-6 mx-auto text-orange-600 mb-1" />
              <div className="text-2xl font-bold text-orange-600">{sampleShiftData.summary.averageDailyAttendance}</div>
              <div className="text-sm text-gray-600">Daily Avg Present</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shift Statistics */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Shift Performance Metrics</CardTitle>
            <CardDescription>Key performance indicators for {sampleShiftData.month}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Scheduled Hours</span>
                <span className="font-semibold">{sampleShiftData.summary.totalShiftHours.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Actual Worked Hours</span>
                <span className="font-semibold text-green-600">
                  {sampleShiftData.summary.actualWorkedHours.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Late Hours</span>
                <span className="font-semibold text-red-600">{sampleShiftData.summary.totalLateHours}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Early Leave Hours</span>
                <span className="font-semibold text-orange-600">{sampleShiftData.summary.totalEarlyLeaveHours}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Overtime Hours</span>
                <span className="font-semibold text-blue-600">{sampleShiftData.summary.totalOvertimeHours}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Total Absent Days</span>
                <span className="font-semibold text-red-600">{sampleShiftData.summary.totalAbsentDays}</span>
              </div>
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
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Active Employees</span>
                <span className="font-semibold">
                  {sampleShiftData.summary.activeEmployees} / {sampleShiftData.summary.totalEmployees}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Average Daily Attendance</span>
                <span className="font-semibold">{sampleShiftData.summary.averageDailyAttendance}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Total Holiday Days</span>
                <span className="font-semibold text-blue-600">{sampleShiftData.summary.totalHolidayDays}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Shift Efficiency</span>
                <span
                  className={`font-semibold ${getAttendanceRateColor(sampleShiftData.summary.averageAttendanceRate)}`}
                >
                  {(
                    (sampleShiftData.summary.actualWorkedHours / sampleShiftData.summary.totalShiftHours) *
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
                {sampleShiftData.employees.map((employee) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <div className="font-medium">{employee.name}</div>
                    </td>
                    <td className="py-3 px-2 text-gray-600">{employee.position}</td>
                    <td className="py-3 px-2 text-center font-medium">{employee.totalHours}</td>
                    <td className="py-3 px-2 text-center">{employee.attendanceDays}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={employee.absentDays > 3 ? "text-red-600 font-medium" : ""}>
                        {employee.absentDays}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={employee.lateHours > 5 ? "text-red-600 font-medium" : ""}>
                        {employee.lateHours}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-blue-600 font-medium">{employee.overtimeHours}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge className={getAttendanceRateBadge(employee.attendanceRate)}>
                        {employee.attendanceRate}%
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
  )
}
