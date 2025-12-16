"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Adjustment = {
  id: number;
  logDate: string; // YYYY-MM-DD
  oldCheckIn: string | null;  // "09:15:00"
  oldCheckOut: string | null; // "15:30:00"
  newCheckIn: string | null;
  newCheckOut: string | null;
  editedByName: string;
  editedAt: string; // ISO or "YYYY-MM-DD HH:mm"
  note: string;
};

const MOCK_ADJUSTMENTS: Adjustment[] = [
  {
    id: 1,
    logDate: "2025-12-16",
    oldCheckIn: "09:35:00",
    oldCheckOut: null,
    newCheckIn: "08:47:00",
    newCheckOut: null,
    editedByName: "Supervisor Ahmad",
    editedAt: "2025-12-16 10:12",
    note: "Employee forgot to check-in on time.",
  },
  {
    id: 2,
    logDate: "2025-12-15",
    oldCheckIn: "09:50:00",
    oldCheckOut: "15:10:00",
    newCheckIn: "09:35:00",
    newCheckOut: "15:55:00",
    editedByName: "Supervisor Rami",
    editedAt: "2025-12-15 16:05",
    note: "Adjusted based on gate log.",
  },
  {
    id: 3,
    logDate: "2025-12-10",
    oldCheckIn: "10:05:00",
    oldCheckOut: "14:40:00",
    newCheckIn: "09:22:00",
    newCheckOut: "16:21:00",
    editedByName: "Supervisor Ahmad",
    editedAt: "2025-12-10 18:40",
    note: "Correction after manager review.",
  },
];

function formatTime(t: string | null) {
  if (!t) return "—";
  // keep "HH:mm" فقط
  return t.slice(0, 5);
}

function formatDate(d: string) {
  // بسيطة: YYYY-MM-DD
  return d;
}

export default function AttendanceAdjustmentsTab({
  employeeId,
  selectedMonth,
}: {
  employeeId: number | string;
  selectedMonth: Date; // مثال: "2025-12"
}) {
  const [query, setQuery] = React.useState("");

  // حالياً mock، لاحقاً استبدله بالبيانات القادمة من السيرفر
  const data = React.useMemo(() => {
    const monthFiltered = MOCK_ADJUSTMENTS.filter((x) => x.logDate.startsWith(selectedMonth.toISOString().slice(0, 7)));
    if (!query.trim()) return monthFiltered;

    const q = query.toLowerCase();
    return monthFiltered.filter((x) => {
      return (
        x.logDate.includes(q) ||
        x.editedByName.toLowerCase().includes(q) ||
        x.note.toLowerCase().includes(q) ||
        `${x.oldCheckIn ?? ""} ${x.oldCheckOut ?? ""} ${x.newCheckIn ?? ""} ${x.newCheckOut ?? ""}`.includes(q)
      );
    });
  }, [query, selectedMonth]);
  
  return (
    <div className="space-y-4">
      {/* Header tools */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search adjustments (date, supervisor, note...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="secondary" className="ml-auto">
          Employee: {employeeId}
        </Badge>
      </div>

      <Card className="p-0 overflow-hidden">
        {data.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No adjustments found for this month.
          </div>
        ) : (
          <div className="divide-y">
            {data.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold">
                      {formatDate(item.logDate)}
                      <Badge variant="outline" className="ml-2">
                        Edited
                      </Badge>
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      Edited by <span className="font-medium text-foreground">{item.editedByName}</span>{" "}
                      <span className="mx-1">•</span>
                      <span>{item.editedAt}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="font-medium">Before</div>
                    <div className="text-muted-foreground">
                      Check-in: {formatTime(item.oldCheckIn)}{" "}
                      <span className="mx-2">|</span>
                      Check-out: {formatTime(item.oldCheckOut)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">After</div>
                    <div className="text-muted-foreground">
                      Check-in: {formatTime(item.newCheckIn)}{" "}
                      <span className="mx-2">|</span>
                      Check-out: {formatTime(item.newCheckOut)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-sm">
                  <div className="font-medium">Note</div>
                  <div className="text-muted-foreground">{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
