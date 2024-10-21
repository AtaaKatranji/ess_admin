import React, { useState } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';   


const AddEventModal: React.FC<{ isOpen: boolean; onClose: () => void; onAddEvent: () => void }> = ({ isOpen, onClose, onAddEvent }) => {
    // ... existing code ...
  
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null); // Allow null type
 
  const handleAddEvent = () => {
    // Validate input and create event object
    const newEvent = {
      name: eventName,
      date: eventDate,
    };

    // Call onAddEvent callback to handle the event
    onAddEvent();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Add Event"
      className="modal fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2"
    >
      <div className="modal-content p-6 rounded-lg shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-4">إضافة حدث</h2>
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-2">اسم الحدث:</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-lg font-semibold mb-2">تاريخ الحدث:</label>
          <DatePicker
            selected={eventDate}
            onChange={(date) => setEventDate(date ? date : null)} // Check if date is null before setting
            dateFormat="yyyy-MM-dd"
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            إلغاء
          </button>
          <button
            onClick={handleAddEvent}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            حفظ
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddEventModal;