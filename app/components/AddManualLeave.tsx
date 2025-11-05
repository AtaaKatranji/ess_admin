"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
interface AddManualLeaveProps {
  employeeId: string;
  onLeaveAdded?: () => void; // ✅ دالة اختيارية للتحديث بعد الإضافة
}

export default function AddManualLeave({ employeeId, onLeaveAdded }: AddManualLeaveProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [leaveType, setLeaveType] = useState<string>("Paid");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!date) {
      alert("Please select a date.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leaves/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          date: format(date, "yyyy-MM-dd"),
          type: leaveType,
          notes,
          addedByAdmin: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to add leave");

      alert("Leave added successfully ✅");
      setOpen(false);

      // ✅ استدعاء الدالة القادمة من الأب لتحديث البيانات
      if (onLeaveAdded) onLeaveAdded();
    } catch (err) {
      console.error(err);
      alert("Error adding leave ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        + Add Manual Leave
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Manual Leave</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* 🗓️ اختيار التاريخ */}
      
            <div className="flex flex-col space-y-2">
            <Label>Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                    {date ? format(date, "PPP") : <span>Select a date</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => setDate(selectedDate)}
                    initialFocus
                />
                </PopoverContent>
            </Popover>
            </div>

            {/* 🧾 نوع الإجازة */}
            <div className="flex flex-col space-y-2">
              <Label>Leave Type</Label>
              <Select onValueChange={setLeaveType} defaultValue={leaveType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid Leave</SelectItem>
                  <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 📝 الملاحظات */}
            <div className="flex flex-col space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write a note about this leave..."
              />
            </div>
          </div>

          {/* ✅ الأزرار */}
          <DialogFooter className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
