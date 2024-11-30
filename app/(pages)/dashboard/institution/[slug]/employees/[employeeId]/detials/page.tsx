"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
// startOfMonth, endOfMonth,
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Plus, CalendarIcon, ClockIcon, Star, Rabbit, Turtle, Search, Loader2, Download, LucideArchiveRestore } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { fetchTimeShifts } from "@/app/api/shifts/shifts"
import  exportMonthlyReportPDF  from "@/app/components/ExportPDF"
import AbsentTab from "@/app/components/AbsentTab"

type History = {
  id: string
  checkDate: string
  checkInTime: string
  checkOutTime: string | null
}
type Leave = {
  id: string
  startDate: string
  endDate: string 
  type: "Paid" | "Unpaid"
  status: string
  reason: string
  durationInDays: number
  
}

type MonthlySummary = {
  month: string
  totalAttendance: number
  absences: number
  tardies: number
}
type Comp = {
  name: string
  attendance: number
  absences: number
  tardies: number
}

const EmployeeDetails = () => {
  const [history, setHistory] = useState<History[]>([])
  const [filteredHistory, setFilteredHistory] = useState<History[]>([])
  const [totalHours, setTotalHours] = useState<number | null>(null)
  const [lateHours, setLateHours] = useState<number | null>(null)
  const [earlyLeaveHours, setEarlyLeaveHours] = useState<number | null>(null)
  const [earlyArrivalHours, setEarlyArrivalHours] = useState<number | null>(null)
  const [extraAttendanceHours, setExtraAttendanceHours] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [currentPage, setCurrentPage] = useState(1)
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [comparisonData, setComparisonData] = useState<Comp[]>([])
  const [paidLeaves, setPaidLeaves] = useState<number | null>(null)
  const [unpaidLeaves, setUnpaidLeaves] = useState<number | null>(null)
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [shiftDays, setShiftDays] = useState<string []>([])
  const [employeeName, setEmployeeName] = useState<string []>([])

  const BaseUrl = process.env.NEXT_PUBLIC_API_URL
  const itemsPerPage = 10
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const params = useParams()
  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId as string

  const form = useForm<History>()

  const fetchMonthlyHistory = async (date: Date) => {
    // const startDate = startOfMonth(date)
    // const endDate = endOfMonth(date)
    const month = date;
    try {
      const response = await fetch(`${BaseUrl}/checks/monthlyHistoryFront`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId, month }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch monthly history")
      }

      const data = await response.json()
      console.log("data : ",data);
      // const sortedHistory = data.sort((a: History, b: History) => {
      //   return new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime()
      // })

      setHistory(data.data)
      setFilteredHistory(data.data)
    } catch (error) {
      console.error("Error fetching monthly history:", error)
      toast.error("Failed to fetch monthly history. Please try again.")
    }
  }

  const fetchTotalHours = async (date: Date) => {
    const month = date

    try {
      const response = await fetch(`${BaseUrl}/checks/calculate-hours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: employeeId, month }),
      })
      console.log(response)
      if (!response.ok) {
        throw new Error("Failed to fetch total hours")
      }

      const data = await response.json()

      setTotalHours(data.total.totalHours)
    } catch (error) {
      console.error("Error fetching total hours:", error)
      toast.error("Failed to fetch total hours. Please try again.")
    }
  }

  const fetchLeaves = async (date: Date) => {
    const month = date
    try{
    const response = await fetch(`${BaseUrl}/leaves/month`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: employeeId, month }),
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch leaves");
    }
    
    const data = await response.json();
    
    // Access the nested structure
    const leaveRequests = data.leaves?.leaves || []; // Safely access the nested 'leaves'
    const totalPaidLeaveDays = data.leaveDays?.totalPaidLeaveDays || 0;
    const totalUnpaidLeaveDays = data.leaveDays?.totalUnpaidLeaveDays || 0;
    
    // Log for debugging
    console.log("Leave Requests: ", leaveRequests);
    console.log("Total Paid Leave Days: ", totalPaidLeaveDays);
    console.log("Total Unpaid Leave Days: ", totalUnpaidLeaveDays);
    
    // Update state
    setPaidLeaves(totalPaidLeaveDays);
    setUnpaidLeaves(totalUnpaidLeaveDays);
    setLeaves(leaveRequests);
    }catch (error) {
      console.error("Error fetching total hours:", error)
      toast.error("Failed to fetch total hours. Please try again.")
    }
  }

  const fetchTimeShift = async () => {
    const result = await fetchTimeShifts(employeeId)

    if (Array.isArray(result)) {
      const firstShift = result[0]
      setStartTime(firstShift.startTime)
      setEndTime(firstShift.endTime)
      setShiftDays(firstShift.days)
    } else if (result) {
      setStartTime(result.startTime)
      setEndTime(result.endTime)
      setShiftDays(result.days)
    }
  }
  interface MonthlyAttendanceStats {
    totalAttendance: number;
    absences: number;
    tardies: number;
}


// Define an interface for the response structure
interface MonthlyAttendanceResponse {
    employeeId: string;
    monthlyAttendance: Record<string, MonthlyAttendanceStats>;
}
  const fetchMonthlySummary = async (employeeId: string) => {
    try {
        // Make an API call to fetch monthly attendance summary
        const response = await fetch(`${BaseUrl}/checks/summaryLastTwoMonth/${employeeId}`);
        
        // Check if the response is okay
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        
        const data: MonthlyAttendanceResponse = await response.json();

        // Map over the monthly attendance data
        const summary = Object.entries(data.monthlyAttendance).map(([month, stats]) => ({
            month,
            totalAttendance: stats.totalAttendance,
            absences: stats.absences,
            tardies: stats.tardies,
        }));
        // Set the state with the fetched summary
        setMonthlySummary(summary);
        
        // Prepare comparison data for chart or other use
        setComparisonData(summary.map(s => ({
            name: s.month,
            attendance: s.totalAttendance,
            absences: s.absences,
            tardies: s.tardies,
        })));
    } catch (error) {
        console.error('Error fetching monthly summary:', error);
    }
};

  useEffect(() => {
    const postTimeShiftData = async () => {
      
      if (startTime && endTime) {
        const date = selectedMonth
        const month = date.toLocaleString("default", { month: "long" })
        const year = date.getFullYear()

        try {
          const response = await fetch(`${BaseUrl}/checks/timeShift`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: employeeId,
              month,
              year,
              startTime,
              endTime,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to fetch total hours")
          }

          const data = await response.json()
          setExtraAttendanceHours(data.data.extraAttendanceHours)
          setLateHours(data.data.lateHours)
          setEarlyArrivalHours(data.data.earlyArrivalHours)
          setEarlyLeaveHours(data.data.earlyLeaveHours)
        } catch (error) {
          console.error("Error fetching total hours:", error)
          toast.error("Failed to fetch total hours. Please try again.")
        }
      }
    }

    postTimeShiftData()
  }, [startTime, endTime, selectedMonth, employeeId])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchTotalHours(selectedMonth),
        fetchMonthlyHistory(selectedMonth),
        fetchLeaves(selectedMonth),
        fetchTimeShift(),
        fetchMonthlySummary(employeeId),
      ])
      setIsLoading(false)
    }

    fetchData()
  }, [employeeId, selectedMonth])

  useEffect(() => {
    const filtered = history.filter((record) => {
      const searchLower = searchTerm.toLowerCase()
      const date = format(new Date(record.checkDate), "MMMM d, yyyy").toLowerCase()
      const checkIn = record.checkInTime.toLowerCase()
      const checkOut = record.checkOutTime?.toLowerCase() || ""
      return date.includes(searchLower) || 
             checkIn.includes(searchLower) || 
             checkOut.includes(searchLower)
    })
    setFilteredHistory(filtered)
    setCurrentPage(1)
  }, [searchTerm, history])
// Function to reset form fields (implement according to your form management)
  const resetForm = () => {
    // Assuming you are using React Hook Form or similar library:
    form.reset(); // Reset all fields in your form
  };
  const openEditDialog = (record: History) => {
    setIsEditing(true);
    form.reset(record)
    setIsDialogOpen(true)
  }
  const openAddDialog = () => {
    setIsEditing(false); // Set to add mode
    resetForm();
    form.reset();// Reset form data for new record
    setIsDialogOpen(true);
  };
  const onSubmit = async (data: History) => {
    try {
      let response;
  
      // Step 1: Check if we are in edit mode
      if (isEditing) {
        // If editing, proceed with the update
        response = await fetch(`${BaseUrl}/checks/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        form.reset();
      } else {
        // Step 2: Check if a record already exists for the selected date when adding
        const existingRecordsResponse = await fetch(`${BaseUrl}/checks/checks?date=${data.checkDate}&employeeId=${employeeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        if (!existingRecordsResponse.ok) {
          throw new Error("Failed to check existing records");
        }
  
        const existingRecords = await existingRecordsResponse.json();
  
        // Step 3: Check if there are any records for that date
        if (existingRecords.length > 0) {
          toast.error("A record for this date already exists. Please choose another date.");
          return; // Exit the function early to prevent adding a duplicate
        }
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const requestData = {
          ...data, // Spread existing History fields
          timeZone, // Add timeZone field
          employeeId, // Add employeeId field
        };
        console.log(JSON.stringify(requestData))
        // Step 4: Proceed with adding the new record
        response = await fetch(`${BaseUrl}/checks/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });
      }
  
      // Step 5: Check if the response is ok
      if (!response.ok) {
        throw new Error("Failed to save record");
      }
  
      // Fetch monthly history after successful operation
      fetchMonthlyHistory(selectedMonth);
      toast.success(isEditing ? "Updated successfully" : "Added successfully");
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Failed to save record. Please try again.");
    }
  };

  const exportMonthlyReport = async () => {
    console.log(selectedMonth)
    const response = await fetch(`${BaseUrl}/checks/summry2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeId: employeeId,
        date: selectedMonth
      }),
    })
    console.log(response.body)
    if (!response) {
      throw new Error('Failed to fetch');
    }

    const data = await response.json();
    console.log(data)
    setEmployeeName(await data.summary.employeeName);
    // This would generate and download a report in a real application
    exportMonthlyReportPDF(data);
    // For now, we'll just show a toast message
    
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <ToastContainer />
      <div className="flex justify-between items-center">
        <h1 className="hidden md:block lg:hidden xl:block text-xl md:text-2xl font-bold">{employeeName}'s Attendance Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {format(selectedMonth, "MMMM yyyy")}
                <CalendarIcon className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportMonthlyReport} className="bg-cyan-900 text-white">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* total hours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours} hours</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        {/* late hours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Hours</CardTitle>
            <Turtle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lateHours} hours</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        {/* early leave */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Leaves</CardTitle>
            <Rabbit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earlyLeaveHours} hours</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
         {/* early arrive */}
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Arrivals</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earlyArrivalHours} hours</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        {/* extra hours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Extra Hours</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{extraAttendanceHours} hours</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        {/* leave days */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
            <LucideArchiveRestore className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              {/* Paid Leave Column */}
              <div className="flex flex-col items-start">
                <div className="text-lg font-bold justify-center">{paidLeaves}</div>
                <p className="text-xs text-muted-foreground">Paid Leave</p>
              </div>
              {/* Divider */}
              <div className="px-2 text-muted-foreground">|</div>
              {/* Unpaid Leave Column */}
              <div className="flex flex-col items-start">
                <div className="text-lg font-bold justify-center">{unpaidLeaves}</div>
                <p className="text-xs text-muted-foreground">Unpaid Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* monthy summry char */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="attendance" fill="#8884d8" />
              <Bar dataKey="absences" fill="#82ca9d" />
              <Bar  dataKey="tardies" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {/* monthly summry table*/}
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
                  <th className="text-left">Total Attendance</th>
                  <th className="text-left">Absences</th>
                  <th className="text-left">Tardies</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((summary, index) => (
                  <tr key={index}>
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


        </TabsList>
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Attendance Records</h2>
            <div className="flex space-x-2 ">
            <Button variant="outline" className="h-10 w-10  p-0" onClick={openAddDialog}>
              <Plus className="h-10 w-10" />
              <span className="sr-only">Add item</span>
            </Button>
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
          </div>
          <Card>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {filteredHistory
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((record) => (
                    <div
                      key={record.id}
                      className="flex justify-between items-center py-2 border-b last:border-b-0 cursor-pointer hover:bg-accent"
                      onClick={() => openEditDialog(record)}
                    >
                      <div>
                        <p className="font-medium">{format(new Date(record.checkDate), "MMMM d, yyyy")}</p>
                        <p className="text-sm text-muted-foreground">
                          Check-in: {record.checkInTime}, Check-out: {record.checkOutTime || "Not yet checked out"}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </Card>
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>Page {currentPage} of {Math.ceil(filteredHistory.length / itemsPerPage)}</span>
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredHistory.length / itemsPerPage)))}
              disabled={currentPage === Math.ceil(filteredHistory.length / itemsPerPage)}
            >
              Next
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="leave" className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Leave Requests</h2>
          {/* Uncomment for search functionality */}
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
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-8">
              {/* Paid Leaves Section */}
              <div>
                <h3 className="text-lg font-medium">Paid Leaves</h3>
                {leaves && leaves.filter((record) => record.type = "Paid").length > 0 ? (
                  leaves
                    .filter((record) => record.type = "Paid")
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex justify-between items-center py-2 border-b last:border-b-0 cursor-pointer hover:bg-accent"
                        onClick={() => {}}
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
              </div>

              {/* Unpaid Leaves Section */}
              <div>
                <h3 className="text-lg font-medium">Unpaid Leaves</h3>
                {leaves && leaves.filter((record) => record.type == "Unpaid" ).length > 0 ? (
                  leaves
                    .filter((record) => record.type == "Unpaid")
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex justify-between items-center py-2 border-b last:border-b-0 cursor-pointer hover:bg-accent"
                        onClick={() => {}}
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
              </div>
            </div>
          </ScrollArea>
        </Card>
        </TabsContent>
        <TabsContent value="absent">
          <AbsentTab employeeId={employeeId} />
        </TabsContent>

      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Check-in Record' : 'Add New Check-in Record'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="checkDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>


                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const dayName = days[date.getDay()];
                                console.log(dayName);
                                if (shiftDays.includes(dayName)) {
                                  // Date is within the shift days
                                  const localISOTime = new Date(
                                    date.getTime() - date.getTimezoneOffset() * 60000
                                  )
                                    .toISOString()
                                    .slice(0, -1);
                                  field.onChange(localISOTime);
                                } else {
                                  // Date is not within the shift days
                                  alert("The selected date is not part of the shift days.");
                                }
                              }
                            }}
                            disabled={(date) => {
                              const dayName = days[date.getDay()];
                              // Disable dates that are not in shiftDays or out of range
                              return !shiftDays.includes(dayName) || date > new Date() || date < new Date("1900-01-01");
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkInTime"
                render={({ field }) => (
                  <FormItem className="flex  flex-col">
                    <FormLabel>Check-in Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="checkOutTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Check-out Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeeDetails