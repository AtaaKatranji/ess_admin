'use client'

import { useState, useEffect } from 'react'
import { PlusCircle, Trash2, UserPlus, ArrowRightLeft, Edit, Clock, Calendar, Settings, ChevronDown, Timer, Coffee, Utensils, Pause, Users, FileChartColumn, CalendarClock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { fetchEmployees } from '@/app/api/employees/employeeId'
import { toast, ToastContainer } from 'react-toastify'
import { useInstitution } from '@/app/context/InstitutionContext'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ShiftForm from '@/app/components/shift-dialog'
import { Shift } from '@/app/types/Shift'
import * as shiftAPI from '@/app/api/shifts/shifts'
import ShiftReport from '@/app/components/ShiftReports'
import { fetchInstitution } from '@/app/api/institutions/institutions'
import { useI18n } from "@/app/context/I18nContext";

const BaseURL = process.env.NEXT_PUBLIC_API_URL;

type Employee = {
  id: string;
  name: string;
  shiftId: string;
}

type Employeelist = {
  id: string;
  name: string;
}

const getBreakIcon = (iconType: string) => {
  switch (iconType.toLowerCase()) {
    case "coffee":
      return <Coffee className="h-4 w-4" />
    case "tea":
      return <Utensils className="h-4 w-4" />
    case "rest":
      return <Pause className="h-4 w-4" />
    default:
      return <Timer className="h-4 w-4" />
  }
}

const getBreakColor = (iconType: string) => {
  switch (iconType.toLowerCase()) {
    case "coffee":
      return "bg-amber-50 border-amber-200 text-amber-800"
    case "tea":
      return "bg-green-50 border-green-200 text-green-800"
    case "rest":
      return "bg-blue-50 border-blue-200 text-blue-800"
    default:
      return "bg-gray-50 border-gray-200 text-gray-800"
  }
}

export default function ShiftsPage() {
  const { slug } = useInstitution();
  const { t } = useI18n()

  // const [institutionKey, setInstitutionKey] = useState<string | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('Select employee')
  const [selectedShift, setSelectedShift] = useState('Select shift')
  const [isEmployeesExpandedMap, setIsEmployeesExpandedMap] = useState<{ [key: number]: boolean }>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [isBreaksExpanded, setIsBreaksExpanded] = useState(true)
  const [showReports, setShowReports] = useState(false)

  const fetchShi = async () => {
    try {
      if (!slug) return;
      const data = await shiftAPI.fetchShifts(slug)
      setShifts(data)
    } catch (error) {
      console.error('Error fetching shifts:', error)
    }
  }

  const fetchEmp = async () => {
    try {
      if (!slug) return;
      const data = await fetchEmployees(slug)
      setEmployees(data.filter((emp: Employee) => emp.shiftId == null)
        .map((emp: Employee) => ({ id: emp.id, name: emp.name })))
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      try {
        const data = await fetchInstitution(slug);
        if (data?.data && 'uniqueKey' in data.data) {
          // setInstitutionKey(data.data.uniqueKey);
        }
      } catch (error) {
        console.error("Error fetching institution:", error);
      }
    };
    fetchData();
    fetchShi()
    fetchEmp()
  }, [slug])

  const handleEditShift = async (shift: Shift) => {
    setEditingShift(shift)
    setDialogOpen(true)
  }

  const deleteShift = async (id: string) => {
    try {
      const response = await fetch(`${BaseURL}/shifts/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete shift')
      setShifts(shifts.filter(shift => shift.id !== id))
      toast.success(t("shifts.toast.deleteSuccess"), { autoClose: 1500 });
    } catch (error) {
      console.error('Error deleting shift:', error)
      toast.error(t("shifts.toast.deleteError"), { autoClose: 1500 });
    }
  }

  const assignEmployee = async () => {
    if (selectedEmployee === 'Select employee' || selectedShift === 'Select shift') return
    try {
      const response = await fetch(`${BaseURL}/shifts/${selectedShift}/assign`, {
        method: 'PUT',
        credentials: "include",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: selectedEmployee }),
      })
      if (!response.ok) throw new Error('Failed to assign employee')
      const data = await response.json()
      setShifts(shifts.map(shift => shift.id === data.id ? data : shift))
      setSelectedEmployee('Select employee')
      setSelectedShift('Select shift')
      toast.success(t('shifts.toast.assignSuccess'), { autoClose: 1500 })
      fetchEmp()
    } catch (error) {
      console.error('Error assigning employee:', error)
      toast.error(t('shifts.toast.assignError'), { autoClose: 1500 })
    }
  }

  const removeEmployeeFromShift = async (shiftId: string, employeeId: string) => {
    const response = await fetch(`${BaseURL}/shifts/${shiftId}/remove`, {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    })
    const data = await response.json()
    setShifts(shifts.map(shift => shift.id === data.id ? data : shift))
    fetchEmp()
  }

  const moveEmployee = async (shiftId: string, toShiftId: string, employeeId: string) => {
    await fetch(`${BaseURL}/shifts/${shiftId}/move`, {
      method: 'POST',
      credentials: "include",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toShiftId, employeeId }),
    })
    fetchShi()
  }

  const parseOverrides = (overrides: { [day: string]: { start: string; end: string } } | string | undefined
  ) => {
    if (!overrides) return {};
    if (typeof overrides === "string") {
      try {
        return JSON.parse(overrides);
      } catch {
        return {};
      }
    }
    return overrides;
  };

  const formatTime = (time: string) => {
    return time?.slice(0, 5) || ""
  }

  const getEffectiveTime = (shift: Shift, day: string) => {
    const overrides = parseOverrides(shift.overrides)
    if (overrides[day]) {
      return {
        start: overrides[day].start,
        end: overrides[day].end,
        isOverride: true,
      }
    }
    return {
      start: formatTime(shift.startTime),
      end: formatTime(shift.endTime),
      isOverride: false,
    }
  }

  const toggleEmployeesExpanded = (shiftId: number) => {
    setIsEmployeesExpandedMap((prevState) => ({
      ...prevState,
      [shiftId]: !prevState[shiftId],
    }))
  }

  const handleSave = async (data: Shift) => {

    if (editingShift) {
      await shiftAPI.updateShift(data, slug!);
      toast.success(t('shifts.toast.updateSuccess'), { autoClose: 1500 });
    } else {
      try {
        await shiftAPI.addShift(data, slug!);
        toast.success(t('shifts.toast.addSuccess'), { autoClose: 1500 });
      } catch (error) {
        toast.error(`${t('shifts.toast.addError')}: ${error instanceof Error ? error.message : 'Unknown error'}`, { autoClose: 1500 });
      }
    }

    fetchShi()
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer />
      {showReports ? (
        <ShiftReport open={showReports} onOpenChange={setShowReports} institutionKey={slug!} shiftId={shifts[0]?.id || ""} />
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">{t("shifts.title")}</h1>
            <div className="flex gap-2">
              <Button type="button" className='bg-primary' onClick={() => {
                setEditingShift(null);
                setDialogOpen(true);
              }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("shifts.addShift")}
              </Button>
              <Button type="button" className='bg-primary' onClick={() => setShowReports(true)} disabled={shifts.length === 0}>
                <FileChartColumn className="mr-2 h-4 w-4" />
                {t("shifts.reports")}
              </Button>
            </div>
          </div>
          <ShiftForm open={dialogOpen}
            onOpenChange={setDialogOpen}
            isEditing={!!editingShift}
            shift={editingShift}
            onSave={handleSave}
          />

          <Card className="mb-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-gray-800">{t("shifts.manageEmployees.title")}</CardTitle>
              <CardDescription>{t("shifts.manageEmployees.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr,1fr,auto] gap-3">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("shifts.selectEmployee.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedShift} onValueChange={setSelectedShift}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("shifts.selectShift.placeholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map(s => (
                      <SelectItem key={s.id} value={s.id!}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={assignEmployee}
                  className="bg-gray-800 w-full sm:w-auto"
                  disabled={!selectedEmployee || !selectedShift || selectedEmployee === "Select employee" || selectedShift === "Select shift"}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("shifts.assignEmployee.label")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <h2 className="text-xl font-semibold mb-4 text-gray-800">{t("shifts.currentShifts.title")}</h2>
          {shifts.length === 0 ? (
            <Card className="flex flex-col items-center text-center py-16">
              <CalendarClock className="h-10 w-10 mb-3 text-gray-500" />
              <h3 className="text-lg font-semibold mb-1 text-primary"> {t("shifts.empty.title")}</h3>
              <p className="text-sm text-muted-foreground">{t("shifts.empty.body")}</p>
              <div className="mt-5 flex gap-2">
                <Button onClick={() => { setEditingShift(null); setDialogOpen(true); }}>
                  {t("shifts.empty.create")}
                </Button>
                <Button variant="outline" onClick={() => fetchShi()}>
                  {t("shifts.empty.refresh")}
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {shifts.map((shift) => (
                <Card key={shift.id} className="w-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-xl text-gray-800">{shift.name}</CardTitle>
                          <Badge variant="secondary" className="bg-gray-800 text-white">
                            {shift.mode === "advanced" ? <Settings className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                            {shift.mode}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{t("shifts.currentShifts.base")}: {formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{shift.days?.join(", ") || t("shifts.currentShifts.noDaysAssigned")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditShift(shift)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteShift(shift.id!)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shift.mode === "advanced" && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">{t("shifts.daySpecificOverrides.title")}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {shift.days?.map((day: string) => {
                            const et = getEffectiveTime(shift, day)
                            return (
                              <div key={day} className={`p-3 rounded-md border ${et.isOverride ? "bg-blue-100 border-blue-300" : "bg-gray-50 border-gray-200"}`}>
                                <div className="font-medium text-sm">{day}</div>
                                <div className="text-sm">{et.start} - {et.end} {et.isOverride && <Badge variant="outline" className="ml-2">{t("shifts.daySpecificOverrides.custom")}</Badge>}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-between cursor-pointer p-2 rounded-lg" onClick={() => toggleEmployeesExpanded(Number(shift.id))}>
                        <h4 className="text-lg font-medium flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {t("shifts.assignedEmployees.title")} ({shift.employees?.length || 0})
                        </h4>
                        <ChevronDown className={`h-5 w-5 transition-transform ${isEmployeesExpandedMap[Number(shift.id)] ? "rotate-180" : ""}`} />
                      </div>
                      {isEmployeesExpandedMap[Number(shift.id)] && (
                        <div className="mt-3 space-y-2">
                          {shift.employees?.length === 0 ? (
                            <p className="text-sm text-gray-500">{t("shifts.assignedEmployees.empty")}</p>
                          ) : (
                            shift.employees?.map((emp: Employeelist) => (
                              <div key={emp.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <span>{emp.name}</span>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild><Button variant="outline" size="sm"><ArrowRightLeft className="h-4 w-4 mr-2" />{t("shifts.moveEmployee.button")}</Button></DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader><DialogTitle>{t("shifts.moveEmployee.title")}</DialogTitle></DialogHeader>
                                      <Select onValueChange={(val) => moveEmployee(shift.id!, val, emp.id)}>
                                        <SelectTrigger><SelectValue placeholder={t("shifts.moveEmployee.placeholder")} /></SelectTrigger>
                                        <SelectContent>
                                          {shifts.filter(s => s.id !== shift.id).map(s => <SelectItem key={s.id} value={s.id!}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                      </Select>
                                    </DialogContent>
                                  </Dialog>
                                  <Button variant="destructive" size="sm" onClick={() => removeEmployeeFromShift(shift.id!, emp.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between cursor-pointer p-2 rounded-lg" onClick={() => setIsBreaksExpanded(!isBreaksExpanded)}>
                      <h4 className="text-lg font-medium flex items-center gap-2">
                        <Timer className="h-5 w-5" />
                        {t("shifts.breakTypes.title")} ({shift.breakTypes?.length || 0})
                      </h4>
                      <ChevronDown className={`h-5 w-5 transition-transform ${isBreaksExpanded ? "rotate-180" : ""}`} />
                    </div>
                    {isBreaksExpanded && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {shift.breakTypes?.map((bt) => (
                          <div key={bt.id} className={`p-4 rounded-lg border-2 ${getBreakColor(bt.icon!)}`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">{getBreakIcon(bt.icon!)}<h5 className="font-semibold text-sm">{bt.name}</h5></div>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between"><span>{t("shifts.breakTypes.duration")}</span><Badge variant="outline">{bt.duration} min</Badge></div>
                              <div className="flex justify-between"><span>{t("shifts.breakTypes.dailyLimit")}</span><Badge variant="outline">{bt.maxUsagePerDay}x</Badge></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
