"use client"

import { useState, useMemo } from 'react'
import { Calendar, momentLocalizer, NavigateAction, ToolbarProps } from 'react-big-calendar'
import moment from 'moment'
import { Edit2, Trash2, IceCream, Circle } from 'lucide-react'
import { Button } from '@mui/material';
import { Input } from '@mui/material';
import { Card, CardContent, CardHeader } from '@mui/material';
//import CustomToolbar from '@/app/components/CustomToolbar'; // Updated casing


// type CustomToolbarProps = ToolbarProps<{ title: string; start: Date; end: Date; allDay: boolean; color: string; }, object>;
// const CustomToolbarComponent: React.FC<CustomToolbarProps> = ({ onNavigate, ...props }) => {
//     const handleNavigate = (direction: string) => {
//         // Implement navigation logic here
//         onNavigate(direction as NavigateAction); // Ensure correct type
//     };

//     return (
//         // ... your toolbar JSX ...
//         <CustomToolbar onNavigate={function (direction: string): void {
//         throw new Error('Function not implemented.')
//       } } />
//     );
// };


const localizer = momentLocalizer(moment)

interface Holiday {
  id: number
  name: string
  date: string
  color: string
  createdAt: number 
}

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: 1, name: "New Year's Day", date: "2024-01-01", color: "#FF0000", createdAt: Date.now() - 1000 },
    { id: 2, name: "Independence Day", date: "2024-07-04", color: "#0000FF", createdAt: Date.now() - 2000 },
  ])
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', color: '#000000' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [date, setDate] = useState(new Date());


  const addHoliday = () => {
    if (newHoliday.name && newHoliday.date) {
      const newHolidayEntry = {
        ...newHoliday,
        id: Date.now(),
        createdAt: Date.now() // Set the creation time
      }
      setHolidays([newHolidayEntry, ...holidays]) // Add new holiday at the beginning
      setNewHoliday({ name: '', date: '', color: '#000000' })
    }
  }

  const startEditing = (id: number) => {
    setEditingId(id)
    const holiday = holidays.find(h => h.id === id)
    if (holiday) {
      setNewHoliday({ name: holiday.name, date: holiday.date, color: holiday.color })
    }
  }

  const saveEdit = () => {
    if (editingId && newHoliday.name && newHoliday.date) {
      setHolidays(holidays.map(h => 
        h.id === editingId ? { ...h, name: newHoliday.name, date: newHoliday.date, color: newHoliday.color } : h
      ).sort((a, b) => b.createdAt - a.createdAt)) // Re-sort after editing
      setEditingId(null)
      setNewHoliday({ name: '', date: '', color: '#000000' })
    }
  }

  const deleteHoliday = (id: number) => {
    setHolidays(holidays.filter(h => h.id !== id))
  }

  // Sort holidays by createdAt (newest first)
  const sortedHolidays = useMemo(() => 
    [...holidays].sort((a, b) => b.createdAt - a.createdAt),
    [holidays]
  )
  // const onNavigate = (direction: string, newDate: Date) => {
  //   setDate(newDate);
  // }
  const onNavigate = (newDate: Date) => {
    setDate(newDate);
  }

  
  const events = useMemo(() => sortedHolidays.map(holiday => ({
    title: holiday.name,
    start: new Date(holiday.date),
    end: new Date(holiday.date),
    allDay: true,
    color: holiday.color, 
    icon: IceCream,
  })), [sortedHolidays])
  // Custom Event Style Getter
  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.color;
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <h2>Holiday Manager</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                type="text"
                placeholder="Holiday name"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                className="flex-grow"
              />
              <Input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="flex-grow"
              />
              <Input
                type="color"
                value={newHoliday.color}
                onChange={(e) => setNewHoliday({ ...newHoliday, color: e.target.value })}
                className="w-12"
              />
              <Button onClick={editingId ? saveEdit : addHoliday} className="w-full sm:w-auto">
                {editingId ? 'Save' : 'Add'}
              </Button>
            </div>
            <ul className="space-y-2 max-h-52 overflow-auto">
              {sortedHolidays.map((holiday) => (
                <li key={holiday.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                  <div className="space-x-2 flex items-center">
                    <Circle  style={{ color: holiday.color , fontSize: '15px'}} />
                    <span>{holiday.name} - {new Date(holiday.date).toLocaleDateString()}</span>
                  </div>
                  <div className="space-x-2">
                    <Button variant="outlined" size="small" onClick={() => startEditing(holiday.id)}>
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => deleteHoliday(holiday.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2>Holiday Calendar</h2>
        </CardHeader>
        <CardContent>
          <div className="h-[600px]">
            <Calendar
               localizer={localizer}
               events={events}
               defaultView={'month'} // Default to Month view
               views={{ month: true, week: false, day: false, agenda: false }} // Enable all views including "agenda"
               step={60} // Step size for time slots in minutes
               showMultiDayTimes
               toolbar // Ensures the navigation toolbar is shown
               selectable // Allows selecting slots for new events
               startAccessor="start"
               endAccessor="end"
               style={{ height: '100%' }}
               eventPropGetter={eventStyleGetter} // Apply custom styling based on color
               date={date}
               
               onNavigate={onNavigate}
               onView={(view) => {
                 console.log('Current view:', view); // Optional: handles view changes
               }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}