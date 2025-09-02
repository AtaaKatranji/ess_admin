"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const AttendanceSchema = z.object({
  graceLateMin: z.coerce.number().int().min(0).max(1440),
  absentAfterMin: z.coerce.number().int().min(1).max(1440),
  earlyLeaveGraceMin: z.coerce.number().int().min(0).max(1440),
  checkInWindowBeforeMin: z.coerce.number().int().min(0).max(1440),
  checkInWindowAfterMin: z.coerce.number().int().min(0).max(1440),
});



type Props = {
  institutionId: number;
  initialValues: Record<string, string>; // اجلبها من السيرفر (institution.attendance)
};

export default function AttendanceSettingsCard({ institutionId, initialValues }: Props) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<Record<string, string>>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: initialValues,
  });

  const onSubmit = async (values: Record<string, string>) => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/institutions/${institutionId}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("تم حفظ إعدادات الحضور بنجاح");
    } catch {
      toast.error("تعذّر الحفظ، حاول مجددًا");
    } finally {
      setIsSaving(false);
    }
  };

  const Row = ({
    name,
    label,
    hint,
  }: {
    name: keyof Record<string, string>;
    label: string;
    hint?: string;
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-3">
      <Label htmlFor={name} className="sm:col-span-1">{label}</Label>
      <div className="sm:col-span-2 flex items-start gap-3">
        <Input
          id={name}
          type="number"
          {...form.register(name, { valueAsNumber: true })}
          className="max-w-[200px]"
          placeholder="0"
        />
        <span className="text-sm text-muted-foreground mt-2">دقائق</span>
      </div>
      {hint ? (
        <p className="text-xs text-muted-foreground sm:col-start-2 sm:col-span-2 -mt-2">
          {hint}
        </p>
      ) : null}
      {form.formState.errors[name] && (
        <p className="text-xs text-destructive sm:col-start-2 sm:col-span-2">
          {form.formState.errors[name]?.message?.toString()}
        </p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات الحضور (Attendance)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Row
            name="graceLateMin"
            label="دقائق سماح التأخير"
            hint="بعدها يُسجّل الموظف متأخر."
          />
          <Row
            name="absentAfterMin"
            label="يُعتبر غيابًا بعد"
            hint="إذا لم يتم تسجيل الدخول حتى هذه المدة من بداية الدوام."
          />
          <Row
            name="earlyLeaveGraceMin"
            label="سماح الانصراف المبكر"
            hint="دقائق سماح قبل نهاية الدوام لا تُعدّ انصرافًا مبكرًا."
          />
          <Row
            name="checkInWindowBeforeMin"
            label="نافذة تسجيل الدخول قبل البداية"
            hint="يسمح بالتسجيل قبل بداية الدوام بهذه المدة."
          />
          <Row
            name="checkInWindowAfterMin"
            label="نافذة تسجيل الدخول بعد البداية"
            hint="يسمح بالتسجيل بعد بداية الدوام بهذه المدة."
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset(initialValues)}
              disabled={isSaving}
            >
              إلغاء التغييرات
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
