'use client'

import { useState, useEffect} from 'react'
import { PlusCircle, Trash2, UserPlus, ArrowRightLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { fetchEmployees } from '@/app/api/employees/employeeId'
import { fetchShifts } from '@/app/api/shifts/shifts'
const BaseURL = process.env.NEXT_PUBLIC_API_URL;
type Employee = {
  _id: string
  name: string
}

type Shift = {
  _id: string
  name: string
  startTime: string
  endTime: string
  days: string[]
  institutionKey: string,
  employees: Employee[]
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
interface ShiftsPageProps {
  params: {
    institutionKey: string;
  } // Define institutionKey as a string
}

const ShiftsPage: React.FC<ShiftsPageProps> = ({params}) => {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [newShift, setNewShift] = useState<Omit<Shift, '_id' | 'employees'>>({
    name: '',
    startTime: '',
    endTime: '',
    institutionKey:params.institutionKey,
    days: [],
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  // const [newEmployee, setNewEmployee] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('Select employee')
  const [selectedShift, setSelectedShift] = useState('Select shift')
  const [isOpen, setIsOpen] = useState(false)

  // Fetch shifts from the API
  useEffect(() => { 
    console.log("Key: ",params.institutionKey);
    const fetchShi= async () => {
      const data = await fetchShifts(params.institutionKey)
      setShifts(data)
    }
    fetchShi()
    const fetchEmp = async () => {
      const data = await fetchEmployees(params.institutionKey)
      setEmployees(data)
    }
    fetchEmp()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newShift.name && newShift.startTime && newShift.endTime && newShift.days.length > 0) {
      const response = await fetch(`${BaseURL}/shift/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newShift, employees: [] }),
      })
      const data = await response.json()
      setShifts([...shifts, data])
      setNewShift({ name: '', startTime: '', endTime: '', days: [] , institutionKey:params.institutionKey })
      setIsOpen(false)
    }
  }

  const deleteShift = async (id: string) => {
    await fetch(`${BaseURL}/shift/${id}`, { method: 'DELETE' })
    setShifts(shifts.filter(shift => shift._id !== id))
  }

  // const addEmployee = async () => {
  //   if (newEmployee) {
  //     const response = await fetch('/api/employees', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ name: newEmployee }),
  //     })
  //     const data = await response.json()
  //     setEmployees([...employees, data])
  //     setNewEmployee('')
  //   }
  // }

  const assignEmployee = async () => {
    if (selectedEmployee && selectedShift) {
      const id = selectedShift;
      const response = await fetch(`${BaseURL}/shift/${id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: selectedEmployee }),
      })
      const data = await response.json()
      
      setShifts(shifts.map(shift => shift._id === data._id ? data : shift))
      shifts.map(shift => shift.employees.map(employee => console.log(employee.name))
      )
      setSelectedEmployee('')
      setSelectedShift('')
    }
  }

  const removeEmployeeFromShift = async (shiftId: string, employeeId: string) => {
    const response = await fetch(`${BaseURL}/shift/${shiftId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    })
    const data = await response.json()
    setShifts(shifts.map(shift => shift._id === data._id ? data : shift))
  }

  const moveEmployee = async (fromShiftId: string, toShiftId: string, employeeId: string) => {
    const response = await fetch(`${BaseURL}/shift/${fromShiftId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toShiftId, employeeId }),
    })
    const data = await response.json()
    setShifts(shifts.map(shift => shift._id === data._id ? data : shift))
  }

  return (
    <div className="container mx-auto p-4">
      <div className='flex justify-between'>
      <h1 className="text-2xl font-bold mb-4">Shift Management</h1>
      <Button type="button" onClick={() => { setIsOpen(true) }}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Shift
      </Button>
      </div>
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
        {/* <div className="flex gap-2 mb-4">
          <Input
            placeholder="New employee name"
            value={newEmployee}
            onChange={(e) => setNewEmployee(e.target.value)}
          />
          <Button onClick={addEmployee}>Add Employee</Button>
        </div> */}
        <div className="flex gap-2">
          {/* select employee */}
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger className="w-[200px]">
              <SelectValue>
              {selectedEmployee === "Select employee" ? "Select employee" : employees.find(employee => employee._id === selectedEmployee)?.name  }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {employees.map(employee => (
                <SelectItem key={employee._id} value={employee._id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* select shift */}
          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-[200px]">
              <SelectValue>
                {selectedShift != "Select shift" ? shifts.find(shift => shift._id === selectedShift)?.name : "Select shift"}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {shifts.map(shift => (
                <SelectItem key={shift._id} value={shift._id}>
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
          <ul className="space-y-4">
            {shifts.map(shift => (
              <li key={shift._id} className="bg-white p-4 rounded-lg shadow">
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
                    onClick={() => deleteShift(shift._id)}
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
                        <li key={employee._id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
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
                                <Select onValueChange={(value) => moveEmployee(shift._id, value, employee._id)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select shift" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {shifts.filter(s => s._id !== shift._id).map(s => (
                                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeEmployeeFromShift(shift._id, employee._id)}
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

};
export default ShiftsPage;
