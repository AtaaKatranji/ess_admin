"use client";

import Link from 'next/link';
import { useParams,useRouter } from 'next/navigation';
import React, { useState } from 'react';
import EmployeeDetails from './detials/page';
import EmployeeTasks from './tasks/page';
import { ListCollapse, Menu } from 'lucide-react';
import { ArrowBack, Task } from '@mui/icons-material';
import { ToastContainer } from 'react-toastify';
//import { LogoutIcon } from '@heroicons/react/outline';

const EmployeeDashboard = () => {
  const params = useParams();
  const router = useRouter();
  const { slug, employeeId } = params;// Retrieve the institution ID from the URL

  const [activeSection, setActiveSection] = useState('details'); // Default active section
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const handleNavigation = (section: string) => {
    setActiveSection(section);
    router.push(`/dashboard/institution/${slug}/employees/${employeeId}/${section}`);
  };
  
  const handleLogout = () => {
    // Clear any authentication/session state here if necessary
    // For example, remove tokens, clear cookies, etc.

    console.log(`Logging out from institution ${slug}`);

    // Redirect to the dashboard
    router.back();
  };
  // Define the content to display based on the active section
  const renderContent = () => {
    switch (activeSection) {
      case 'details':
        return <EmployeeDetails />;
      case 'tasks':
        return <EmployeeTasks />;
      
      default:
        return <EmployeeDetails />;
    }
  };
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile header */}
      <header className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Employee Details</h1>
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`${
        isSidebarOpen ? 'translate-x-0 '  : '-translate-x-full'}
         md:translate-x-0 transition-transform duration-300 ease-in-out 
        fixed md:static top-0 left-0 z-40 w-64 h-screen
        bg-gray-800 text-white  flex flex-col  justify-between
      `}
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8)), url('')`, // Gradient overlay and image
        backgroundPosition: 'bottom',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}>
        <nav className="p-4 space-y-4">
          <h1 className="text-xl font-bold mb-6 hidden md:block">{slug}</h1>
          <Link href="#" legacyBehavior>
            <a onClick={() => handleNavigation('details')} className={`flex items-center py-2 px-4 ${activeSection === 'details' ? 'bg-blue-600 rounded' : ''}`}>
              <ListCollapse className="mr-2 h-5 w-5" />
              Information
            </a>
          </Link>
          <Link href="#" legacyBehavior>
            <a onClick={() => handleNavigation('tasks')} className={`flex items-center py-2 px-4 ${activeSection === 'tasks' ? 'bg-blue-600 rounded' : ''}`}>
              <Task className="mr-2 h-5 w-5" />
              Tasks
            </a>
          </Link>
          
        </nav>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
          >
            <ArrowBack className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-2 md:p-4 overflow-y-auto">
      <ToastContainer />
        {renderContent()}
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};
export default EmployeeDashboard;
