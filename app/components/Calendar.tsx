import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const localizer = momentLocalizer(moment);

const MyCalendar: React.FC = () => {
  const [date, setDate] = useState(new Date());
  // here I will have Call API to fetch events from Back

  const events = [
    {
      title: 'Sample Event',
      start: new Date(2024, 9, 10, 10, 0), // October 10, 2024
      end: new Date(2024, 9, 10, 12, 0), // October 10, 2024
      
    },
    {
      title: 'New Event',
      start: new Date(2024, 9, 11, 10, 0), // October 10, 2024
      end: new Date(2024, 9, 11, 12, 0), // October 10, 2024
    },
  ];

  const onNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  return (
    <div>
      {/* <div className="calendar-controls">
        <button onClick={() => onNavigate(moment(date).subtract(1, 'd').toDate())}>Previous</button>
        <button onClick={() => onNavigate(new Date())}>Today</button>
        <button onClick={() => onNavigate(moment(date).add(1, 'd').toDate())}>Next</button>
      </div> */}
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        date={date}
        onNavigate={onNavigate}
      />
    </div>
  );
};

export default MyCalendar;
