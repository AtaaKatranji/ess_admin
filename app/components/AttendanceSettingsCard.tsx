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
const SettingTile: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
    {children}
  </div>
);
export type AttendanceValues = z.infer<typeof AttendanceSchema>;

type Props = {
  institutionId: number;
  initialValues: AttendanceValues; // اجلبها من السيرفر (institution.attendance)
  onSave: (values: AttendanceValues) => Promise<void> | void;
};

export default function AttendanceSettingsCard({ initialValues, onSave }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
 
  const form = useForm<AttendanceValues>({
    resolver: zodResolver(AttendanceSchema),
    defaultValues: initialValues,
  });
  const submit = async (values: AttendanceValues) => {
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
    unit = "minutes",
    showLabel = true, // استخدم false عند وضعه داخل البطاقة
  }: {
    label: string;
    name: keyof AttendanceValues;
    hint?: string;
    min?: number;
    max?: number;
    unit?: string;
    showLabel?: boolean;
  }) => {
    const error = form.formState.errors[name]?.message?.toString();
  
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const n = Number(raw);
      const fixed = clamp(n, min, max);
      if (fixed !== n) {
        form.setValue(name, fixed, { shouldValidate: true, shouldDirty: true });
      }
    };
  
    return (
      <div className="space-y-1">
        {showLabel && (
          <label className="block text-sm font-medium text-gray-700">{label}</label>
        )}
  
        {isEditing ? (
          <div className="flex items-start gap-3">
            <div className="relative w-44">
              <input
                type="number"
                min={min}
                max={max}
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e") e.preventDefault();
                }}
                {...form.register(name, { valueAsNumber: true })}
                onBlur={handleBlur}
                className="w-full pr-16 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
              {/* ✅ البادج داخل الحقل */}
              <span className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                {unit}
              </span>
            </div>
          </div>
        ) : (
          <p className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-800">
            {String(form.getValues(name))}
            <span className="ml-1 text-xs text-gray-600">{unit}</span>
          </p>
        )}
  
        {/* عند استخدام داخل البطاقة، خليه فاضي وخلي الوصف بالبطاقة */}
        {hint && showLabel && <p className="text-xs text-gray-500">{hint}</p>}
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
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <SettingTile
      title="Late Grace Period"
      description="After this, the employee is marked as late."
    >
      <Row name="graceLateMin" label="Late Grace Period" showLabel={false} />
    </SettingTile>

    <SettingTile
      title="Absent After"
      description="If no check-in within this time after shift start, the employee is absent."
    >
      <Row name="absentAfterMin" label="Absent After" showLabel={false} />
    </SettingTile>

    <SettingTile
      title="Early Leave Grace"
      description="Allowed minutes before shift end without counting as early leave."
    >
      <Row name="earlyLeaveGraceMin" label="Early Leave Grace" showLabel={false} />
    </SettingTile>

    <SettingTile
      title="Check-in Window (Before)"
      description="Minutes allowed before shift start to check in."
    >
      <Row name="checkInWindowBeforeMin" label="Check-in Window (Before)" showLabel={false} />
    </SettingTile>

    <SettingTile
      title="Check-in Window (After)"
      description="Minutes allowed after shift start to check in."
    >
      <Row name="checkInWindowAfterMin" label="Check-in Window (After)" showLabel={false} />
    </SettingTile>
  </div>

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
