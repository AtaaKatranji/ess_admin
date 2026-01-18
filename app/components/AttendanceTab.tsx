import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Plus, Search,  Clock, LogOut, Info, } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { fetchTimeShifts } from '../api/shifts/shifts';
import React from 'react';
import { cn } from '@/lib/utils';

type History = {
  id: string; // Updated to _id
  checkDate: string;
  checkInTime: string;
  checkOutTime: string | null;
  note?: string | null;
  notesCount?: number;
  hasLateNote?: boolean;
  hasEarlyLeaveNote?: boolean;
};
type AttendanceNoteType = "LATE" | "EARLY_LEAVE" | "OTHER";

type AttendanceNote = {
  id: number;
  type: AttendanceNoteType;
  note: string;
  createdAt: string;
  admin?: {
    id: number;
    name: string;
  };
};
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const AttendanceTab = ({ employeeId, selectedMonth, ourSlug }: { employeeId: string; selectedMonth: Date; ourSlug: string }) => {
  const [history, setHistory] = useState<History[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<History[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [shiftDays, setShiftDays] = useState<string[]>([]);

  const [notesSheetOpen, setNotesSheetOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<History | null>(null);
  const [notes, setNotes] = useState<AttendanceNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Dialog لإضافة ملاحظة
  const [addNoteOpen, setAddNoteOpen] = useState(false);
  const [newNoteType, setNewNoteType] = useState<AttendanceNoteType | "">("");
  const [newNoteText, setNewNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const dialogRef = React.useRef<HTMLDivElement | null>(null)
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

  async function openNotesSheet(record: History) {
    setSelectedRecord(record);
    setNotesSheetOpen(true);
    setLoadingNotes(true);
  
    try {
      const res = await fetch(
        `${baseUrl}/institutions/${ourSlug}/checks/attendance/${record.id}/notes`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const json = await res.json();
      setNotes(json.data ?? []);
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoadingNotes(false);
    }
  }
  

  const fetchMonthlyHistory = async (date: Date) => {
    try {
      const response = await fetch(`${baseUrl}/checks/monthlyHistoryFront`, {
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
        response = await fetch(`${baseUrl}/checks/update`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        const existingRecordsResponse = await fetch(
          `${baseUrl}/checks/checks?date=${data.checkDate}&employeeId=${employeeId}`,
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
        response = await fetch(`${baseUrl}/checks/add`, {
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
  async function handleAddNoteSubmit() {
    if (!selectedRecord || !newNoteType || !newNoteText.trim()) return;
  
    setSavingNote(true);
    try {
      const res = await fetch(
        `${baseUrl}/institutions/${ourSlug}/checks/attendance/${selectedRecord.id}/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            type: newNoteType,
            note: newNoteText.trim(),
          }),
        }
      );
      const json = await res.json();
  
      if (json.status) {
        const created: AttendanceNote = json.data;
  
        // 1) أضف الملاحظة للقائمة
        setNotes((prev) => [...prev, created]);
  
        // 2) حدّث selectedRecord محليًا
        setSelectedRecord((prev) =>
          prev
            ? {
                ...prev,
                notesCount: (prev.notesCount ?? 0) + 1,
                hasLateNote:
                  prev.hasLateNote || created.type === "LATE",
                hasEarlyLeaveNote:
                  prev.hasEarlyLeaveNote || created.type === "EARLY_LEAVE",
              }
            : prev
        );
  
        // 3) حدّث history الرئيسي (حتى ينعكس Badge في القائمة)
        setHistory((prev) =>
          prev.map((h) =>
            h.id === selectedRecord.id
              ? {
                  ...h,
                  notesCount: (h.notesCount ?? 0) + 1,
                  hasLateNote:
                    h.hasLateNote || created.type === "LATE",
                  hasEarlyLeaveNote:
                    h.hasEarlyLeaveNote || created.type === "EARLY_LEAVE",
                }
              : h
          )
        );
  
        // 4) صفّي الفورم واغلق Dialog
        setNewNoteType("");
        setNewNoteText("");
        setAddNoteOpen(false);
      } else {
        console.error("Failed to add note", json);
      }
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setSavingNote(false);
    }
  }
  
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
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="space-y-4 w-full">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl sm:text-2xl font-semibold text-primary">Attendance Records</h2>

      <div className="flex w-full sm:w-auto items-center gap-2">
        <Button size="sm" onClick={openAddDialog} className="gap-1">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
          <span className="sr-only">Add Record</span>
        </Button>

        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records"
            className="pl-8 w-full sm:w-[260px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
    </div>
    <Card className="shadow-sm">
  {history.length === 0 ? (
    <div className="p-8 text-sm text-muted-foreground">
      No attendance recorded.
    </div>
  ) : (
    <ul className="divide-y">
      {filteredHistory
        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        .map((record) => (
          <li
            key={record.id}
            className="flex items-center justify-between gap-4 p-4 hover:bg-accent/40"
          >
            {/* Left: Date + times */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">
                  {format(new Date(record.checkDate), "MMMM d, yyyy : EEEE")}
                </p>

                {/* Badge: عدد الملاحظات */}
                {(record.notesCount ?? 0) > 0 && (
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
                    Notes {record.notesCount}
                  </span>
                )}

                {/* أيقونات الحالة حسب نوع الملاحظات */}
                <div className="flex items-center gap-1">
                  {record.hasLateNote && (
                    <span
                      className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-1.5 py-0.5 text-[11px]"
                      title="Has late note"
                    >
                      <Clock className="h-3 w-3 mr-0.5" />
                      Late
                    </span>
                  )}

                  {record.hasEarlyLeaveNote && (
                    <span
                      className="inline-flex items-center rounded-full bg-red-100 text-red-800 px-1.5 py-0.5 text-[11px]"
                      title="Has early leave note"
                    >
                      <LogOut className="h-3 w-3 mr-0.5" />
                      Early
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground tabular-nums">
                Check-in: {record.checkInTime ?? "—"}, Check-out:{" "}
                {record.checkOutTime ?? "Not yet checked out"}
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Notes → Sheet */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openNotesSheet(record)}
              >
                Notes
              </Button>

              {/* Edit → Dialog */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(record)}
              >
                Edit
              </Button>
            </div>
          </li>
        ))}
    </ul>
  )}
</Card>
<Sheet open={notesSheetOpen} onOpenChange={setNotesSheetOpen}>
  <SheetContent side="right" className="w-full sm:w-[480px]">
    <SheetHeader>
      <SheetTitle>Attendance Notes</SheetTitle>
      <SheetDescription>
        {selectedRecord && (
          <div className="mt-2 text-sm text-muted-foreground">
            {format(new Date(selectedRecord.checkDate), "MMMM d, yyyy : EEEE")}
            <br />
            Check-in: {selectedRecord.checkInTime ?? "—"} | Check-out:{" "}
            {selectedRecord.checkOutTime ?? "Not yet checked out"}
          </div>
        )}
      </SheetDescription>
    </SheetHeader>

    <div className="mt-4 space-y-4">
      {/* زر Add Note */}
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setAddNoteOpen(true)}>
          Add note
        </Button>
      </div>

      {/* قائمة الملاحظات */}
      {loadingNotes ? (
        <div className="text-sm text-muted-foreground">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No notes for this day.
        </div>
      ) : (
        <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border bg-background p-3 text-sm space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border",
                    note.type === "LATE" &&
                      "bg-yellow-100 text-yellow-800 border-yellow-200",
                    note.type === "EARLY_LEAVE" &&
                      "bg-red-100 text-red-800 border-red-200",
                    note.type === "OTHER" &&
                      "bg-slate-100 text-slate-800 border-slate-200"
                  )}
                >
                  {note.type === "LATE" && (
                    <>
                      <Clock className="h-3 w-3" />
                      <span>Late</span>
                    </>
                  )}
                  {note.type === "EARLY_LEAVE" && (
                    <>
                      <LogOut className="h-3 w-3" />
                      <span>Early leave</span>
                    </>
                  )}
                  {note.type === "OTHER" && (
                    <>
                      <Info className="h-3 w-3" />
                      <span>Other</span>
                    </>
                  )}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  {format(new Date(note.createdAt), "yyyy-MM-dd HH:mm")}
                </span>
              </div>

              <p className="whitespace-pre-line">{note.note}</p>

              {note.admin && (
                <p className="text-[11px] text-muted-foreground">
                  by {note.admin.name}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>

    {/* Dialog لإضافة ملاحظة جديدة */}
    <Dialog open={addNoteOpen} onOpenChange={setAddNoteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add note</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Type</label>
            <Select
              value={newNoteType}
              onValueChange={(val: AttendanceNoteType) =>
                setNewNoteType(val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="EARLY_LEAVE">Early leave</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Note</label>
            <Textarea
              rows={4}
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Reason / explanation..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setAddNoteOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNoteSubmit}
            disabled={
              savingNote || !newNoteType || !newNoteText.trim()
            }
          >
            {savingNote ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </SheetContent>
</Sheet>


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
        <DialogContent className="sm:max-w-[425px] z-50"  ref={dialogRef}  >
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
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen} modal={false} >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCalendarOpen(v => !v)}
                            className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent container={dialogRef.current} className="w-auto p-0 overflow-visible" align="start" sideOffset={4} avoidCollisions={false}>
                        <Calendar
                          mode="single"
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => {
                            if (!date) return
                            const dayName = days[date.getDay()]
                            if (!shiftDays.includes(dayName)) {
                              alert("The selected date is not part of the shift days.")
                              return
                            }
                            const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                              .toISOString()
                              .slice(0, -1)

                            field.onChange(localISOTime)
                            setIsCalendarOpen(false)   // سكّر بعد الاختيار
                          }}
                          onMonthChange={() => setIsCalendarOpen(true)} // ما يسكر عند تبديل الشهر
                          disabled={(date) =>
                            !shiftDays.includes(days[date.getDay()]) ||
                            date > new Date() ||
                            date < new Date("1900-01-01")
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
              <FormField
                control={form.control}
                name="note"
                rules={{ required: "Note is required" }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Note  <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write a note"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
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