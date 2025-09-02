"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
import { Edit, Save, X } from "lucide-react";

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
