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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
      const url = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL}/breaks/update` 
        : `${process.env.NEXT_PUBLIC_API_URL}/breaks/add`;
      const method = isEditing ? "PUT" : "POST";

      const requestData = {
        ...data,
        employeeId,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("Failed to save break record");
      }

      await fetchMonthlyBreaks(selectedMonth);
      toast.success(isEditing ? "Updated successfully" : "Added successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving break:", error);
      toast.error("Failed to save break record. Please try again.");
    }
  };

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
            <DialogTitle>{isEditing ? 'Edit Break' : 'Add New Custom Break'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className="w-full">
                            {field.value ? format(new Date(field.value), "PPP HH:mm") : "Pick a date"}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => date && field.onChange(date.toISOString())}
                        />
                        <Input
                          type="time"
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const date = field.value ? new Date(field.value) : new Date();
                            date.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(date.toISOString());
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        value={field.value ? new Date(field.value).toISOString().slice(0,16) : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customBreakName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Break Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
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
  );
};

export default HourlyLeavesTab;