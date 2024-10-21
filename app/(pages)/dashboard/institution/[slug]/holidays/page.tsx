"use client"

import { useState, useMemo } from 'react'
import { Calendar, momentLocalizer} from 'react-big-calendar'
import moment from 'moment'
import { Edit2, Trash2, IceCream, Circle } from 'lucide-react'
import { Button } from '@mui/material';
import { Input } from '@mui/material';
import { Card, CardContent, CardHeader } from '@mui/material';
//import { newDate } from 'react-datepicker/dist/date_utils'
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
  start: Date // Assuming start is of type Date
  end: Date  // Assuming end is of type Date
  allDay: boolean
  color: string
  createdAt: number 
}

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: 1, name: "New Year's Day", start: new Date('2023-01-01'),
      end: new Date('2023-01-01'),
      allDay: true, color: "#FF0000", createdAt: Date.now() - 1000 },
    { id: 2, name: "Independence Day", start: new Date('2023-12-25'),
      end: new Date('2023-12-25'),
      allDay: true, color: "#0000FF", createdAt: Date.now() - 2000 },
  ])
  const [newHoliday, setNewHoliday] = useState({id: Date.now(),name: "", start: new Date(),
    end: new Date(),
    allDay: true, color: "#000000",createdAt: Date.now(),})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [date, setDate] = useState(new Date());


  const addHoliday = () => {
    if (newHoliday.name && newHoliday.start) {
      const newHolidayEntry: Holiday = {
        id: Date.now(), // Unique ID based on current timestamp
        name: newHoliday.name, // Name from newHoliday state
        start: new Date(newHoliday.start), // Convert string to Date object
        end: new Date(newHoliday.end || newHoliday.start),
        allDay: true, // Default end to start if not provided
        createdAt: Date.now(), // Set creation time
        color: newHoliday.color || '#000000' // Default color if not provided
      };
  
      setHolidays([newHolidayEntry, ...holidays]); // Add new holiday at the beginning
      setNewHoliday({id: Date.now(), name: '', start: new Date(), end: new Date(),allDay:true, color: '#000000',createdAt: Date.now(), }); // Reset form fields
    }
  };

  const startEditing = (id: number) => {
    setEditingId(id)
    const holiday = holidays.find(h => h.id === id)
    if (holiday) {
      setNewHoliday({id: Date.now(), name: holiday.name, start: holiday.start,end: holiday.start,allDay:true, color: holiday.color,createdAt: Date.now(), })
    }
  }

  const saveEdit = () => {
    if (editingId && newHoliday.name && newHoliday.start) {
      setHolidays(holidays.map(h => 
        h.id === editingId ? { ...h, name: newHoliday.name, date: newHoliday.start, color: newHoliday.color } : h
      ).sort((a, b) => b.createdAt - a.createdAt)) // Re-sort after editing
      setEditingId(null)
      setNewHoliday({id: Date.now(), name: '', start: new Date(), end: new Date(),allDay:true, color: '#000000',createdAt: Date.now(), });
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
    id:holiday.id,
    name: holiday.name,
    start: new Date(holiday.start),
    end: new Date(holiday.end),
    allDay: true,
    color: holiday.color, 
    createdAt:holiday.createdAt,
    icon: IceCream,
  })), [sortedHolidays])
  // Custom Event Style Getter
  const eventStyleGetter = (event: Holiday) => {
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
                value={newHoliday.start}
                onChange={(e) => setNewHoliday({ ...newHoliday, start: new Date(e.target.value) })}
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
                    <span>{holiday.name} - {new Date(holiday.start).toLocaleDateString()}</span>
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