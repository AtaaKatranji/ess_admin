'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Edit2 } from "lucide-react";
import LeaveUpdateDialog from "./AnnualLeaveUpdateDialog";
import { useState } from "react";
import { useAnnualLeave } from "@/app/context/AnnualLeaveContext";

interface LeaveUpdate {
  days: number;
  reason: string;
  timestamp: string;
}

interface LeaveCardProps {
  employeeId: string;
}

export default function LeaveCard({ employeeId }: LeaveCardProps) {
  const { annualPaidLeaves, refreshAnnualLeave } = useAnnualLeave(); // ✅ أخذ البيانات والدالة من السياق
  const [history, setHistory] = useState<LeaveUpdate[]>([]);
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

  // ✅ تحديث الإجازات على السيرفر
  const updateAnnualPaidLeaves = async (update: LeaveUpdate) => {
    try {
      const response = await fetch(`${BaseUrl}/api/annual-leave/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: employeeId,
          annualLeave: update.days,
          reason: update.reason,
          timestamp: update.timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update annual leave");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating annual leave:", error);
      throw error;
    }
  };

  // ✅ لما المدير يعدّل الرصيد أو يضيف إجازة جديدة
  const handleLeaveUpdate = async (update: LeaveUpdate) => {
    try {
      await updateAnnualPaidLeaves(update);
      setHistory((prev) => [update, ...prev]);
      console.log(`✅ Successfully updated leave for employee ${employeeId}`);

      // ✅ مباشرة نحدث القيمة من الـ Context
      await refreshAnnualLeave(employeeId);
    } catch (error) {
      console.error("❌ Failed to update leave:", error);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        {/* ممكن تضيف عنوان أو أي شيء */}
      </CardHeader>

      <CardContent className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-10">
          <h2 className="text-lg font-bold">Annual Paid Leave</h2>
          <p className="text-lg font-bold text-blue-700">
            {annualPaidLeaves !== null ? annualPaidLeaves : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Days</p>
        </div>

        {/* زر تعديل */}
        <div>
          <LeaveUpdateDialog
            initialDays={annualPaidLeaves ?? 0}
            onUpdate={handleLeaveUpdate}
            editHistory={history}
            trigger={
              <button className="p-1 hover:bg-gray-100 rounded">
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
