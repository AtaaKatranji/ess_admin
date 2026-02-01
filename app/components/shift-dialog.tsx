"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PlusCircle, Trash2, Save, Clock, Settings, AlertCircle, Users, Coffee } from "lucide-react"
import { Shift, ShiftPolicy } from "@/app/types/Shift";
import * as shiftAPI from '@/app/api/shifts/shifts'
import { toast } from "react-toastify"
import { useI18n } from "@/app/context/I18nContext";


const BaseURL = process.env.NEXT_PUBLIC_API_URL;
// const BaseURL = process.env.NEXT_PUBLIC_API_URL;
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Sample initial shift data

type ShiftFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  shift?: Shift | null
  onSave: (shift: Shift) => void
}
export default function ShiftForm({ open, onOpenChange, isEditing, shift, onSave }: ShiftFormProps) {
  const { t, lang } = useI18n();
  const initialShift = {
    name: "",
    mode: "standard",
    startTime: "09:00",
    endTime: "17:00",
    days: [],
    overrides: {},
    lateMultiplier: 1,
    extraMultiplier: 1,
    lateLimit: 1,
    extraLimit: 1,
    breaks: [],
    institutionId: 0,
    isDirty: false,
    policyEnabled: false,      // ✅ جديد
    policyId: undefined  // ✅ جديد (اختياري حسب نوع Shift عندك)


  }

  const [newShift, setNewShift] = useState<Shift>(initialShift)
  const [policies, setPolicies] = useState<ShiftPolicy[]>([]);
  const [editPolicyId, setEditPolicyId] = useState<number | null>(null);
  useEffect(() => {
    if (shift) {
      let overrides = shift.overrides;
      if (typeof overrides === "string") {
        try {
          overrides = JSON.parse(overrides);
        } catch {
          overrides = {};
        }
      }
      // Add isDirty:false for each breakType
      const breaksWithFlags = (shift.breakTypes || []).map(b => ({ ...b, isDirty: false }));
      setNewShift({ ...shift, overrides, breakTypes: breaksWithFlags });
    } else {
      setNewShift(initialShift);
    }
  }, [shift, open])

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const res = await fetch(`${BaseURL}/api/shift-policies?institutionId=${newShift.institutionId}`);
        const data: ShiftPolicy[] = await res.json();
        setPolicies(data);
      } catch (err) {
        console.error("Failed to fetch policies", err);
      }
    }
    if (open) fetchPolicies();
  }, [open, newShift.institutionId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewShift((prev: Shift) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleModeChange = (mode: string) => {
    setNewShift((prev: Shift) => ({
      ...prev,
      mode,
      // Clear overrides when switching to standard mode
      overrides: mode === "standard" ? {} : prev.overrides,
    }))
  }

  const handleDayToggle = (day: string) => {
    setNewShift((prev: Shift) => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter((d: string) => d !== day) : [...prev.days, day],
    }))
  }

  const handleOverrideChange = (day: string, field: "start" | "end", value: string) => {
    setNewShift((prev: Shift) => {
      const currentOverride = prev.overrides?.[day] ?? { start: prev.startTime, end: prev.endTime };
      console.log(currentOverride);
      return {
        ...prev,
        overrides: {
          ...prev.overrides,
          [day]: {
            ...currentOverride,
            [field]: value,
          },
        },
      };
    });
  };


  const removeOverride = (day: string) => {
    setNewShift((prev: Shift) => {
      const newOverrides = { ...prev.overrides }
      delete newOverrides[day]
      return {
        ...prev,
        overrides: newOverrides,
      }
    })
  }

  const handleSubmit = () => {
    onSave(newShift);
  };
  return (
    <div className={`container mx-auto p-4 ${lang === "ar" ? "font-[Tajawal]" : ""
      }`}>
      {/* Dialog for Adding and Editing Shifts */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader >
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? t("shiftForm.title.edit") : t("shiftForm.title.add")}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="space-y-6"
          >
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("shiftForm.basic.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">{t("shiftForm.basic.shiftName")}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newShift.name}
                    onChange={handleInputChange}
                    placeholder={t("shiftForm.basic.shiftNamePlaceholder")}
                    required
                  />
                </div>

                {/* Mode Selection */}
                <div>
                  <Label className="text-base font-medium">{t("shiftForm.basic.mode")}</Label>
                  <RadioGroup value={newShift.mode} onValueChange={handleModeChange} className="flex gap-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {t("shiftForm.basic.mode.standard")}
                        <span className="text-sm text-gray-500">{t("shiftForm.basic.mode.standardHint")}</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {t("shiftForm.basic.mode.advanced")}
                        <span className="text-sm text-gray-500">t("shiftForm.basic.mode.advancedHint")</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t("shiftForm.schedule.title")}
                  <Badge variant={newShift.mode === "advanced" ? "default" : "secondary"}>{newShift.mode}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Base Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">
                      {newShift.mode === "advanced" ? t("shiftForm.schedule.defaultStart") : t("shiftForm.schedule.start")}
                    </Label>
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={newShift.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">{newShift.mode === "advanced" ? t("shiftForm.schedule.defaultEnd") : t("shiftForm.schedule.end")}</Label>
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={newShift.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* Days Selection */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">{t("shiftForm.schedule.workingDays")}</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {daysOfWeek.map((day: string) => (
                      <Button
                        key={day}
                        type="button"
                        variant={newShift.days.includes(day) ? "default" : "outline"}
                        onClick={() => handleDayToggle(day)}
                        size="sm"
                      >
                        {t(`days.${day}`)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Advanced Mode: Day-specific Overrides */}
                {newShift.mode === "advanced" && newShift.days.length > 0 && (
                  <div className="space-y-4">
                    <Separator />
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Settings className="h-4 w-4" />
                        <Label className="text-base font-medium">{t("shiftForm.schedule.overridesTitle")}</Label>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium">{t("shiftForm.schedule.advancedMode")}</p>
                            <p>
                              {t("shiftForm.schedule.advancedHelp")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        {newShift.days.map((day: string) => {
                          const hasOverride = newShift.overrides?.[day];
                          return (
                            <div key={day} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{day}</span>
                                  {hasOverride && (
                                    <Badge variant="outline" className="text-xs">
                                      {t("shiftForm.schedule.customTimes")}
                                    </Badge>
                                  )}
                                </div>
                                {hasOverride ? (
                                  <Button type="button" variant="outline" size="sm" onClick={() => removeOverride(day)}>
                                    {t("shiftForm.schedule.useDefault")}
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOverrideChange(day, "start", newShift.startTime)}
                                  >
                                    {t("shiftForm.schedule.setCustom")}
                                  </Button>
                                )}
                              </div>

                              {hasOverride ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-sm">{t("shiftForm.schedule.start")}</Label>
                                    <Input
                                      type="time"
                                      value={newShift.overrides![day]?.start || newShift.startTime}
                                      onChange={(e) => handleOverrideChange(day, "start", e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">{t("shiftForm.schedule.end")}</Label>
                                    <Input
                                      type="time"
                                      value={newShift.overrides![day]?.end || newShift.endTime}
                                      onChange={(e) => handleOverrideChange(day, "end", e.target.value)}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {t("shiftForm.schedule.usingDefault")} {newShift.startTime} - {newShift.endTime}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Multipliers and Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("shiftForm.policy.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Yes/No toggle */}
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    {t("shiftForm.policy.enableLabel")}
                  </Label>

                  <RadioGroup
                    value={newShift.policyEnabled ? "yes" : "no"}
                    onValueChange={(val) => {
                      const enabled = val === "yes";
                      setNewShift((prev) => ({
                        ...prev,
                        policyEnabled: enabled,
                        policyId: enabled ? prev.policyId : undefined, // إذا No → امسح policyId
                      }));
                    }}
                    className="flex gap-6 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="policy-yes" />
                      <Label htmlFor="policy-yes">{t("common.yes")}</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="policy-no" />
                      <Label htmlFor="policy-no">{t("common.no")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* محتوى policy يظهر فقط إذا Yes */}
                {newShift.policyEnabled && (
                  <>
                    <div className="flex gap-2 items-center">
                      <Select
                        value={newShift.policyId?.toString() ?? ""}
                        onValueChange={(val) => {
                          if (val === "new") {
                            // TODO: افتح مودال create policy
                            return;
                          }
                          setNewShift({ ...newShift, policyId: Number(val) });
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder={t("shiftForm.policy.selectPlaceholder")} />
                        </SelectTrigger>

                        <SelectContent>
                          {policies.map((p: ShiftPolicy) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">{t("shiftForm.policy.createNew")}</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!newShift.policyId}
                        onClick={() => setEditPolicyId(newShift.policyId!)}
                      >
                        {t("shiftForm.policy.edit")}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(() => {
                        const selected = policies.find((p) => p.id === newShift.policyId);
                        return (
                          <>
                            <div>
                              <Label htmlFor="lateMultiplier">{t("shiftForm.policy.lateMultiplier")}</Label>
                              <Input id="lateMultiplier" type="number" value={selected?.lateMultiplier ?? ""} readOnly />
                            </div>

                            <div>
                              <Label htmlFor="lateLimit">{t("shiftForm.policy.lateLimit")}</Label>
                              <Input id="lateLimit" type="number" value={selected?.lateLimit ?? ""} readOnly />
                            </div>

                            <div>
                              <Label htmlFor="extraMultiplier">{t("shiftForm.policy.extraMultiplier")}</Label>
                              <Input id="extraMultiplier" type="number" value={selected?.extraMultiplier ?? ""} readOnly />
                            </div>

                            <div>
                              <Label htmlFor="extraLimit">{t("shiftForm.policy.extraLimit")}</Label>
                              <Input id="extraLimit" type="number" value={selected?.extraLimit ?? ""} readOnly />
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Breaks Section */}

            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Coffee className="h-5 w-5 text-blue-500" />
                  {t("shiftForm.breaks.title")}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {t("shiftForm.breaks.desc")}
                </p>
              </div>

              <Card className="border-2 border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50/50 border-b">
                  <CardTitle className="text-lg font-medium text-gray-800 flex items-center justify-between">
                    <span>{t("shiftForm.breaks.types")}</span>
                    <Badge variant="secondary" className="text-xs">
                      {newShift.breakTypes?.length || 0} {t("shiftForm.breaks.configured")}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {newShift.breakTypes?.map((breakItem, index) => (
                      <div
                        key={breakItem.id}
                        className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                          {/* Break Name */}
                          <div className="md:col-span-4">
                            <Label htmlFor={`break-name-${index}`} className="text-sm font-medium text-gray-700 mb-2 block">
                              {t("shiftForm.breaks.breakName")}
                            </Label>
                            <Input
                              id={`break-name-${index}`}
                              value={breakItem.name}
                              onChange={(e) => {
                                const updatedBreaks = [...newShift.breakTypes!]
                                updatedBreaks[index] = {
                                  ...updatedBreaks[index],
                                  name: e.target.value,
                                  isDirty: true // Mark dirty!
                                };
                                setNewShift({ ...newShift, breakTypes: updatedBreaks });
                              }}
                              placeholder={t("shiftForm.breaks.breakNamePlaceholder")}
                              className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          {/* Duration */}
                          <div className="md:col-span-2">
                            <Label
                              htmlFor={`break-duration-${index}`}
                              className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1"
                            >
                              <Clock className="h-3 w-3" />
                              {t("shiftForm.breaks.duration")}
                            </Label>
                            <div className="relative">
                              <Input
                                id={`break-duration-${index}`}
                                type="number"
                                value={breakItem.duration}
                                onChange={(e) => {
                                  const updatedBreaks = [...newShift.breakTypes!]
                                  updatedBreaks[index] = {
                                    ...updatedBreaks[index],
                                    duration: Number.parseInt(e.target.value, 10),
                                    isDirty: true // Mark dirty!
                                  };
                                  setNewShift({ ...newShift, breakTypes: updatedBreaks })
                                }}
                                placeholder="30"
                                min="1"
                                className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                                min
                              </span>
                            </div>
                          </div>

                          {/* Max Usage */}
                          <div className="md:col-span-2">
                            <Label
                              htmlFor={`break-usage-${index}`}
                              className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1"
                            >
                              <Users className="h-3 w-3" />
                              {t("shiftForm.breaks.maxPerDay")}
                            </Label>
                            <Input
                              id={`break-usage-${index}`}
                              type="number"
                              value={breakItem.maxUsagePerDay || 1}
                              onChange={(e) => {
                                const updatedBreaks = [...newShift.breakTypes!]
                                updatedBreaks[index] = {
                                  ...updatedBreaks[index],
                                  maxUsagePerDay: Number.parseInt(e.target.value, 10) || 1,
                                  isDirty: true // Mark dirty!
                                }
                                setNewShift({ ...newShift, breakTypes: updatedBreaks })
                              }}
                              placeholder="1"
                              min="1"
                              className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </div>

                          {/* Icon */}
                          <div className="md:col-span-3">
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">{t("shiftForm.breaks.icon")}</Label>
                            <Select
                              value={breakItem.icon}
                              onValueChange={(value) => {
                                const updatedBreaks = [...newShift.breakTypes!]
                                updatedBreaks[index] = {
                                  ...updatedBreaks[index],
                                  icon: value,
                                  isDirty: true // Mark dirty!
                                };
                                setNewShift({ ...newShift, breakTypes: updatedBreaks })
                              }}
                            >
                              <SelectTrigger className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder={t("shiftForm.breaks.chooseIcon")} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="coffee">☕ Coffee</SelectItem>
                                <SelectItem value="food">🍴 Food</SelectItem>
                                <SelectItem value="tea">🍵 Tea</SelectItem>
                                <SelectItem value="rest">🛋️ Rest</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Delete Button */}
                          <div className="md:col-span-1 flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {

                                const res = await shiftAPI.deleteBreak(breakItem.id!)
                                if (res) {
                                  toast.success(t("shiftForm.toast.breakDeleted"), {
                                    autoClose: 1500, // duration in milliseconds
                                  });
                                }
                                const updatedBreaks = newShift.breakTypes!.filter((_, i) => i !== index)
                                setNewShift({ ...newShift, breakTypes: updatedBreaks })

                              }}
                              className="h-10 w-10 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Helper text */}
                        <div className="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                          <strong>{t("shiftForm.breaks.tip")}</strong> {t("shiftForm.breaks.tipText")} {breakItem.maxUsagePerDay || 1} time
                          {(breakItem.maxUsagePerDay || 1) > 1 ? "s" : ""} per day, each lasting {breakItem.duration || 0}{" "}
                          minutes.
                        </div>
                      </div>
                    ))}

                    {/* Add Break Button */}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNewShift({
                            ...newShift,
                            breakTypes: [
                              ...(newShift.breakTypes || []),
                              {
                                id: `temp-${Date.now()}`,
                                name: "",
                                duration: 0,
                                icon: "coffee",
                                maxUsagePerDay: 1,
                                isDirty: true, // New, so dirty
                              },
                            ],
                          })
                        }}
                        className="h-12 px-6 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                      >
                        <PlusCircle className="mr-2 h-5 w-5" />
                        {t("shiftForm.breaks.addAnother")}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        {t("shiftForm.breaks.addHelp")}
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  {newShift.breakTypes && newShift.breakTypes.length > 0 && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">{t("shiftForm.breaks.summary")}</h4>
                      <div className="text-sm text-blue-800">
                        <p>
                          {t("shiftForm.breaks.totalTypes")} <strong>{newShift.breakTypes.length}</strong>
                        </p>
                        <p>
                          {t("shiftForm.breaks.totalTime")}{" "}
                          <strong>
                            {newShift.breakTypes.reduce(
                              (total: number, breakItem: { duration: number; maxUsagePerDay: number }) => total + breakItem.duration * (breakItem.maxUsagePerDay || 1),
                              0,
                            )}{" "}
                            minutes
                          </strong>
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {t("shiftForm.footer.cancel")}
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? t("shiftForm.footer.saveChanges") : t("shiftForm.footer.addShift")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Policy Modal */}
      <Dialog open={!!editPolicyId} onOpenChange={(val) => !val && setEditPolicyId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("shiftForm.policy.edit")}</DialogTitle>
          </DialogHeader>

          {(() => {
            const policy = policies.find(p => p.id === editPolicyId);
            if (!policy) return <p>Loading...</p>;
            return (
              <div className="space-y-4">
                <div>
                  <Label>{t("shiftForm.policy.lateMultiplier")}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={policy.lateMultiplier}
                    onChange={(e) => {
                      const updated = { ...policy, lateMultiplier: Number(e.target.value) };
                      setPolicies(policies.map(p => p.id === policy.id ? updated : p));
                    }}
                  />
                </div>
                <div>
                  <Label>{t("shiftForm.policy.lateLimit")}</Label>
                  <Input
                    type="number"
                    value={policy.lateLimit}
                    onChange={(e) => {
                      const updated = { ...policy, lateLimit: Number(e.target.value) };
                      setPolicies(policies.map(p => p.id === policy.id ? updated : p));
                    }}
                  />
                </div>
                <div>
                  <Label>{t("shiftForm.policy.extraMultiplier")}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={policy.extraMultiplier}
                    onChange={(e) => {
                      const updated = { ...policy, extraMultiplier: Number(e.target.value) };
                      setPolicies(policies.map(p => p.id === policy.id ? updated : p));
                    }}
                  />
                </div>
                <div>
                  <Label>{t("shiftForm.policy.extraLimit")}</Label>
                  <Input
                    type="number"
                    value={policy.extraLimit}
                    onChange={(e) => {
                      const updated = { ...policy, extraLimit: Number(e.target.value) };
                      setPolicies(policies.map(p => p.id === policy.id ? updated : p));
                    }}
                  />
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditPolicyId(null)}>
              {t("shiftForm.footer.cancel")}
            </Button>
            <Button
              type="button"
              onClick={async () => {
                // TODO: Save to API
                toast.success(t("shiftForm.toast.policyUpdated"));
                setEditPolicyId(null);
              }}
            >
              Save Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
