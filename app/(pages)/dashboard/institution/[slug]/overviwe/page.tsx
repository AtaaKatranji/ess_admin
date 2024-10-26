"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Turtle, Rabbit, Search } from "lucide-react"


const BaseURL = process.env.NEXT_PUBLIC_API_URL
interface Employee {
  id: string;
  name: string;
  position: string;
  hourlyRate: number;
  checks: Check[];
  leaves: Leave[];
  payroll?: Payroll;
}

interface Check {
  date: string;
  checkIn: string;
  checkOut: string;
}

interface Leave {
  date: string;
  type: string;
}

interface Payroll {
  totalHours: number;
  totalPay: number;
}

const statusColors: Record<string, string> = {
  present: "bg-green-500",
  absent: "bg-red-500",
  "half-day": "bg-yellow-500",
  "week-off": "bg-gray-500",
  holiday: "bg-blue-500",
  "paid-leave": "bg-green-700",
  "unpaid-leave": "bg-purple-500",
}

const StatusCircle = ({ status }: { status: string }) => (
  <div className={`w-3 h-3 rounded-full ${statusColors[status]} inline-block mr-2`}></div>
)

const CheckTime = ({ time, isLate, isEarly }: { time: string; isLate: boolean; isEarly: boolean }) => (
  <div className="flex items-center">
    {isLate && <Turtle className="w-4 h-4 mr-1 text-orange-500" />}
    {isEarly && <Rabbit className="w-4 h-4 mr-1 text-blue-500" />}
    {time}
  </div>
)

export default function AttendanceSystem() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])
  const itemsPerPage = 10
  const startDate = new Date("2024-10-24")
  const endDate = new Date("2024-10-26")
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response =  await fetch(`${BaseURL}/attendance/overView?startDate=${startDate}&endDate=${endDate}`);
        const data: Employee[] = await response.json()
        setEmployees(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const filtered = employees.filter(e => 
      (selectedDate === "all" || e.checks.some(check => check.date.startsWith(selectedDate))) &&
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredEmployees(filtered)
    setCurrentPage(1)
  }, [selectedDate, searchQuery, employees])

  const uniqueDates = ["all", ...Array.from(new Set(employees.flatMap(e => e.checks.map(check => check.date))))].sort()

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getEmployeeStatus = (employee: Employee, date: string): string => {
    const check = employee.checks.find(c => c.date.startsWith(date))
    if (check) {
      return "present"
    }
    const leave = employee.leaves.find(l => l.date.startsWith(date))
    if (leave) {
      return leave.type
    }
    return "absent"
  }

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="payroll">Payroll</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a date" />
            </SelectTrigger>
            <SelectContent>
              {uniqueDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {date === "all" ? "All Dates" : date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Working Hours</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.map((employee) => (
              employee.checks.map((check) => (
                <TableRow key={`${employee.id}-${check.date}`}>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>
                    <StatusCircle status={getEmployeeStatus(employee, check.date)} />
                    {getEmployeeStatus(employee, check.date)}
                  </TableCell>
                  <TableCell>
                    <CheckTime
                      time={formatTime(check.checkIn)}
                      isLate={new Date(check.checkIn).getHours() >= 9 && new Date(check.checkIn).getMinutes() > 0}
                      isEarly={false}
                    />
                  </TableCell>
                  <TableCell>
                    <CheckTime
                      time={formatTime(check.checkOut)}
                      isLate={false}
                      isEarly={new Date(check.checkOut).getHours() < 17}
                    />
                  </TableCell>
                  <TableCell>
                    {((new Date(check.checkOut).getTime() - new Date(check.checkIn).getTime()) / 3600000).toFixed(2)}
                  </TableCell>
                  <TableCell>{check.date.split('T')[0]}</TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <div className="flex space-x-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
        </div>
        <div className="mt-4 text-sm">
          <h3 className="font-semibold mb-2">Legend:</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
                {status}
              </div>
            ))}
            <div className="flex items-center">
              <Turtle className="w-4 h-4 mr-2 text-orange-500" />
              Late arrival
            </div>
            <div className="flex items-center">
              <Rabbit className="w-4 h-4 mr-2 text-blue-500" />
              Early departure
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="payroll">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Hourly Rate</TableHead>
              <TableHead>Total Hours</TableHead>
              <TableHead>Total Payroll</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>${employee.hourlyRate !== undefined ? employee.hourlyRate.toFixed(2) : 'N/A'}</TableCell>
                <TableCell>{employee.payroll && employee.payroll.totalHours !== undefined ? employee.payroll.totalHours.toFixed(2) : 'N/A'}</TableCell>
                <TableCell>${employee.payroll && employee.payroll.totalPay !== undefined ? employee.payroll.totalPay.toFixed(2) : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  )
}