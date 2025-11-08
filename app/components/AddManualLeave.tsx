"use client";

import { useEffect, useState } from "react";
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
import { DateRange } from "react-day-picker";
import { useAnnualLeave } from "@/app/context/AnnualLeaveContext";

interface AddManualLeaveProps {
  employeeId: string;
  onLeaveAdded?: () => void; // ✅ دالة اختيارية للتحديث بعد الإضافة
}

export default function AddManualLeave({ employeeId, onLeaveAdded }: AddManualLeaveProps) {
  const [open, setOpen] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false); 
  const [duration, setDuration] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [date, setDate] = useState<DateRange | undefined>();
  
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { annualPaidLeaves } = useAnnualLeave();
  const hasPaidLeaves = (annualPaidLeaves ?? 0) > 0;
  
  const [leaveType, setLeaveType] = useState<string>(hasPaidLeaves ? "Paid" : "Unpaid");
  const [warning, setWarning] = useState<string>("");
  console.log("📦 Annual leave API response:", annualPaidLeaves)
  
  useEffect(() => {
    // ✅ كل ما تتحدث قيمة الإجازات، عدل نوع الإجازة
    if (annualPaidLeaves !== null) {
      if (annualPaidLeaves <= 0) {
        setLeaveType("Unpaid");
        setWarning("⚠ Paid leave unavailable (no balance)");
      } else {
        setWarning("");
      }
    }
  }, [annualPaidLeaves]);
  
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
          startDate: format(date?.from ?? new Date(), "yyyy-MM-dd"),
          endDate: format(date?.to ?? date?.from ?? new Date(), "yyyy-MM-dd"),
          durationInDays: duration,
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
        <DialogContent className="sm:max-w-md"
        onPointerDownOutside={(e) => {
            // منع إغلاق المودال لما نضغط داخل التقويم أو الـ Popover
            if ((e.target as HTMLElement).closest(".calendar-container")) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement).closest(".calendar-container")) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Add Manual Leave</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {/* 🗓️ اختيار التاريخ */}
            <div className="flex flex-col space-y-2">
  <Label>Date</Label>

  {!openCalendar ? (
    // 🔹 الزر العادي لفتح التقويم
    <Button
      variant="outline"
      onClick={() => setOpenCalendar(true)}
      className="justify-start text-left font-normal"
    >
      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
      {date?.from && date?.to
        ? `${format(date.from, "PPP")} → ${format(date.to, "PPP")}`
        : "Select date range"}
    </Button>
  ) : (
    // 🔹 التقويم المعروض داخل المودال
    <div className="border rounded-md p-3 bg-white shadow-inner">
      <Calendar
        mode="range"
        selected={date}
        onSelect={(range) => {
          if (!range?.from || !range?.to) {
            setDate(range);
            setDuration(0);
            setError("");
            return;
          }

          // ✅ تحقق من الترتيب الصحيح للتواريخ
          if (range.from > range.to) {
            setError("⚠️ Start date cannot be after end date.");
            return;
          }

          // ✅ كل شي تمام
          setError("");
          setDate(range);
          const diffInMs = range.to.getTime() - range.from.getTime();
          const days = Math.round(diffInMs / (1000 * 60 * 60 * 24)) + 1;
          setDuration(days);
        }}
        
        initialFocus
      />

      {/* ⚠️ رسالة الخطأ الأنيقة */}
      {error && (
        <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
      )}

      {/* 🔹 عرض المدة */}
      {duration > 0 && !error && (
        <div className="flex items-center justify-between text-sm text-slate-600 mt-2 border-t pt-2">
          <span className="font-medium">Total Leave Duration:</span>
          <span className="font-semibold text-blue-700">
            {duration} day{duration > 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* 🔹 الأزرار */}
      <div className="flex justify-end gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setDate(undefined);
            setDuration(0);
            setError("");
          }}
        >
          Clear
        </Button>
        <Button
          size="sm"
          onClick={() => {
            if (!error) setOpenCalendar(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Done
        </Button>
      </div>
    </div>
  )}
</div>
                </div>

            {/* 🧾 نوع الإجازة */}
            <div className="flex flex-col space-y-2">
              <Label>Leave Type</Label>
              <Select onValueChange={(val) => {
          if (val === "Paid" && !hasPaidLeaves) {
            setWarning("⚠ Paid leave unavailable (no balance)");
            setLeaveType("Unpaid");
            return;
          }
          setWarning("");
          setLeaveType(val);
        }} defaultValue={leaveType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid" disabled={!hasPaidLeaves}>{hasPaidLeaves
              ? `Paid Leave (${annualPaidLeaves} days remaining)`
              : "Paid Leave (No balance)"}</SelectItem>
                  <SelectItem value="Unpaid">Unpaid Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {warning && (
        <p className="text-red-600 text-sm mt-1">{warning}</p>
      )}

            {/* 📝 الملاحظات */}
            <div className="flex flex-col space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write a note about this leave..."
              />
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
