'use client'

import {   useEffect, useState } from 'react'
import { useRouter } from "next/navigation";

import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar"
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
import { ChevronDown, Download, Search, CalendarIcon,CalendarClock, RefreshCw } from 'lucide-react'
import { fetchShifts } from '@/app/api/shifts/shifts'
import { fetchCheckInOutData } from '@/app/api/employees/employeeId'
import { useInstitution } from '@/app/context/InstitutionContext';
import { useSocket } from "@/app/context/SocketContext";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
  const { slug } = useInstitution(); 
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(); // Start as undefined
  const [viewMode, setViewMode] = useState('daily');
  const [attendanceData, setAttendanceData] = useState<ApiResponse>({ data: [], message: '' });
  const [loading, setLoading] = useState(true);
  const [loadingShifts, setLoadingShifts] = useState(false);
  // optional if you do permission gating
  //const [canCreateShift, setCanCreateShift] = useState(true); // wire from your caps endpoint if you have one
  
  const router = useRouter();
  const shiftsHref = slug ? `/dashboard/institution/${slug}/shifts` : "/";
  const socket = useSocket();
  useEffect(() => {
    const fetchAndSetShifts = async () => {
      try {
        if (!slug) return; // If slug is undefined, do nothing
        
        const data = await fetchShifts(slug);

          setShifts(Array.isArray(data) ? data : []);
          setSelectedShift((prev) => prev ?? (Array.isArray(data) && data[0] ? data[0] : null));
        
      } catch (err) {
        console.error("Error fetching shifts:", err);
      } finally {
        setLoadingShifts(false);
      }
    };
    fetchAndSetShifts();
  }, [slug]);
  
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
  
  useEffect(() => {
    if (shifts.length > 0 && !selectedShift) setSelectedShift(shifts[0]);
    if (shifts.length === 0) setSelectedShift(null);
  }, [shifts]);
  function EmptyShiftsState({
    href,
    onRefresh,
    //canCreate,canCreate: boolean
  }: { href: string; onRefresh: () => void;  }) {
    return (
      <Card className="flex flex-col items-center text-center py-16">
        <CalendarClock className="h-10 w-10 mb-3 text-gray-500" />
        <h3 className="text-lg font-semibold mb-1">No shifts yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Create your first shift to start tracking attendance and time sheets.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            onClick={() => router.push(href)}
            //disabled={!canCreate}
            //title={canCreate ? undefined : "You don't have permission to create shifts"}
          >
            Create a Shift
          </Button>
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
        {/* {!canCreate && (
          <p className="mt-2 text-xs text-muted-foreground">
            Don’t have access? Contact an administrator.
          </p>
        )} */}
      </Card>
    );
  }
  return (
    <div className="container mx-auto w-full max-w-screen-xl px-3 sm: py-10 sm:px-6 overflow-hidden">
      <div>
        <h1 className="text-2xl font-bold mb-4  text-gray-800">Institution Dashboard - Overview</h1>
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
      </div>
      {loadingShifts ? (
      <Card className="p-10 text-center text-muted-foreground">Loading shifts…</Card>
    ) : shifts.length === 0 ? (
      <EmptyShiftsState
        href={shiftsHref}         // e.g. /dashboard/institution/[slug]/shifts
        onRefresh={() => {/* call your fetchShifts() here */}}
        //canCreate={canCreateShift}
      />
    ) : (
      // your existing grid when shifts exist
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader><h2 className="text-xl font-semibold">Attendance Status</h2></CardHeader>
          <CardContent>
            <AttendanceStatus response={attendanceData} loading={loading} />
          </CardContent>
        </Card>

        <Card className="overflow-x-auto md:col-span-2">
          <CardHeader>
            <h2 className="text-xl font-semibold min-h-[24px]">Time Sheet</h2>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-600" />
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
                <DailyTimeSheet employees={attendanceData.data} />
              </TabsContent>
              <TabsContent value="weekly">
                <WeeklyTimeSheet employees={attendanceData.data} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* Previous Day Attendance Card */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Previous Day Attendance</h2>
              <p className="text-sm text-muted-foreground">
                Overview of yesterday’s check-ins and check-outs
              </p>
            </CardHeader>
            <CardContent>
              <PreviousDayAttendance shift={selectedShift} slug={slug} />
            </CardContent>
          </Card>
        </div>
      </div>
    )}
  </div>
);


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

function PreviousDayAttendance({ shift, slug }: { shift: Shift | null | undefined; slug?: string }) {
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return y; // يبدأ من الأمس افتراضيًا
  });

  const router = useRouter();

  const fetchPrevDayData = async (date: Date) => {
    if (!shift) return;
    try {
      setLoading(true);
      const formattedDate = date.toISOString().split("T")[0];
      const result = await fetchCheckInOutData(shift.id, formattedDate);
      setData(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Error fetching previous day data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrevDayData(selectedDate);
  }, [shift, selectedDate]);

  return (
    <div className="w-full">
      {/* 🔹 العنوان و أدوات التحكم */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "yyyy-MM-dd")}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="p-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            onClick={() => fetchPrevDayData(selectedDate)}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* 🔹 محتوى الجدول */}
      {loading ? (
        <p className="text-center text-gray-500 py-4">Loading attendance data...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No records found for {format(selectedDate, "yyyy-MM-dd")}.
        </p>
      ) : (
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
              {data.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() =>
                    router.push(`/dashboard/institution/${slug}/employees/${emp.id}`)
                  }
                  className="border-b hover:bg-gray-50 cursor-pointer transition"
                >
                  <td className="py-2 font-medium text-blue-600">{emp.name}</td>
                  <td className="py-2">{emp.checkIn}</td>
                  <td className="py-2">{emp.checkOut}</td>
                  <td className="py-2">{emp.totalHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



export default OverviewPage;