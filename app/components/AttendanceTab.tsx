import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Plus, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { fetchTimeShifts } from '../api/shifts/shifts';

type History = {
  id: string; // Updated to _id
  checkDate: string;
  checkInTime: string;
  checkOutTime: string | null;
};

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const AttendanceTab = ({ employeeId, selectedMonth }: { employeeId: string; selectedMonth: Date }) => {
  const [history, setHistory] = useState<History[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [shiftDays, setShiftDays] = useState<string[]>([]);

  const form = useForm<History>();
  const itemsPerPage = 10;

  const fetchTimeShift = async () => {
    const result = await fetchTimeShifts(employeeId);
    if (Array.isArray(result)) {
      const firstShift = result[0];
      setShiftDays(firstShift.days);
    } else if (result) {
      setShiftDays(result.days);
    }
  };

  const openEditDialog = (record: History) => {
    setIsEditing(true);
    form.reset(record);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setIsEditing(false);
    form.reset({
      checkDate: "",
      checkInTime: "",
      checkOutTime: "",
    });
    setIsDialogOpen(true);
  };

  const fetchMonthlyHistory = async (date: Date) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checks/monthlyHistoryFront`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, month: date }),
      });

      if (!response.ok) throw new Error("Failed to fetch monthly history");

      const data = await response.json();
      setHistory(data.data);
      setFilteredHistory(data.data);
    } catch (error) {
      console.error("Error fetching monthly history:", error);
      toast.error("Failed to fetch monthly history. Please try again.");
    }
  };

  const onSubmit = async (data: History) => {
    try {
      let response;
      if (isEditing) {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checks/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        const existingRecordsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/checks/checks?date=${data.checkDate}&employeeId=${employeeId}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        if (!existingRecordsResponse.ok) throw new Error("Failed to check existing records");
        const existingRecords = await existingRecordsResponse.json();
        if (existingRecords.length > 0) {
          toast.error("A record for this date already exists.");
          return;
        }
        const timeZone = "Asia/Damascus";
        const requestData = { ...data, timeZone, userId:employeeId };
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checks/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
      }

      if (!response.ok) throw new Error("Failed to save record");

      fetchMonthlyHistory(selectedMonth);
      toast.success(isEditing ? "Updated successfully" : "Added successfully");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Failed to save record. Please try again.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchMonthlyHistory(selectedMonth), fetchTimeShift()]);
      setIsLoading(false);
    };
    fetchData();
  }, [employeeId, selectedMonth]);

  useEffect(() => {
    const filtered = history.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      const date = format(new Date(record.checkDate), "MMMM d, yyyy").toLowerCase();
      const checkIn = record.checkInTime.toLowerCase();
      const checkOut = record.checkOutTime?.toLowerCase() || "";
      return date.includes(searchLower) || checkIn.includes(searchLower) || checkOut.includes(searchLower);
    });
    setFilteredHistory(filtered);
  }, [searchTerm, history]);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Attendance Records</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className="h-10 w-10 p-0" onClick={openAddDialog}>
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
        {history.length === 0 ? (
          <p className="p-10">No Attendance recorded.</p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-4">
              {filteredHistory
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((record) => (
                  <div
                    key={record.id} // Fixed to use _id
                    className="flex justify-between items-center py-2 border-b last:border-b-0 cursor-pointer hover:bg-accent"
                    onClick={() => openEditDialog(record)}
                  >
                    <div>
                      <p className="font-medium">{format(new Date(record.checkDate), "MMMM d, yyyy")}</p>
                      <p className="text-sm text-muted-foreground">
                        Check-in: {record.checkInTime}, Check-out: {record.checkOutTime || "Not yet checked out"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
            </div>
          </ScrollArea>
        )}
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
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
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
                              if (shiftDays.includes(dayName)) {
                                const localISOTime = new Date(
                                  date.getTime() - date.getTimezoneOffset() * 60000
                                ).toISOString().slice(0, -1);
                                field.onChange(localISOTime);
                              } else {
                                alert("The selected date is not part of the shift days.");
                              }
                            }
                          }}
                          disabled={(date) =>
                            !shiftDays.includes(days[date.getDay()]) || date > new Date() || date < new Date("1900-01-01")
                          }
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
                  <FormItem className="flex flex-col">
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
  );
};

export default AttendanceTab;