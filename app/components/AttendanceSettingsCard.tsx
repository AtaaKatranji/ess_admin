"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
import { Edit, Save, X } from "lucide-react";

const AttendanceSchema = z.object({
  graceLateMin: z.coerce.number().int().min(0).max(1440),
  absentAfterMin: z.coerce.number().int().min(1).max(1440),
  earlyLeaveGraceMin: z.coerce.number().int().min(0).max(1440),
  checkInWindowBeforeMin: z.coerce.number().int().min(0).max(1440),
  checkInWindowAfterMin: z.coerce.number().int().min(0).max(1440),
});

export type AttendanceValues = z.infer<typeof AttendanceSchema>;

type Props = {
  institutionId: number;
  initialValues: Record<string, string>; // اجلبها من السيرفر (institution.attendance)
  onSave: (values: Record<string, string>) => Promise<void> | void;
};

export default function AttendanceSettingsCard({ initialValues, onSave }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 
  const form = useForm<Record<string, string>>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: initialValues,
  });
  const submit = async (values: Record<string, string>) => {
    try {
      setIsSaving(true);
      await onSave(values);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };
  // const onSubmit = async (values: Record<string, string>) => {
  //   try {
  //     setIsSaving(true);
  //     const res = await fetch(`/api/institutions/${institutionId}/attendance`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(values),
  //     });
  //     if (!res.ok) throw new Error("Failed");
  //     toast.success("تم حفظ إعدادات الحضور بنجاح");
  //   } catch {
  //     toast.error("تعذّر الحفظ، حاول مجددًا");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };
  const clamp = (n: number, min = 0, max = 1440) =>
    Number.isFinite(n) ? Math.min(Math.max(n, min), max) : min;
  const Row = ({
    label,
    name,
    hint,
    min = 0,
    max = 1440,
  }: {
    label: string;
    name: keyof AttendanceValues;
    hint?: string;
    min?: number;
    max?: number;
  }) => {
    const error = form.formState.errors[name]?.message?.toString();
  
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // current raw value (string); coerce to number
      const raw = e.target.value;
      const n = Number(raw);
      const fixed = clamp(n, min, max);
  
      // إذا تغيّرت بعد التصحيح، حدّث قيمة الفورم وحقّلها
      if (fixed !== n) {
        form.setValue(name, fixed.toString(), { shouldValidate: true, shouldDirty: true });
      }
    };
  
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
  
        {isEditing ? (
          <div className="flex items-start gap-3">
            <input
              type="number"
              min={min}
              max={max}
              // منع كتابة علامة السالب مباشرة (اختياري):
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e") e.preventDefault();
              }}
              {...form.register(name, { valueAsNumber: true })}
              onBlur={handleBlur}              // ✅ التصحيح التلقائي
              className="w-40 px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
            />
            <span className="mt-2 text-sm text-gray-600">minutes</span>
          </div>
        ) : (
          <p className="bg-gray-100 px-4 py-2 rounded-md text-sm text-gray-800 w-fit">
            {String(form.getValues(name))} minutes
          </p>
        )}
  
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  };
  

  return (
    <div className="m-6 p-6 bg-white rounded-xl shadow-md space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-800">Attendance Settings</h2>

      <button
        onClick={() => {
          if (isEditing) {
            form.reset();
          }
          setIsEditing((p) => !p);
        }}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
      >
        {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
        {isEditing ? "Cancel" : "Edit"}
      </button>
    </div>

    <form className="space-y-6" onSubmit={form.handleSubmit(submit)}>
      <Row
        name="graceLateMin"
        label="Late Grace Period"
        hint="After this, the employee is marked as late."
      />

      <Row
        name="absentAfterMin"
        label="Absent After"
        hint="If no check-in within this time after shift start, the employee is absent."
      />

      <Row
        name="earlyLeaveGraceMin"
        label="Early Leave Grace"
        hint="Allowed minutes before shift end without counting as early leave."
      />

      <Row
        name="checkInWindowBeforeMin"
        label="Check-in Window (Before)"
        hint="Minutes allowed before shift start to check in."
      />

      <Row
        name="checkInWindowAfterMin"
        label="Check-in Window (After)"
        hint="Minutes allowed after shift start to check in."
      />

      {isEditing && (
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-70"
          >
            <div className="flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </div>
          </button>
        </div>
      )}
    </form>
  </div>
  );
}
