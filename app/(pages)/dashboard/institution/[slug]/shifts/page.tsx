'use client'

import { useState, useEffect} from 'react'
import { PlusCircle, Trash2, UserPlus, ArrowRightLeft, Edit, SaveIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { fetchEmployees } from '@/app/api/employees/employeeId'
import { fetchShifts } from '@/app/api/shifts/shifts'
import { toast, ToastContainer } from 'react-toastify'
import { useInstitution } from '@/app/context/InstitutionContext'
const BaseURL = process.env.NEXT_PUBLIC_API_URL;
type Employee = {
  id: string; // Changed from id to id for MySQL
  name: string;
}

type Break = {
  id: string; // Changed from id to id
  name: string;
  duration: number;
  icon?: string;
  shiftId?: string; // Added to associate with shift
}

type Shift = {
  id?: string; // Changed from id to id
  name: string;
  startTime: string;
  endTime: string;
  days: string[];
  institutionKey: string;
  employees?: Employee[];
  lateLimit: number;
  lateMultiplier: number;
  extraLimit: number;
  extraMultiplier: number;
  breaks?: Break[];
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']



export default function ShiftsPage() {
  const { institutionKey } = useInstitution();

  const [shifts, setShifts] = useState<Shift[]>([])
  const [newShift, setNewShift] = useState<Shift>({
    name: '',
    startTime: '',
    endTime: '',
    institutionKey:institutionKey,
    days: [],
    lateLimit: 1,
    lateMultiplier: 1,
    extraLimit: 1,
    extraMultiplier: 1,
    breaks: [], // Initialize breaks as an empty array
  })
  const [employees, setEmployees] = useState<Employee[]>([])
  // const [newEmployee, setNewEmployee] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('Select employee')
  const [selectedShift, setSelectedShift] = useState('Select shift')
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
   // const [errorName, setErrorName] = useState<string | null>(null);
  // const [newName, setNewName] = useState<string | null>(null);




  // Fetch shifts from the API
  useEffect(() => { 
    const fetchShi = async () => {
      try {
        const data = await fetchShifts(institutionKey)
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
        setEmployees(data.map((emp: Employee) => ({ id: emp.id , name: emp.name })))
      } catch (error) {
        console.error('Error fetching employees:', error)
      }
    }
    fetchEmp()
  }, [institutionKey])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewShift({ ...newShift, [e.target.name]: e.target.value })
  }
  const handleNameBreakChange = (e: React.ChangeEvent<HTMLInputElement>, index: string) => {
    const updatedBreaks = [...newShift.breaks!];
    updatedBreaks[Number(index)].name = e.target.value; // Type assertion to number
    setNewShift({ ...newShift, breaks: updatedBreaks });
  };

  const handleDayToggle = (day: string) => {
    setNewShift(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }))
  }
  const addShift = async () => {
    if (!newShift.name || !newShift.startTime || !newShift.endTime || newShift.days.length === 0) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      const shiftResponse = await fetch(`${BaseURL}/shifts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift), // No need to set employees here
      })

      if (!shiftResponse.ok) {
        const errorData = await shiftResponse.json()
        throw new Error(errorData.message || 'Failed to add shift')
      }

      const shiftData = await shiftResponse.json()
      console.log('Created shift:', shiftData)

      // Handle breaks
      if (newShift.breaks && newShift.breaks.length > 0) {
        const breakPromises = newShift.breaks.map(breakItem =>
          fetch(`${BaseURL}/break/break-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...breakItem, shiftId: shiftData.id })
          })
        )
        await Promise.all(breakPromises)
      }

      setShifts([...shifts, { ...shiftData, employees: [] }])
      resetNewShift()
      setIsOpen(false)
      toast.success('Shift added successfully', { autoClose: 1500 })
    } catch (error) {
      console.error('Error adding shift:', error)
      toast.error(`Failed to add shift: ${error instanceof Error ? error.message : 'Unknown error'}`, { autoClose: 1500 })
    }
  }
  const updateShift = async () => {
    if (!newShift.id || !newShift.name || !newShift.startTime || !newShift.endTime || newShift.days.length === 0) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      console.log('Sending update data:', JSON.stringify(newShift)); // Log what’s sent
      const shiftResponse = await fetch(`${BaseURL}/shifts/${newShift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShift),
      })

      if (!shiftResponse.ok) {
        const errorData = await shiftResponse.json()
        throw new Error(errorData.message || 'Failed to update shift')
      }

      const shiftData = await shiftResponse.json()
      console.log('Received updated shift:', shiftData);

      // Ensure days is an array
      const sanitizedShift = {
        ...shiftData,
        days: Array.isArray(shiftData.days) ? shiftData.days : JSON.parse(shiftData.days || '[]'),
        employees: shiftData.employees || [],
    };
      // Handle breaks (similar to addShift)
      if (newShift.breaks && newShift.breaks.length > 0) {
        const breakPromises = newShift.breaks.map(breakItem =>
          breakItem.id && !breakItem.id.startsWith('temp-')
            ? fetch(`${BaseURL}/break/break-types/${breakItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...breakItem, shiftId: newShift.id })
              })
            : fetch(`${BaseURL}/break/break-types`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...breakItem, shiftId: newShift.id })
              })
        )
        await Promise.all(breakPromises)
      }

      setShifts(prevShifts => {
        const newShifts = prevShifts.map(shift => shift.id === sanitizedShift.id ? sanitizedShift : shift);
        console.log('Updated shifts:', newShifts);
        return newShifts;
    });
      resetNewShift()
      setIsOpen(false)
      setIsEditing(false)
      toast.success('Shift updated successfully', { autoClose: 1500 })
    } catch (error) {
      console.error('Error updating shift:', error)
      toast.error(`Failed to update shift: ${error instanceof Error ? error.message : 'Unknown error'}`, { autoClose: 1500 })
    }
  }
  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (isEditing) {
  //     updateShift();
  //   } else {
  //     addShift();
  //   }

  //   // Reset the newShift state to its initial values
  //   setNewShift({
  //     name: '',
  //     startTime: '',
  //     endTime: '',
  //     days: [],
  //     institutionKey: institutionKey,
  //     lateLimit: 1,
  //     lateMultiplier: 1,
  //     extraLimit: 1,
  //     extraMultiplier: 1,
  //     breaks: [],
  //   });
  //   setIsOpen(false);
  //   setIsEditing(false);
  // };
  const resetNewShift = () => {
    setNewShift({
      name: '',
      startTime: '',
      endTime: '',
      days: [],
      institutionKey: institutionKey,
      lateLimit: 1,
      lateMultiplier: 1,
      extraLimit: 1,
      extraMultiplier: 1,
      breaks: [],
    })
  }
  const handleEditShift = async (shift: Shift) => {
    const breaks = await fetchBreaksForShift(shift.id!)
    setNewShift({ ...shift, breaks: breaks.data })
    setIsEditing(true)
    setIsOpen(true)
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
  const deleteBreak = async (breakId: string) => {
    try {
      const response = await fetch(`${BaseURL}/break/break-types/${breakId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete break');
      }

      // Return true if the break was successfully deleted
      return true;
    } catch (error) {
      console.error('Error deleting break:', error);
      toast.error('Failed to delete break', {
        autoClose: 1500, // duration in milliseconds
      });
      return false;
    }
  };

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
    setShifts(shifts.map(shift => shift.id === data.id ? data : shift))
  }
  const fetchBreaksForShift = async (shiftId : string) => {
    try {
      const response = await fetch(`${BaseURL}/break/break-types/shift/${shiftId}`);
    
      if (!response.ok) {
        throw new Error('Failed to fetch breaks');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching breaks:', error);
      return [];
    }
  };
 
  return (
    
    <div className="container mx-auto p-4">
      <ToastContainer />
      <div className='flex justify-between'>
        <h1 className="text-2xl font-bold mb-4">Shift Management</h1>
        <Button type="button" onClick={() => { resetNewShift(); setIsOpen(true) }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>
       {/* Dialog for Adding and Editing Shifts */}
       <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-6 bg-gray-100 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{isEditing ? "Edit Current Shift" : "Add New Shift"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { 
            e.preventDefault();
            if (isEditing) {
              updateShift();
            } else {
              addShift();
            }
          }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First row with single column */}
          <div className="md:col-span-2">
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

          {/* Second row with two columns */}
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

          {/* Next rows */}
          <div>
            <Label htmlFor="lateMultiplier">Late Multiplier</Label>
            <Input
              id="lateMultiplier"
              name="lateMultiplier"
              type="number"
              value={newShift.lateMultiplier}
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
              value={newShift.extraMultiplier}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="lateLimit">Late Limit</Label>
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
            <Label htmlFor="extraLimit">Extra Threshold</Label>
            <Input
              id="extraLimit"
              name="extraLimit"
              type="number"
              value={newShift.extraLimit}
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

          {/* Breaks Section */}
            <fieldset className="mt-4 md:col-span-2">
              <legend className="text-sm font-medium text-gray-700">Breaks</legend>
              <div className="mt-2 space-y-2">
          {newShift.breaks?.map((breakItem, index) => (
            <div key={breakItem.id} className="flex items-center gap-2">
           

           <Input
              id="name"
              name="name"
              value={breakItem.name}
              onChange={(event) => handleNameBreakChange(event, String(index))} // Wrap in arrow function
              placeholder="Break Name"
            />
            {/* {errorName && <p className="text-red-500 text-sm">{errorName}</p>} */}
              <Input
                type="number"
                value={breakItem.duration}
                onChange={(e) => {
                  const updatedBreaks = [...newShift.breaks!];
                  updatedBreaks[index].duration = parseInt(e.target.value, 10);
                  setNewShift({ ...newShift, breaks: updatedBreaks });
                }}
                placeholder="Duration (minutes)"
              />
                    <Select
                      value={breakItem.icon}
                      onValueChange={(value) => {
                        const updatedBreaks = [...newShift.breaks!];
                        updatedBreaks[index].icon = value;
                        setNewShift({ ...newShift, breaks: updatedBreaks });
                      }}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Select icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coffee">☕ Coffee</SelectItem>
                        <SelectItem value="food">🍴 Food</SelectItem>
                        <SelectItem value="tea">🍵 Tea</SelectItem>
                        <SelectItem value="rest">🛋️ Rest</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        const breakId = newShift.breaks![index].id;
                    
                        // Call the API to delete the break
                        const isDeleted = await deleteBreak(breakId);
                    
                        // If the break was successfully deleted from the backend, update the local state
                        if (isDeleted) {
                          const updatedBreaks = newShift.breaks!.filter((_, i) => i !== index);
                          setNewShift({ ...newShift, breaks: updatedBreaks });
                    
                          toast.success('Break deleted successfully', {
                            autoClose: 1500, // duration in milliseconds
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNewShift({
                        ...newShift,
                        breaks: [...(newShift.breaks || []), {
                          id: `temp-${Date.now()}`,
                          name: '', 
                          duration: 0 
                        }],
                      });
                    }}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Break
                  </Button>
                </div>
              </fieldset>

          <DialogFooter className="mt-6 md:col-span-2">
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} className="mr-4">
              Cancel
            </Button>

            {isEditing ? (
              <Button type="submit">
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            ) : (
              <div>
                <Button type="submit">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Shift
                </Button>
              </div>
            )}
          </DialogFooter>
        </form>

      </DialogContent>
      </Dialog>
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
                    {Array.isArray(shift.days) && shift.days.length > 0 ? shift.days.join(', ') : 'No days assigned'}
                    </p>
                    
                  </div>
                  <div className='space-x-4'>
                  <Button
                      variant="default"
                      size="icon"
                      onClick={() => handleEditShift(shift)}
                    >
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
                <div>
                  <h4 className="text-md font-medium mb-2">Assigned Employees:</h4>
                  {(!shift.employees || shift.employees.length === 0) ? (
                    <p className="text-sm text-gray-500">No employees assigned</p>
                  ) : (
                    <ul className="space-y-2">
                      
                      {shift.employees.map(employee => (
                        
                        <>
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
                                <Select onValueChange={(value) => moveEmployee(shift.id!, value, employee.id)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select shift" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {shifts.filter(s => s.id !== shift.id).map(s => (
                                      <SelectItem key={s.id} value={s.id!}>{s.name}</SelectItem>
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
                        </li>
                        </>
                        
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

