'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronDown, Download, Search } from 'lucide-react'

// types/AttendanceRecord.ts
interface Employee {
  id: number;
  name: string;
  loggedIn: boolean;
  checkIn: string;
  checkOut: string;
  totalHours: number;
}

// Mock data
const shifts = ['Morning Shift', 'Afternoon Shift', 'Night Shift']
const employees = [
  { id: 1, name: 'John Doe', loggedIn: true, checkIn: '09:00', checkOut: '17:00', totalHours: 8 },
  { id: 2, name: 'Jane Smith', loggedIn: false, checkIn: '09:15', checkOut: '17:15', totalHours: 8 },
  { id: 3, name: 'Alice Johnson', loggedIn: true, checkIn: '08:55', checkOut: '17:05', totalHours: 8.17 },
  // Add more employees as needed
]

export default function Component() {
  const [selectedShift, setSelectedShift] = useState(shifts[0])
  const [viewMode, setViewMode] = useState('daily')

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Institution Dashboard - Overview</h1>
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {selectedShift} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {shifts.map((shift) => (
                <DropdownMenuItem key={shift} onSelect={() => setSelectedShift(shift)}>
                  {shift}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch id="view-mode" onCheckedChange={(checked) => setViewMode(checked ? 'weekly' : 'daily')} />
              <Label htmlFor="view-mode">Weekly View</Label>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Attendance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceStatus employees={employees} />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Time Sheet</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employees..." className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" value={viewMode}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="daily">Daily View</TabsTrigger>
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              </TabsList>
              <TabsContent value="daily">
                <DailyTimeSheet employees={employees} />
              </TabsContent>
              <TabsContent value="weekly">
                <WeeklyTimeSheet employees={employees} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function AttendanceStatus({ employees }: { employees: Employee[] }) {
  const loggedInEmployees = employees.filter(e => e.loggedIn)
  const notLoggedInEmployees = employees.filter(e => !e.loggedIn)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Logged In</h3>
        <ul className="space-y-2">
          {loggedInEmployees.map(employee => (
            <li key={employee.id} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center relative">
                <span className="text-xs font-semibold">{employee.name.charAt(0)}</span>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <span>{employee.name}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Not Logged In</h3>
        <ul className="space-y-2">
          {notLoggedInEmployees.map(employee => (
            <li key={employee.id} className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center relative">
                <span className="text-xs font-semibold">{employee.name.charAt(0)}</span>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></span>
              </div>
              <span>{employee.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DailyTimeSheet({ employees }: { employees: Employee[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Employee</th>
            <th className="text-left py-2">Check-in</th>
            <th className="text-left py-2">Check-out</th>
            <th className="text-left py-2">Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id} className="border-b">
              <td className="py-2">{employee.name}</td>
              <td className="py-2">{employee.checkIn}</td>
              <td className="py-2">{employee.checkOut}</td>
              <td className="py-2">{employee.totalHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function WeeklyTimeSheet({ employees }: { employees: Employee[] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Employee</th>
            {days.map(day => (
              <th key={day} className="text-left py-2">{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map(employee => (
            <tr key={employee.id} className="border-b">
              <td className="py-2">{employee.name}</td>
              {days.map(day => (
                <td key={day} className="py-2">
                  <div className="text-xs">{employee.checkIn} - {employee.checkOut}</div>
                  <div className="font-semibold">{employee.totalHours}h</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}