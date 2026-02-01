"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect } from "react";
import { useI18n } from "@/app/context/I18nContext";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

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

export default function AttendanceAdjustmentsTab({
  employeeId,
  selectedMonth,
  slug,
}: {
  employeeId: number | string;
  selectedMonth: Date; // مثال: "2025-12"
  slug: string;
}) {
  const { t, lang, dir } = useI18n();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<Adjustment[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function formatTime(t_str: string | null) {
    if (!t_str) return "—";
    return t_str.slice(0, 5);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatDateTime(d: string) {
    return new Date(d).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
          setError(t("hourlyLeaves.toast.fetchError"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdjustments();

    return () => controller.abort();
  }, [employeeId, selectedMonth, slug, t]);

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
    <div className="space-y-4" dir={dir}>
      {/* Header tools */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", dir === "rtl" ? "right-2" : "left-2")} />
          <Input
            placeholder={t("adjustments.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={cn("w-full", dir === "rtl" ? "pr-8" : "pl-8")}
          />
        </div>
        <Badge variant="secondary" className={cn(dir === "rtl" ? "mr-auto" : "ml-auto")}>
          {t("adjustments.employee")}: {employeeId}
        </Badge>
      </div>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">{t("common.loading")}</div>
        ) : error ? (
          <div className="p-6 text-sm text-red-500">{error}</div>
        ) : filteredData.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            {t("adjustments.noAdjustments")}
          </div>
        ) : (
          <div className="divide-y">
            {filteredData.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className={cn(dir === "rtl" && "text-right")}>
                    <div className="text-base font-semibold">
                      {formatDate(item.logDate)}
                      <Badge variant="outline" className="mx-2">
                        {t("adjustments.edited")}
                      </Badge>
                    </div>

                    <div className="mt-1 text-sm text-muted-foreground">
                      {t("adjustments.editedBy")} <span className="font-medium text-foreground">{item.editedByName}</span>{" "}
                      <span className="mx-1">•</span>
                      <span dir="ltr">{formatDateTime(item.editedAt)}</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className={cn(dir === "rtl" && "text-right")}>
                    <div className="font-medium text-primary mb-1">{t("adjustments.before")}</div>
                    <div className="text-muted-foreground flex items-center gap-2 tabular-nums" dir="ltr">
                      <span>{t("adjustments.checkIn")}: {formatTime(item.oldCheckIn)}</span>
                      <span className="text-muted-foreground/30">|</span>
                      <span>{t("adjustments.checkOut")}: {formatTime(item.oldCheckOut)}</span>
                    </div>
                  </div>
                  <div className={cn(dir === "rtl" && "text-right")}>
                    <div className="font-medium text-primary mb-1">{t("adjustments.after")}</div>
                    <div className="text-muted-foreground flex items-center gap-2 tabular-nums" dir="ltr">
                      <span>{t("adjustments.checkIn")}: {formatTime(item.newCheckIn)}</span>
                      <span className="text-muted-foreground/30">|</span>
                      <span>{t("adjustments.checkOut")}: {formatTime(item.newCheckOut)}</span>
                    </div>
                  </div>
                </div>

                <div className={cn("mt-3 text-sm", dir === "rtl" && "text-right")}>
                  <div className="font-medium mb-1">{t("adjustments.note")}</div>
                  <div className="text-muted-foreground whitespace-pre-wrap">{item.note}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
