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
import { Shift } from "@/app/types/Shift";
import * as shiftAPI from '@/app/api/shifts/shifts'
import { toast } from "react-toastify"

// const BaseURL = process.env.NEXT_PUBLIC_API_URL;
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

// Sample initial shift data

type ShiftFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isEditing: boolean
  shift?: Shift | null
  onSave : (shift: Shift) => void
  institutionKey: string
}
export default function ShiftForm({open, onOpenChange, isEditing, shift, onSave , institutionKey }: ShiftFormProps){
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
    institutionKey: institutionKey,
    isDirty: false,
  }

  const [newShift, setNewShift] = useState<Shift>(initialShift)
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
 
  // const resetNewShift = () => {
  //   setNewShift(initialShift)
  //   setIsEditing(false)
  // }

  // const addShift = async() => {
  //   console.log("Adding shift:", newShift)
  //   if (!newShift.name || !newShift.startTime || !newShift.endTime || newShift.days.length === 0) {
  //       toast.error('Please fill all required fields')
  //       return
  //     }
  
  //     try {
  //       const shiftResponse = await fetch(`${BaseURL}/shifts/`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify(newShift), // No need to set employees here
  //       })
  
  //       if (!shiftResponse.ok) {
  //         const errorData = await shiftResponse.json()
  //         throw new Error(errorData.message || 'Failed to add shift')
  //       }
  
  //       const shiftData = await shiftResponse.json()
  //       console.log('Created shift:', shiftData)
  
  //       // Handle breaks
  //       if (newShift.breaks && newShift.breaks.length > 0) {
  //         const breakPromises = newShift.breaks.map(breakItem =>
  //           fetch(`${BaseURL}/break/break-types`, {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({ ...breakItem, shiftId: shiftData.id })
  //           })
  //         )
  //         await Promise.all(breakPromises)
  //       }
  
        
  //       resetNewShift()
  //       //setIsOpen(false)
  //       toast.success('Shift added successfully', { autoClose: 1500 })
  //     } catch (error) {
  //       console.error('Error adding shift:', error)
  //       toast.error(`Failed to add shift: ${error instanceof Error ? error.message : 'Unknown error'}`, { autoClose: 1500 })
  //     }
    
  //   //setIsOpen(false)
  //   resetNewShift()
  // }

  // const updateShift = () => {
  //   console.log("Updating shift:", newShift)
  //   //setIsOpen(false)
  //   resetNewShift()
  // }
  const handleSubmit = () => {
    onSave(newShift);
  };
  return (
    <div className="container mx-auto p-4">
      {/* Dialog for Adding and Editing Shifts */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader >
            <DialogTitle className="text-xl font-semibold">
              {isEditing ? "Edit Current Shift" : "Add New Shift"}
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
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Shift Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newShift.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Morning Shift"
                    required
                  />
                </div>

                {/* Mode Selection */}
                <div>
                  <Label className="text-base font-medium">Shift Mode</Label>
                  <RadioGroup value={newShift.mode} onValueChange={handleModeChange} className="flex gap-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Standard
                        <span className="text-sm text-gray-500">(Same time for all days)</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Advanced
                        <span className="text-sm text-gray-500">(Custom times per day)</span>
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
                  Schedule Configuration
                  <Badge variant={newShift.mode === "advanced" ? "default" : "secondary"}>{newShift.mode}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Base Times */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">
                      {newShift.mode === "advanced" ? "Default Start Time" : "Start Time"}
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
                    <Label htmlFor="endTime">{newShift.mode === "advanced" ? "Default End Time" : "End Time"}</Label>
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
                  <Label className="text-sm font-medium text-gray-700">Working Days</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {daysOfWeek.map((day: string) => (
                      <Button
                        key={day}
                        type="button"
                        variant={newShift.days.includes(day) ? "default" : "outline"}
                        onClick={() => handleDayToggle(day)}
                        size="sm"
                      >
                        {day.slice(0, 3)}
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
                        <Label className="text-base font-medium">Day-specific Time Overrides</Label>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium">Advanced Mode</p>
                            <p>
                              Set custom start and end times for specific days. Days without overrides will use the
                              default times above.
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
                                      Custom Times
                                    </Badge>
                                  )}
                                </div>
                                {hasOverride ? (
                                  <Button type="button" variant="outline" size="sm" onClick={() => removeOverride(day)}>
                                    Use Default
                                  </Button>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOverrideChange(day, "start", newShift.startTime)}
                                  >
                                    Set Custom Times
                                  </Button>
                                )}
                              </div>

                              {hasOverride ? (
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-sm">Start Time</Label>
                                    <Input
                                      type="time"
                                      value={newShift.overrides![day]?.start || newShift.startTime}
                                      onChange={(e) => handleOverrideChange(day, "start", e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-sm">End Time</Label>
                                    <Input
                                      type="time"
                                      value={newShift.overrides![day]?.end || newShift.endTime}
                                      onChange={(e) => handleOverrideChange(day, "end", e.target.value)}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  Using default times: {newShift.startTime} - {newShift.endTime}
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
                <CardTitle className="text-lg">Multipliers & Limits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="lateMultiplier">Late Multiplier</Label>
                    <Input
                      id="lateMultiplier"
                      name="lateMultiplier"
                      type="number"
                      step="0.1"
                      value={newShift.lateMultiplier}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lateLimit">Late Limit (min)</Label>
                    <Input
                      id="lateLimit"
                      name="lateLimit"
                      type="number"
                      value={newShift.lateLimit}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="extraMultiplier">Extra Multiplier</Label>
                    <Input
                      id="extraMultiplier"
                      name="extraMultiplier"
                      type="number"
                      step="0.1"
                      value={newShift.extraMultiplier}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="extraLimit">Extra Threshold (min)</Label>
                    <Input
                      id="extraLimit"
                      name="extraLimit"
                      type="number"
                      value={newShift.extraLimit}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Breaks Section */}
            
<div className="space-y-6">
      <div className="border-l-4 border-blue-500 pl-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Coffee className="h-5 w-5 text-blue-500" />
          Break Configuration
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Define the types of breaks available during this shift. Each break type can be used multiple times per day
          based on your settings.
        </p>
      </div>

      <Card className="border-2 border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="text-lg font-medium text-gray-800 flex items-center justify-between">
            <span>Break Types</span>
            <Badge variant="secondary" className="text-xs">
              {newShift.breakTypes?.length || 0} configured
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
                      Break Name *
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
                      placeholder="e.g., Lunch Break, Coffee Break"
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
                      Duration *
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
                      Max/Day *
                    </Label>
                    <Input
                      id={`break-usage-${index}`}
                      type="number"
                      value={breakItem.maxUsagePerDay || 1}
                      onChange={(e) => {
                        const updatedBreaks = [...newShift.breakTypes!]
                        updatedBreaks[index] = {
                          ...updatedBreaks[index],
                          maxUsagePerDay : Number.parseInt(e.target.value, 10) || 1,
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
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Icon</Label>
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
                        <SelectValue placeholder="Choose icon" />
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
                        console.log("before deleteBreak", breakItem.id);
                        const res = await shiftAPI.deleteBreak(breakItem.id!)
                        if (res) {
                          toast.success('Break deleted successfully', {
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
                  <strong>Tip:</strong> This break can be taken up to {breakItem.maxUsagePerDay || 1} time
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
                Add Another Break Type
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Add different types of breaks that employees can take during this shift
              </p>
            </div>
          </div>

          {/* Summary */}
          {newShift.breakTypes && newShift.breakTypes.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Break Summary</h4>
              <div className="text-sm text-blue-800">
                <p>
                  Total break types configured: <strong>{newShift.breakTypes.length}</strong>
                </p>
                <p>
                  Total possible break time per day:{" "}
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
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Save Changes" : "Add Shift"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
