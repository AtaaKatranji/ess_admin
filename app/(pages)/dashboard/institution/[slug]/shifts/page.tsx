'use client'

import { useState } from 'react'
import { PlusCircle, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

type Shift = {
  id: string
  name: string
  startTime: string
  endTime: string
  days: string[]
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [newShift, setNewShift] = useState<Omit<Shift, 'id'>>({
    name: '',
    startTime: '',
    endTime: '',
    days: [],
  })

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
      setShifts([...shifts, { ...newShift, id: Date.now().toString() }])
      setNewShift({ name: '', startTime: '', endTime: '', days: [] })
    }
  }

  const deleteShift = (id: string) => {
    setShifts(shifts.filter(shift => shift.id !== id))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Shift Management</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Add New Shift</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-gray-700">Days of Week</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
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
        <Button type="submit" className="mt-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </form>

      <div>
        <h2 className="text-xl font-semibold mb-4">Current Shifts</h2>
        {shifts.length === 0 ? (
          <p>No shifts added yet.</p>
        ) : (
          <ul className="space-y-4">
            {shifts.map(shift => (
              <li key={shift.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}