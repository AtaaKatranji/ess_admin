import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Plus, Search, TimerIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  //FormMessage,
} from "@/components/ui/form";
import { useInstitution } from '../context/InstitutionContext';


type BreakRecord = {
  id: string;

  employeeId: string;
  breakTypeId?: string | null;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  durationTaken: number | null;
  isCustomBreak: boolean;
  customBreakName?: string | null;
  status?: 'Pending' | 'Approved' | 'Rejected' | null;
  createdAt: string;
};

const HourlyLeavesTab = ({ employeeId, selectedMonth }: { employeeId: string; selectedMonth: Date }) => {
  const { slug } = useInstitution();
  const [breaks, setBreaks] = useState<BreakRecord[]>([]);
  const [customBreaks, setCustomBreaks] = useState<BreakRecord[]>([]);
  const [regularBreaks, setRegularBreaks] = useState<BreakRecord[]>([]);
  const [filteredCustomBreaks, setFilteredCustomBreaks] = useState<BreakRecord[]>([]);
  const [filteredRegularBreaks, setFilteredRegularBreaks] = useState<BreakRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

  const [regularBreaksTotalHours, setRegularBreaksTotalHours] = useState<number | null>(null);
  const [customBreaksTotalHours, setCustomBreaksTotalHours] = useState<number | null>(null);

  const form = useForm<BreakRecord>();
  //const itemsPerPage = 10;

  const fetchMonthlyBreaks = async (date: Date) => {
    try {
      const response = await fetch(`${BaseUrl}/break/employee-breaks/AllEmployeeBreaksByUserId`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: employeeId, month: date }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch breaks");
      }

      const data = await response.json();
      setBreaks(data.data);
      console.log("data", data.data , breaks);
      // Separate custom and regular breaks

      
      setCustomBreaks(data.data.custom.breaks);
      setCustomBreaksTotalHours(data.data.custom.totalDuration)
      setRegularBreaks(data.data.regular.breaks);
      setRegularBreaksTotalHours(data.data.regular.totalDuration)
      setFilteredCustomBreaks(data.data.custom.breaks);
      setFilteredRegularBreaks(data.data.regular.breaks);
    } catch (error) {
      console.error("Error fetching breaks:", error);
      toast.error("Failed to fetch breaks. Please try again.");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchMonthlyBreaks(selectedMonth).then(() => setIsLoading(false));
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    const filterRecords = (records: BreakRecord[]) => records.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      const date = format(new Date(record.startTime), "MMMM d, yyyy").toLowerCase();
      const customName = record.customBreakName?.toLowerCase() || "";
      return date.includes(searchLower) || customName.includes(searchLower);
    });

    setFilteredCustomBreaks(filterRecords(customBreaks));
    setFilteredRegularBreaks(filterRecords(regularBreaks));
  }, [searchTerm, customBreaks, regularBreaks]);

  const openEditDialog = (record: BreakRecord) => {
    setIsEditing(true);
    form.reset(record);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setIsEditing(false);
    form.reset({
      startTime: "",
      endTime: null,
      duration: null,
      isCustomBreak: true,
      customBreakName: "",
      status: "Pending"
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: BreakRecord) => {
    try {
      // 1️⃣ حدد الرابط وطريقة الإرسال (نفس السابق)
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/breaks/employee-breaks/admin/update`
        : `${process.env.NEXT_PUBLIC_API_URL}/institutions/${slug}/break/employee-breaks/admin/add`;
      const method = isEditing ? "PUT" : "POST";
  
      // 2️⃣ جهّز التاريخ الكامل بصيغة ISO
      const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
      const startDateTime = dateStr && startTime ? `${dateStr}T${startTime}:00` : null;
      const endDateTime = dateStr && endTime ? `${dateStr}T${endTime}:00` : null;
  
      // 3️⃣ تحقق من الحقول قبل الإرسال
      if (!dateStr || !startDateTime || !endDateTime) {
        toast.warning("Please select date and both start & end times.");
        return;
      }
  
      if (error) {
        toast.error(error);
        return;
      }
  
      // 4️⃣ جهّز البيانات لإرسالها للسيرفر
      const requestData = {
        employeeId,
        startTime: startDateTime,
        endTime: endDateTime,
        duration,
        isCustomBreak: true,
        customBreakName: data.customBreakName,
        
      };
  
      // 5️⃣ أرسل الطلب
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",

        },
        credentials: "include",
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save break record");
      }
  
      // 6️⃣ بعد النجاح
      await fetchMonthlyBreaks(selectedMonth);
      toast.success(isEditing ? "Updated successfully ✅" : "Added successfully ✅");
      setIsDialogOpen(false);
  
    } catch (error) {
      console.error("Error saving break:", error);
      toast.error("Failed to save break record. Please try again ❌");
    }
  };
  
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (startTime && endTime) {
      const [sh, sm] = startTime.split(":").map(Number);
      const [eh, em] = endTime.split(":").map(Number);
      const start = new Date();
      const end = new Date();
      start.setHours(sh, sm, 0, 0);
      end.setHours(eh, em, 0, 0);
  
      if (end < start) {
        setError("⚠️ End time cannot be before start time.");
        setDuration(null);
      } else {
        const diffMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        setDuration(diffMinutes);
        setError("");
      }
    }
  }, [startTime, endTime]);

  if (isLoading) return <p>Loading...</p>;

  const renderBreakList = (title: string, breaks: BreakRecord[]) => (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Card>
        {/* <ScrollArea className="h-[300px]"> */}
          <div className="p-4">
            {breaks.length === 0 ? (
              <p>No records found.</p>
            ) : (
              breaks.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center py-2 border-b last:border-b-0 cursor-pointer hover:bg-accent"
                  onClick={() => openEditDialog(record)}
                >
                  <div>
                    <p className="font-medium">
                      {format(new Date(record.startTime), "MMMM d, yyyy HH:mm")} 
                      {record.isCustomBreak && ` - ${record.customBreakName}` || ` - ${record.breakTypeId}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: {record.isCustomBreak && `${record.duration} minutes` || `${record.breakTypeId}`}
                      {record.isCustomBreak && ` | Status: ${record.status}` || ``}
                    </p>
                  </div>
                  {record.isCustomBreak && (
                    <Button variant="ghost" size="sm">Edit</Button>
                  )}
                </div>
              ))
            )}
          </div>
        {/* </ScrollArea> */}
      </Card>
    </div>
  );



  return (
    <div className="flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Hourly Leaves</h2>
       

        <div className="flex space-x-2">

          <Button variant="outline" className="h-10 w-10 p-0" onClick={openAddDialog}>
            <Plus className="h-10 w-10" />
          </Button>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search breaks"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
 <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hourly Breaks Taken</CardTitle>
            <TimerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customBreaksTotalHours! + regularBreaksTotalHours!}</div>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Custom</CardTitle>
            <TimerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customBreaksTotalHours} </div>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Regular</CardTitle>
            <TimerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regularBreaksTotalHours} </div>
            <p className="text-xs text-muted-foreground">minutes</p>
          </CardContent>
        </Card>
        
          </div>
      {renderBreakList("Custom Breaks", filteredCustomBreaks)}
      {renderBreakList("Regular Breaks", filteredRegularBreaks)}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Hourly Leave' : 'Add New Hourly Leave'}</DialogTitle>
          </DialogHeader>

          {/* 🕒 نموذج الإجازة الساعية */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* ✅ اختيار اليوم */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Date</label>

                {!openCalendar ? (
                  <Button
                    variant="outline"
                    onClick={() => setOpenCalendar(true)}
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select a day"}
                  </Button>
                ) : (
                  <div className="border rounded-md p-3 bg-white shadow-inner">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(day) => {
                        setSelectedDate(day);
                        setOpenCalendar(false);
                      }}
                      initialFocus
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpenCalendar(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* ⏰ وقت البداية */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              {/* ⏰ وقت النهاية */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              {/* 💬 اسم الإجازة */}
              <FormField
                control={form.control}
                name="customBreakName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason / Break Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Reason for hourly leave" />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* ⚠️ المدة أو الخطأ */}
              {error ? (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              ) : duration && (
                <p className="text-sm text-muted-foreground mt-2">
                  Total duration: {duration} minutes
                </p>
              )}

              <DialogFooter>
                <Button type="submit" className="w-full">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HourlyLeavesTab;