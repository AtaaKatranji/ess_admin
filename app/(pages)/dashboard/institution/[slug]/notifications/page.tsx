"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { fetchShifts } from "@/app/api/shifts/shifts"; // already used in ShiftReports
import { Shift } from "@/app/types/Shift";
import { sendNotifiy } from "@/app/api/notifications/notification-api";
import { useInstitution } from "@/app/context/InstitutionContext";


export default function NotificationPage() {
  const { institutionKey } = useInstitution();
  const [shifts, setShifts] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchShifts(institutionKey).then((data) => setShifts(data));
  }, [institutionKey]);

  const sendNotification = async () => {
    if (!message || !selectedShiftId) {
      toast.error("Please select a shift and enter a message.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendNotifiy(selectedShiftId, title,message);

      const data = await res.json();
      if (res.ok) {
        toast.success("Notification sent successfully!");
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send notification.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error sending notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Send Notification to Shift</h1>
      <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
        <SelectTrigger>
          <SelectValue placeholder="Select Shift" />
        </SelectTrigger>
        <SelectContent>
          {shifts.map((shift: Shift) => (
            <SelectItem key={shift.id} value={shift.id!}>
              {shift.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Textarea
        placeholder="Enter Title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        rows={5}
      />
      <Textarea
        placeholder="Enter your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
      />
      <Button onClick={sendNotification} disabled={loading}>
        {loading ? "Sending..." : "Send Notification"}
      </Button>
    </div>
  );
}



// import React, { useEffect, useState } from 'react';
// import dynamic from 'next/dynamic';
// import Modal from 'react-modal';
// import 'react-quill/dist/quill.snow.css'; // Import Quill styles
// import 'react-datepicker/dist/react-datepicker.css'; // Import DatePicker styles
// import DatePicker from 'react-datepicker'; // Import DatePicker
// import 'react-calendar/dist/Calendar.css';
// import MyCalendar from '@/app/components/Calendar';
// import { NextPage } from 'next';

// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// // Define the Notification interface
// interface Notification {
//   id: string;
//   date: Date;
//   content: string;
// }

// // Define the props for the Notifications component
// interface NotificationsProps {
//   params: {
//     slug: string; // Assuming slug is a string parameter from the URL
//   };
//   searchParams?: {
//     [key: string]: string | string[] | undefined; // Optional searchParams
//   };
// }

// const Notifications: NextPage<NotificationsProps> = ({ params }) => {
//   const institutionId = params.slug;
//   const [announcement, setAnnouncement] = useState('');
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

//   const handleAnnouncementChange = (value: string) => {
//     setAnnouncement(value);
//   };

//   useEffect(() => {
//     // Fetch past notifications from API or local storage
//     // Simulating fetched notifications
//     const fetchedNotifications = [
//       { id: '1', date: new Date('2024-10-01'), content: 'First Announcement' },
//       { id: '2', date: new Date('2024-10-02'), content: 'Second Announcement' },
//     ];
//     setNotifications(fetchedNotifications);
//   }, []);

//   const handleBroadcastAnnouncement = () => {
//     if (selectedDate && announcement) {
//       const newNotification = {
//         id: Math.random().toString(36).substr(2, 9),
//         date: selectedDate,
//         content: announcement,
//       };
//       setNotifications((prev) => [...prev, newNotification]);
//       setAnnouncement(''); // Reset the editor
//       setIsModalOpen(false); // Close the modal after broadcasting
//     }
//   };

//   useEffect(() => {
//     if (isModalOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isModalOpen]);

//   const handleAddNotification = () => {
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <div className="">
//       {/* Nav Bar */}
//       <div className="flex px-4 pt-2 w-full items-center justify-between border-b shadow-md rounded">
//         <h2 className="text-2xl mb-4">Announcements for Institution {institutionId}</h2>
//         <button
//           onClick={handleAddNotification}
//           className="px-4 py-2 bg-green-600 text-white rounded mb-4"
//         >
//           Add Notification
//         </button>
//       </div>
//       <div className="bg-black">
//         <Modal
//           isOpen={isModalOpen}
//           onRequestClose={handleCloseModal}
//           contentLabel="Add Notification"
//           overlayClassName="modal-overlay"
//           className="modal-conten fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/2"
//         >
//           <div className="modal-content p-6 rounded-lg shadow-md bg-white">
//             <h2 className="text-2xl font-bold mb-4">Add Notification</h2>
//             <div className="mb-4">
//               <label className="block text-lg font-semibold mb-2">Select Date:</label>
//               <DatePicker
//                 selected={selectedDate}
//                 onChange={(date) => setSelectedDate(date)}
//                 className="w-full px-4 py-2 border rounded-md"
//               />
//             </div>
//             <ReactQuill
//               value={announcement}
//               onChange={handleAnnouncementChange}
//               theme="snow"
//               className="mb-4"
//             />
//             <div className="flex justify-end space-x-4">
//               <button
//                 onClick={handleBroadcastAnnouncement}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Broadcast Announcement
//               </button>
//               <button
//                 onClick={handleCloseModal}
//                 className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </Modal>
//       </div>
//       {/* Body */}
//       <div>
//         <div className="w-full max-w-screen-lg mx-auto py-4">
//           <MyCalendar />
//         </div>
//         <div className="w-full max-w-screen-lg mx-auto py-4">
//           <h3 className="text-xl mt-6">Past Notifications</h3>
//           <ul className="mt-2">
//             {notifications.map((notification) => (
//               <li key={notification.id} className="p-3 my-5 border-b shadow-md rounded bg-white">
//                 <span>{notification.date.toDateString()}: </span>
//                 <span>{notification.content}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Notifications;

