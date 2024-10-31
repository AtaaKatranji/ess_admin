"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { format } from "date-fns"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { CalendarIcon, Clock10Icon, LucideStars, Rabbit, Turtle, Search, Loader2 } from "lucide-react"

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

import { fetchTimeShifts } from "@/app/api/shifts/shifts"

type History = {
  id: string
  checkDate: string
  checkInTime: string
  checkOutTime: string | null
}

const EmployeeDetails = () => {
  const [history, setHistory] = useState<History[]>([])
  const [totalHours, setTotalHours] = useState<number | null>(null)
  const [lateHours, setLateHours] = useState<number | null>(null)
  const [earlyLeaveHours, setEarlyLeaveHours] = useState<number | null>(null)
  const [earlyArrivalHours, setEarlyArrivalHours] = useState<number | null>(null)
  const [extraAttendanceHours, setExtraAttendanceHours] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const BaseUrl = process.env.NEXT_PUBLIC_API_URL

  const params = useParams()
  const employeeId = Array.isArray(params.employeeId) ? params.employeeId[0] : params.employeeId as string

  const form = useForm<History>()

  const fetchMonthlyHistory = async () => {
    try {
      const response = await fetch(`${BaseUrl}/checks/monthlyHistory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeId: employeeId }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch monthly history")
      }

      const data = await response.json()

      const sortedHistory = data.tempA.sort((a: History, b: History) => {
        return new Date(b.checkDate).getTime() - new Date(a.checkDate).getTime()
      })

      setHistory(sortedHistory)
    } catch (error) {
      console.error("Error fetching monthly history:", error)
      toast.error("Failed to fetch monthly history. Please try again.")
    }
  }

  const fetchTotalHours = async () => {
    const date = new Date()
    const month = date.toLocaleString("default", { month: "long" })
    const year = date.getFullYear()

    try {
      const response = await fetch(`${BaseUrl}/checks/calculate-hours`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: employeeId, month: month, year: year }),
      })

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

  const fetchTimeShift = async () => {
    const result = await fetchTimeShifts(employeeId)

    if (Array.isArray(result)) {
      const firstShift = result[0]
      setStartTime(firstShift.startTime)
      setEndTime(firstShift.endTime)
    } else if (result) {
      setStartTime(result.startTime)
      setEndTime(result.endTime)
    }
  }

  useEffect(() => {
    const postTimeShiftData = async () => {
      if (startTime && endTime) {
        const date = new Date()
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
  }, [startTime, endTime])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      await Promise.all([fetchTotalHours(), fetchMonthlyHistory(), fetchTimeShift()])
      setIsLoading(false)
    }

    fetchData()
  }, [employeeId])

  const openEditDialog = (record: History) => {
    form.reset(record)
    setIsDialogOpen(true)
  }

  const onSubmit = async (data: History) => {
    try {
      const response = await fetch(`${BaseUrl}/checks/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update record")
      }

      fetchMonthlyHistory()
      toast.success("Updated successfully")
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error updating record:", error)
      toast.error("Failed to update record. Please try again.")
    }
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
      <h1 className="text-2xl font-bold">Employee Attendance Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock10Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours} hours</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Early Arrivals</CardTitle>
            <Clock10Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earlyArrivalHours} hours</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Extra Hours</CardTitle>
            <LucideStars className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{extraAttendanceHours} hours</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance Records</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="attendance" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Attendance Records</h2>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search records" className="pl-8" />
            </div>
          </div>
          <Card>
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                {history.map((record) => (
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
        </TabsContent>
        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No leave requests found.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Check-in Record</DialogTitle>
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
                              const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                                .toISOString()
                                .slice(0, -1)
                              field.onChange(localISOTime)
                            }
                          }}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EmployeeDetails