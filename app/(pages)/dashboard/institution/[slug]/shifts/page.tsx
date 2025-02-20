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
  _id: string
  name: string
}
type Break = {
  _id:string,
  name: string;
  duration: number; // in minutes
  icon?: string; // optional icon
};

type Shift = {
  _id?: string
  name: string
  startTime: string
  endTime: string
  days: string[]
  institutionKey: string,
  employees?: Employee[],
  lateLimit: number,
  lateMultiplier: number,
  extraLimit: number,
  extraMultiplier: number,
  breaks?: Break[]; // Add breaks to the Shift type

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
  const [isEditing, setIsEditing] = useState(false);
   // const [errorName, setErrorName] = useState<string | null>(null);
  // const [newName, setNewName] = useState<string | null>(null);


  const handleEditShift = async (shift: Shift) => {
    console.log("in handle edit  shift")
    console.log(shift._id)
    const breaks = await fetchBreaksForShift(shift._id!);
    console.log(breaks)
  // Set the newShift state with the shift data and breaks
  setNewShift({
    ...shift,
    breaks: breaks.data, // Populate breaks
  });
  console.log(newShift)
    setIsEditing(true);
    setIsOpen(true);
  };

  // Fetch shifts from the API
  useEffect(() => { 
    const fetchShi= async () => {
      const data = await fetchShifts(institutionKey)
      setShifts(data)
    }
    fetchShi()
    const fetchEmp = async () => {
      const data = await fetchEmployees(institutionKey)
      console.log(data)
      setEmployees(data)
      shifts.map(shift => shift.employees!.map(employee => console.log(employee.name)))
    }
    fetchEmp()
  }, [])

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
    if (newShift.name && newShift.startTime && newShift.endTime && newShift.days.length > 0) {
      try {
        // Step 1: Save the shift
        const shiftResponse = await fetch(`${BaseURL}/shift/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newShift,
            employees: [], // Ensure employees are initialized as an empty array
          }),
        });
  
        if (!shiftResponse.ok) {
          throw new Error('Failed to add shift');
        }
  
        const shiftData = await shiftResponse.json();
  
        // Step 2: Save the breaks
        if (newShift.breaks && newShift.breaks.length > 0) {
          const breakPromises = newShift.breaks.map((breakItem) =>
            fetch(`${BaseURL}/break/break-types`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...breakItem,
                shiftId: shiftData._id, // Associate the break with the shift
              }),
            })
          );
  
          const breakResponses = await Promise.all(breakPromises);
          for (const response of breakResponses) {
            if (!response.ok) {
              toast.error('Failed to add break', {
                autoClose: 1500 // duration in milliseconds
              });
              throw new Error('Failed to add break');
            }
          }
        }
  
        // Update the shifts state with the new shift
        setShifts([...shifts, shiftData]);
  
        // Reset the newShift state
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
        });
  
        // Close the dialog
        setIsOpen(false);
        toast.success('shift added successfully', {
          autoClose: 1500 // duration in milliseconds
        });
      } catch (error) {
        console.error('Error adding shift:', error);
      }
    } else {
      console.error('Validation failed: Please fill all required fields.');
    }
  };
  const updateShift = async () => {
    if (newShift.name && newShift.startTime && newShift.endTime && newShift.days.length > 0) {
      try {
        // Step 1: Update the shift
        const shiftResponse = await fetch(`${BaseURL}/shift/${newShift._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newShift,
            employees: newShift.employees || [], // Ensure employees are initialized
          }),
        });
  
        if (!shiftResponse.ok) {
          toast.error('Failed to update shift', {
            autoClose: 1500 // duration in milliseconds
          });
          throw new Error('Failed to update shift');
          
        }
  
        const shiftData = await shiftResponse.json();
  
         // Step 2: Handle breaks (update existing or create new ones)
      if (newShift.breaks && newShift.breaks.length > 0) {
        const breakPromises = newShift.breaks.map((breakItem) => {
          // If the break has an _id, it's an existing break that needs to be updated
          if (!breakItem._id.startsWith('temp-')){
            return fetch(`${BaseURL}/break/break-types/${breakItem._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...breakItem,
                shiftId: newShift._id, // Ensure the break is associated with the shift
              }),
            });
          } else {
            // If the break doesn't have an _id, it's a new break that needs to be created
            return fetch(`${BaseURL}/break/break-types`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...breakItem,
                shiftId: newShift._id, // Associate the new break with the shift
              }),
            });
          }
        });

          const breakResponses = await Promise.all(breakPromises);
          for (const response of breakResponses) {
            if (!response.ok) {
              throw new Error('Failed to update break');
            }
          }
        }
  
        // Update the shifts state with the updated shift
        setShifts(shifts.map((shift) => (shift._id === shiftData._id ? shiftData : shift)));
  
        // Reset the newShift state
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
        });
  
        // Close the dialog and reset editing mode
        setIsOpen(false);
        setIsEditing(false);
        // Reset the newShift state
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
        });
        toast.success('shift updat successfully', {
          autoClose: 1500 // duration in milliseconds
        });
      } catch (error) {
        console.error('Error updating shift:', error);
      }
    } else {
      console.error('Validation failed: Please fill all required fields.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      // Call your update function here
      updateShift();
      
    } else {
      // Call your add function here
      addShift();
    }

      // Reset the newShift state to its initial values
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
  });
    setIsOpen(false);
    setIsEditing(false);
   
  };

  const deleteShift = async (id: string) => {
    await fetch(`${BaseURL}/shift/${id}`, { method: 'DELETE' })
    setShifts(shifts.filter(shift => shift._id !== id))
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
      shifts.map(shift => shift.employees!.map(employee => console.log(employee.name))
      )
      setSelectedEmployee('Select employee')
      setSelectedShift('Select shift')
    }
  }

  const removeEmployeeFromShift = async (shiftId: string, employeeId: string) => {
    console.log(employeeId)
    const response = await fetch(`${BaseURL}/shift/${shiftId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    })
    const data = await response.json()
    console.log("in remove employee: ",data)
    setShifts(shifts.map(shift => shift._id === data._id ? data : shift))
  }

  const moveEmployee = async (fromShiftId: string, toShiftId: string, employeeId: string) => {
    console.log(fromShiftId,toShiftId,employeeId)
    const response = await fetch(`${BaseURL}/shift/${fromShiftId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toShiftId, employeeId }),
    })
    const data = await response.json()
    setShifts(shifts.map(shift => shift._id === data._id ? data : shift))
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
      <Button type="button" onClick={() => {
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
    }); 
    setIsOpen(true) }}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Shift
      </Button>
      </div>
       {/* Dialog for Adding and Editing Shifts */}
       <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-6 bg-gray-100 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{isEditing ? "Edit Current Shift":"Add New Shift"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div key={breakItem._id} className="flex items-center gap-2">
           

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
                        const breakId = newShift.breaks![index]._id;
                    
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
                          _id: `temp-${Date.now()}`,
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
                <SelectItem key={shift._id} value={shift._id!}>
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
                    onClick={() => deleteShift(shift._id!)}
                    aria-label={`Delete ${shift.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium mb-2">Assigned Employees:</h4>
                  {shift.employees!.length === 0 ? (
                    <p className="text-sm text-gray-500">No employees assigned</p>
                  ) : (
                    <ul className="space-y-2">
                      
                      {shift.employees!.map(employee => (
                        
                        <>
                          {console.log("Employee inside map:",employee)}
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
                                <Select onValueChange={(value) => moveEmployee(shift._id!, value, employee._id)}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select shift" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {shifts.filter(s => s._id !== shift._id).map(s => (
                                      <SelectItem key={s._id} value={s._id!}>{s.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeEmployeeFromShift(shift._id!, employee._id)}
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

