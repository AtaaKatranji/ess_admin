'use client'

import { useState } from 'react'
import { PlusCircle, Trash2, UserPlus, ArrowRightLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

type Employee = {
  id: string
  name: string
}

type Shift = {
  id: string
  name: string
  startTime: string
  endTime: string
  days: string[]
  employees: Employee[]
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [newShift, setNewShift] = useState<Omit<Shift, 'id' | 'employees'>>({
    name: '',
    startTime: '',
    endTime: '',
    days: [],
  })
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson' },
  ])
  const [newEmployee, setNewEmployee] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedShift, setSelectedShift] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewShift({ ...newShift, [e.target.name]: e.target.value })
  }

  const handleDayToggle = (day: string) => {
    setNewShift(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newShift.name && newShift.startTime && newShift.endTime && newShift.days.length > 0) {
      setShifts([...shifts, { ...newShift, id: Date.now().toString(), employees: [] }])
      setNewShift({ name: '', startTime: '', endTime: '', days: [] })
    }
  }

  const deleteShift = (id: string) => {
    setShifts(shifts.filter(shift => shift.id !== id))
  }

  const addEmployee = () => {
    if (newEmployee) {
      setEmployees([...employees, { id: Date.now().toString(), name: newEmployee }])
      setNewEmployee('')
    }
  }

  const assignEmployee = () => {
    if (selectedEmployee && selectedShift) {
      setShifts(shifts.map(shift => {
        if (shift.id === selectedShift) {
          const employee = employees.find(e => e.id === selectedEmployee)
          if (employee && !shift.employees.some(e => e.id === employee.id)) {
            return { ...shift, employees: [...shift.employees, employee] }
          }
        }
        return shift
      }))
      setSelectedEmployee('')
      setSelectedShift('')
    }
  }

  const removeEmployeeFromShift = (shiftId: string, employeeId: string) => {
    setShifts(shifts.map(shift => {
      if (shift.id === shiftId) {
        return { ...shift, employees: shift.employees.filter(e => e.id !== employeeId) }
      }
      return shift
    }))
  }

  const moveEmployee = (fromShiftId: string, toShiftId: string, employeeId: string) => {
    const employeeToMove = shifts.find(s => s.id === fromShiftId)?.employees.find(e => e.id === employeeId)
    if (employeeToMove) {
      setShifts(shifts.map(shift => {
        if (shift.id === fromShiftId) {
          return { ...shift, employees: shift.employees.filter(e => e.id !== employeeId) }
        }
        if (shift.id === toShiftId) {
          return { ...shift, employees: [...shift.employees, employeeToMove] }
        }
        return shift
      }))
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shift Management</h1>
      <Button type="button" onClick={()=>{setIsOpen(true)}}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Shift
            </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 bg-gray-100 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Shift</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <Label htmlFor="startTime">Start Time</Label>
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
            <Label htmlFor="endTime">End Time</Label>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              value={newShift.endTime}
              onChange={handleInputChange}
              required
            />
          </div>

          <fieldset className="mt-4 md:col-span-2">
            <legend className="text-sm font-medium text-gray-700">Days of Week</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant={newShift.days.includes(day) ? "default" : "outline"}
                  onClick={() => handleDayToggle(day)}
                >
                  {day.slice(0, 3)}
                </Button>
              ))}
            </div>
          </fieldset>
          
          <DialogFooter className="mt-6 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} className="mr-4">
              Cancel
            </Button>
            <Button type="submit">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Shift
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Manage Employees</h2>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="New employee name"
            value={newEmployee}
            onChange={(e) => setNewEmployee(e.target.value)}
          />
          <Button onClick={addEmployee}>Add Employee</Button>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>{employee.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={setSelectedShift}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              {shifts.map(shift => (
                <SelectItem key={shift.id} value={shift.id}>{shift.name}</SelectItem>
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
          <ul className="space-y-4">
            {shifts.map(shift => (
              <li key={shift.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{shift.name}</h3>
                    <p className="text-sm text-gray-500">
                      {shift.startTime} - {shift.endTime}
                    </p>
                    <p className="text-sm text-gray-500">
                      {shift.days.join(', ')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteShift(shift.id)}
                    aria-label={`Delete ${shift.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h4 className="text-md font-medium mb-2">Assigned Employees:</h4>
                  {shift.employees.length === 0 ? (
                    <p className="text-sm text-gray-500">No employees assigned</p>
                  ) : (
                    <ul className="space-y-2">
                      {shift.employees.map(employee => (
                        <li key={employee.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                          <span>{employee.name}</span>
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
                                <Select onValueChange={(value) => moveEmployee(shift.id, value, employee.id)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select shift" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {shifts.filter(s => s.id !== shift.id).map(s => (
                                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeEmployeeFromShift(shift.id, employee.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}