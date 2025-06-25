'use client'

import { useState, useEffect} from 'react'
import { PlusCircle, Trash2, UserPlus, ArrowRightLeft, Edit, Clock, Calendar, Settings, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import { Label } from '@/components/ui/label'
import { fetchEmployees } from '@/app/api/employees/employeeId'
import { toast, ToastContainer } from 'react-toastify'
import { useInstitution } from '@/app/context/InstitutionContext'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ShiftForm from '@/app/components/shift-dialog'
const BaseURL = process.env.NEXT_PUBLIC_API_URL;
import { Shift } from '@/app/types/Shift'
import * as shiftAPI from '@/app/api/shifts/shifts'

type Employee = {
  id: string; // Changed from id to id for MySQL
  name: string;
  shiftId: string;
}
type Employeelist = {
  id: string; // Changed from id to id for MySQL
  name: string;

}

export default function ShiftsPage() {
  const { institutionKey } = useInstitution();

  const [shifts, setShifts] = useState<Shift[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState('Select employee')
  const [selectedShift, setSelectedShift] = useState('Select shift')
  const [isEmployeesExpandedMap, setIsEmployeesExpandedMap] = useState<{ [key: number]: boolean }>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)


  // Fetch shifts from the API
  useEffect(() => { 
    const fetchShi = async () => {
      try {
        const data = await shiftAPI.fetchShifts(institutionKey)
        console.log('Raw shift data:', data)
        // Sanitize data to ensure days is an array and map id
        const sanitizedShifts = data.map((shift : Shift) => ({
          ...shift,
          id: shift.id, // Handle both cases if backend mixes id/id
          days: Array.isArray(shift.days) ? shift.days : JSON.parse(shift.days || '[]'),
          employees: shift.employees || [] // Ensure employees is always an array
        }))
        setShifts(sanitizedShifts)
      } catch (error) {
        console.error('Error fetching shifts:', error)
      }
    }
    fetchShi()

    const fetchEmp = async () => {
      try {
        const data = await fetchEmployees(institutionKey)
        console.log('Raw employee data:', data)
        setEmployees(data .filter((emp: Employee) => emp.shiftId == null) // Only unassigned
        .map((emp: Employee) => ({ id: emp.id, name: emp.name })))
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }
    fetchEmp()
  }, [institutionKey])

  const handleEditShift = async (shift: Shift) => {
    setEditingShift(shift)  // shift from your list
    setDialogOpen(true) 
    // const breaks = await fetchBreaksForShift(shift.id!)
    // setNewShift({ ...shift, breaks: breaks.data })
    // setIsEditing(true)
    // setIsOpen(true)
  }
  const deleteShift = async (id: string) => {
    try {
      const response = await fetch(`${BaseURL}/shifts/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete shift')
      setShifts(shifts.filter(shift => shift.id !== id))
      toast.success('Shift deleted successfully', { autoClose: 1500 })
    } catch (error) {
      console.error('Error deleting shift:', error)
      toast.error('Failed to delete shift', { autoClose: 1500 })
    }
  }
  // Function to delete a break from the backend
  // const deleteBreak = async (breakId: string) => {
  //   try {
  //     const response = await fetch(`${BaseURL}/break/break-types/${breakId}`, {
  //       method: 'DELETE',
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to delete break');
  //     }

  //     // Return true if the break was successfully deleted
  //     return true;
  //   } catch (error) {
  //     console.error('Error deleting break:', error);
  //     toast.error('Failed to delete break', {
  //       autoClose: 1500, // duration in milliseconds
  //     });
  //     return false;
  //   }
  // };

  const assignEmployee = async () => {
    if (selectedEmployee === 'Select employee' || selectedShift === 'Select shift') return
    try {
      const response = await fetch(`${BaseURL}/shifts/${selectedShift}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: selectedEmployee }),
      })
      if (!response.ok) throw new Error('Failed to assign employee')
      const data = await response.json()
      setShifts(shifts.map(shift => shift.id === data.id ? data : shift))
      setSelectedEmployee('Select employee')
      setSelectedShift('Select shift')
      toast.success('Employee assigned successfully', { autoClose: 1500 })
    } catch (error) {
      console.error('Error assigning employee:', error)
      toast.error('Failed to assign employee', { autoClose: 1500 })
    }
  }
  const removeEmployeeFromShift = async (shiftId: string, employeeId: string) => {
    console.log(employeeId)
    const response = await fetch(`${BaseURL}/shifts/${shiftId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    })
    const data = await response.json()
    console.log("in remove employee: ",data)
    setShifts(shifts.map(shift => shift.id === data.id ? data : shift))
  }
  const moveEmployee = async (fromShiftId: string, toShiftId: string, employeeId: string) => {
    console.log(fromShiftId,toShiftId,employeeId)
    const response = await fetch(`${BaseURL}/shifts/${fromShiftId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toShiftId, employeeId }),
    })
    const data = await response.json()
    console.log(data);
    const dataShiftSync = await shiftAPI.fetchShifts(institutionKey);
    setShifts(dataShiftSync);
    // setShifts(shifts.map(shift => {
    //   if (shift.id === fromShiftId) {
    //     // Remove employee from old shift
    //     return {
    //       ...shift,
    //       employees: shift.employees.filter(emp => emp.id !== employeeId)
    //     };
    //   }
    //   if (shift.id === toShiftId) {
    //     // Add employee to new shift (might need to push the updated employee object)
    //     return {
    //       ...shift,
    //       employees: [...shift.employees, data.employee] // or use data.updatedEmployees
    //     };
    //   }
    //   return shift;
    // }));
  }

  // New helper functions

  const parseOverrides = (
    overrides: { [day: string]: { start: string; end: string } } | string | undefined
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
  // Helper function to format time
const formatTime = (time: string) => {
  return time.slice(0, 5) // Remove seconds
}

// Helper function to get effective time for a day
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
const handleSave = async (data : Shift) => {
  let newShift = data;
  if (editingShift) {
    // Edit mode: update shift
    newShift = await shiftAPI.updateShift(data);
    toast.success('Shift updated successfully', { autoClose: 1500 });
  } else {
    // Add mode: add new shift
    try {
      newShift = await shiftAPI.addShift(data);
      toast.success('Shift added successfully', { autoClose: 1500 });
      
    } catch (error) {
      toast.error(`Failed to add shift: ${error instanceof Error ? error.message : 'Unknown error'}`, { autoClose: 1500 });
    }
  }
  // Fetch and update the list
  setShifts((prevShifts) => [...prevShifts, newShift]);
  setDialogOpen(false);

};

  return (
    
    <div className="container mx-auto p-4">
      <ToastContainer />

      <div className='flex justify-between'>
        <h1 className="text-2xl font-bold mb-4">Shift Management</h1>
        <Button type="button" onClick={() => { 
          setEditingShift(null);
          setDialogOpen(true);
          }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
        
      </div>
      <ShiftForm open={dialogOpen}
          onOpenChange={setDialogOpen}
          isEditing={!!editingShift}
          shift={editingShift}
          onSave={ handleSave}
          institutionKey={institutionKey} />
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Manage Employees</h2>
        <div className="flex gap-2">
          {/* select employee */}
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue>
              {selectedEmployee === "Select employee" ? "Select employee" : employees.find(employee => employee.id === selectedEmployee)?.name  }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* select shift */}
          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-[200px]">
              <SelectValue>
                {selectedShift != "Select shift" ? shifts.find(shift => shift.id === selectedShift)?.name : "Select shift"}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {shifts.map(shift => (
                <SelectItem key={shift.id} value={shift.id!}>
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={assignEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Assign to Shift
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Shifts</h2>
        {shifts.length === 0 ? (
          <p>No shifts added yet.</p>
        ) : (
          <div className="space-y-6">
          {shifts.map((shift) => {
            const overrides = parseOverrides(shift.overrides)
            const hasOverrides = Object.keys(overrides).length > 0

            return (
              <Card key={shift.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{shift.name}</CardTitle>
                        <Badge
                          variant={shift.mode === "advanced" ? "default" : "secondary"}
                          className="flex items-center gap-1"
                        >
                          {shift.mode === "advanced" ? <Settings className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          {shift.mode.charAt(0).toUpperCase() + shift.mode.slice(1)}
                        </Badge>
                      </div>

                      {/* Base Schedule */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Base: {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {Array.isArray(shift.days) && shift.days.length > 0
                              ? shift.days.join(", ")
                              : "No days assigned"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => {

                        handleEditShift(shift)}}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteShift(shift.id!)}
                        aria-label={`Delete ${shift.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Advanced Mode: Show Day-specific Overrides */}
                  {shift.mode === "advanced" && hasOverrides && Array.isArray(shift.days) && shift.days.length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Day-specific Schedule Overrides
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {shift.days.map((day: string) => {
                          const effectiveTime = getEffectiveTime(shift, day)
                          return (
                            <div
                              key={day}
                              className={`p-3 rounded-md border ${
                                effectiveTime.isOverride ? "bg-blue-100 border-blue-300" : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <div className="font-medium text-sm">{day}</div>
                              <div
                                className={`text-sm ${effectiveTime.isOverride ? "text-blue-700 font-medium" : "text-gray-600"}`}
                              >
                                {effectiveTime.start} - {effectiveTime.end}
                                {effectiveTime.isOverride && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Custom
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <Separator />
                    {/* Assigned Employees - Collapsible */}
                    <div>
                    {(() => {
                      const isEmployeesExpanded = isEmployeesExpandedMap[Number(shift.id!)] ?? true

                      return (
                        <>
                          <div
                            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            onClick={() => toggleEmployeesExpanded(Number(shift.id!))}
                          >
                            <h4 className="text-lg font-medium">Assigned Employees ({shift.employees?.length || 0})</h4>
                            <ChevronDown
                              className={`h-5 w-5 transition-transform duration-200 ${
                                isEmployeesExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>

                          {isEmployeesExpanded && (
                            <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                              {!shift.employees || shift.employees.length === 0 ? (
                                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">No employees assigned</p>
                              ) : (
                                <div className="space-y-2">
                                  {shift.employees.map((employee: Employeelist) => (
                                    <div
                                      key={employee.id}
                                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                      <span className="font-medium">{employee.name}</span>
                                      <div className="flex gap-2">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                              <ArrowRightLeft className="h-4 w-4 mr-2" />
                                              Move
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Move Employee to Another Shift</DialogTitle>
                                            </DialogHeader>
                                            <Select
                                              onValueChange={(value) => moveEmployee(shift.id!, value, employee.id)}
                                            >
                                              <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select shift" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {shifts
                                                  .filter((s) => s.id !== shift.id)
                                                  .map((s) => (
                                                    <SelectItem key={s.id} value={s.id!.toString()}>
                                                      {s.name}
                                                    </SelectItem>
                                                  ))}
                                              </SelectContent>
                                            </Select>
                                          </DialogContent>
                                        </Dialog>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() => removeEmployeeFromShift(shift.id!, employee.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        )}
      </div>
    </div>
  )

};

