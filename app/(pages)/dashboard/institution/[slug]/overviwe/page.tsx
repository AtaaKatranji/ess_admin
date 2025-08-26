'use client'

import {   useEffect, useState } from 'react'


//import { Toaster } from '@/components/ui/sonner'; // or your notification library
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
import { fetchShifts } from '@/app/api/shifts/shifts'
import { fetchCheckInOutData } from '@/app/api/employees/employeeId'
import { useInstitution } from '@/app/context/InstitutionContext';
import { useSocket } from "@/app/context/SocketContext";

//const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
// types/AttendanceRecord.ts
interface Employee {
  onLeave: boolean;
  id: number;
  name: string;
  loggedIn: boolean;
  checkIn: string;
  checkOut: string;
  totalHours: string; // Changed to string to match backend formatting
}
interface Shift {
  id: string;
  name: string;
  mode: string;
  startTime: string;
  endTime: string;
  defaultTime: string;
  overrides: string;
  days: string[];
  employees: string[];
  institutionKey: string;
  lateMultiplier: number;
  lateLimit: number;
  extraMultiplier: number;
  extraLimit: number;
}
interface ApiResponse {
  message?: string;
  data: Employee[];
}

const OverviewPage = () => {
  const { institutionKey } = useInstitution();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | undefined>(); // Start as undefined
  const [viewMode, setViewMode] = useState('daily');
  const [attendanceData, setAttendanceData] = useState<ApiResponse>({ data: [], message: '' });
  const [loading, setLoading] = useState(true);
 
  const socket = useSocket();
  useEffect(() => {
    const fetchAndSetShifts = async () => {
      try {
        if (!institutionKey) return; // If slug is undefined, do nothing
        
        console.log("in overview page",institutionKey);
        const data = await fetchShifts(institutionKey);

        setShifts(data);
        if (data.length > 0) {
          setSelectedShift(data[0]);
        }
      } catch (err) {
        console.error("Error fetching shifts:", err);
      }
    };
    fetchAndSetShifts();
  }, [institutionKey]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedShift) return;
      setLoading(true);
      try {
        const shiftId = selectedShift.id;
        const data = await fetchCheckInOutData(shiftId);
        setAttendanceData(data);
      } catch (error) {
        console.error('Error fetching check-in/out data:', error);
        setAttendanceData({ message: 'Error loading data', data: [] });
      } finally {
        setLoading(false);
      }
    };
  
    // Fetch once on mount or when selectedShift changes
    fetchData();
  
    if (!socket) return;
  
    // Named handler function
    const handleNotifyAdmin = () => {
      fetchData();
    };
  
    // Register the handler
    socket.on("notify_admin", handleNotifyAdmin);
  
    // Cleanup: remove only this handler
    return () => {
      socket.off("notify_admin", handleNotifyAdmin);
    };
  
  }, [selectedShift, socket]);
  

  return (
    <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold m-4  text-gray-800">Institution Dashboard - Overview</h1>
        <div className="flex justify-between items-center mb-4">
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {selectedShift?.name || 'Select a Shift'} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {shifts.map((shift) => (
            <DropdownMenuItem key={shift.id} onSelect={() => setSelectedShift(shift)}>
              {shift.name}
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
          <h2 className="text-xl font-semibold">Attendance Status</h2>
          </CardHeader>
          <CardContent>
            <AttendanceStatus response={attendanceData} loading={loading} />
          </CardContent>
        </Card>

        <Card className="overflow-x-auto md:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold min-h-[24px]">Time Sheet</h2>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4  text-gray-600" />
              <Input placeholder="Search employees..." className="max-w-sm" />
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" value={viewMode}>
              <TabsList className="grid w-full grid-cols-2 rounded-lg border p-1 bg-transparent">
                <TabsTrigger value="daily">Daily View</TabsTrigger>
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
              </TabsList>
              <TabsContent value="daily">
                <DailyTimeSheet employees={attendanceData.data} />
              </TabsContent>
              <TabsContent value="weekly">
                <WeeklyTimeSheet employees={attendanceData.data} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


function AttendanceStatus({ response, loading }: { response: ApiResponse, loading: boolean }) {
  const { data: employees, message } = response;

  const loggedInEmployees = employees.filter(e => e.loggedIn && e.checkOut == "Not checked out");
  const loggedOutEmployees = employees.filter(e => e.checkOut != "Not checked out"); // <- New list
  const notLoggedInEmployees = employees.filter(e => !e.loggedIn && e.checkOut == "Not checked out"); // not logged in & not logged out

  return (
    <div className="container mx-auto w-full ">
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="loader"></div>
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {message && (
            <p className="text-sm text-gray-600 italic mb-2">{message}</p>
          )}
          {employees.length > 0 && (
            <>
              {/* Logged In */}
              <div>
                <h3 className="font-semibold mb-2">Logged In</h3>
                <ul className="space-y-2">
                  {loggedInEmployees.map(employee => (
                    <li key={employee.id} className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                          employee.onLeave
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-black'
                        }`}
                      >
                        <span className="text-xs font-semibold">{employee.name.charAt(0)}</span>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                      </div>
                      <span>{employee.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Logged Out */}
              <div>
                <h3 className="font-semibold mb-2">Logged Out</h3>
                <ul className="space-y-2">
                  {loggedOutEmployees.map(employee => (
                    <li key={employee.id} className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                          employee.onLeave
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-black'
                        }`}
                      >
                        <span className="text-xs font-semibold">{employee.name.charAt(0)}</span>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                      </div>
                      <span>{employee.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not Logged In */}
              <div>
                <h3 className="font-semibold mb-2">Not Logged In</h3>
                <ul className="space-y-2">
                  {notLoggedInEmployees.map(employee => (
                    <li key={employee.id} className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center relative ${
                          employee.onLeave
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-black'
                        }`}
                      >
                        <span className="text-xs font-semibold">{employee.name.charAt(0)}</span>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></span>
                      </div>
                      <span>{employee.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
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
        {employees.length > 0 ? (
            employees.map(employee => (
              <tr key={employee.id} className="border-b">
                <td className="py-2">{employee.name}</td>
                <td className="py-2">{employee.checkIn}</td>
                <td className="py-2">{employee.checkOut}</td>
                <td className="py-2">{employee.totalHours}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 text-center text-gray-500">
                No employee data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
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
        {employees.length > 0 ? (
            employees.map(employee => (
              <tr key={employee.id} className="border-b">
                <td className="py-2">{employee.name}</td>
                {days.map(day => (
                  <td key={day} className="py-2">
                    <div className="text-xs">{employee.checkIn} - {employee.checkOut}</div>
                    <div className="font-semibold">{employee.totalHours}h</div>
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="py-4 text-center text-gray-500">
                No employee data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}


export default OverviewPage;