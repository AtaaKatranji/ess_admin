"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";

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

// const MOCK_ADJUSTMENTS: Adjustment[] = [
//   {
//     id: 1,
//     logDate: "2025-12-16",
//     oldCheckIn: "09:35:00",
//     oldCheckOut: null,
//     newCheckIn: "08:47:00",
//     newCheckOut: null,
//     editedByName: "Supervisor Ahmad",
//     editedAt: "2025-12-16 10:12",
//     note: "Employee forgot to check-in on time.",
//   },
//   {
//     id: 2,
//     logDate: "2025-12-15",
//     oldCheckIn: "09:50:00",
//     oldCheckOut: "15:10:00",
//     newCheckIn: "09:35:00",
//     newCheckOut: "15:55:00",
//     editedByName: "Supervisor Rami",
//     editedAt: "2025-12-15 16:05",
//     note: "Adjusted based on gate log.",
//   },
//   {
//     id: 3,
//     logDate: "2025-12-10",
//     oldCheckIn: "10:05:00",
//     oldCheckOut: "14:40:00",
//     newCheckIn: "09:22:00",
//     newCheckOut: "16:21:00",
//     editedByName: "Supervisor Ahmad",
//     editedAt: "2025-12-10 18:40",
//     note: "Correction after manager review.",
//   },
// ];

function formatTime(t: string | null) {
  if (!t) return "—";
  // keep "HH:mm" فقط
  return t.slice(0, 5);
}

function formatDate(d: string) {
  // بسيطة: YYYY-MM-DD
  return d;
}

function formatDateTime(d: string) {
    return new Date(d).toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

export default function AttendanceAdjustmentsTab({
  employeeId,
  selectedMonth,
  slug,
}: {
  employeeId: number | string;
  selectedMonth: Date; // مثال: "2025-12"
  slug: string;
}) {
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<Adjustment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // حالياً mock، لاحقاً استبدله بالبيانات القادمة من السيرفر
  useEffect(() => {
    const controller = new AbortController();
  
    const fetchAdjustments = async () => {
      try {
        setLoading(true);
        setError(null);
  
        const monthKey = selectedMonth.toISOString().slice(0, 7); // YYYY-MM
  
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/institutions/${slug}/checks/edit-logs?userId=${employeeId}&month=${monthKey}`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );
  
        if (!res.ok) {
          throw new Error("Failed to load attendance adjustments");
        }
  
        const json = await res.json();
        setData(json.items || []);
      } catch (err ) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
          setError("Failed to load adjustments");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchAdjustments();
  
    return () => controller.abort();
  }, [employeeId, selectedMonth]);
  const filteredData = React.useMemo(() => {
    if (!query.trim()) return data;
  
    const q = query.toLowerCase();
    return data.filter((x) =>
      x.logDate.includes(q) ||
      x.editedByName.toLowerCase().includes(q) ||
      (x.note || "").toLowerCase().includes(q) ||
      `${x.oldCheckIn ?? ""} ${x.oldCheckOut ?? ""} ${x.newCheckIn ?? ""} ${x.newCheckOut ?? ""}`.includes(q)
    );
  }, [query, data]);
  
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
      {loading ? (
    <div className="p-6 text-sm text-muted-foreground">Loading adjustments…</div>
  ) : error ? (
    <div className="p-6 text-sm text-red-500">{error}</div>
  ) : filteredData.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No adjustments found for this month.
          </div>
        ) : (
          <div className="divide-y">
            {filteredData.map((item) => (
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
                      <span>{formatDateTime(item.editedAt)}</span>
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
