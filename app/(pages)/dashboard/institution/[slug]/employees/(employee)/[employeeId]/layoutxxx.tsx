"use client";
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Menu, ArrowLeft, ListCollapse, ClipboardEdit } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import React, { useState } from 'react';

export default function EmployeeDashboardLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { slug, employeeId } = params;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    router.push(`/dashboard/institution/${slug}/employees`);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  // Helper to check active
  const isActive = (route: string) => pathname.endsWith(route);

  return (
    <div className="grid grid-cols-[auto_1fr]  bg-gray-100 ">
      {/* Mobile header */}
      <header className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Employee Dashboard</h1>
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'translate-x-0 ' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:h-screen md:static top-0 left-0 z-40 w-64 h-screen bg-gray-800 text-white flex flex-col justify-between  overflow-hidden`}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8)), url('')`,
          backgroundPosition: 'bottom',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}>
        <nav className="p-4 space-y-4">
          <h1 className="text-xl font-bold mb-6 hidden md:block">{slug}</h1>
          <Link href={`/dashboard/institution/${slug}/employees/${employeeId}/details`} className={`flex items-center py-2 px-4 ${isActive('details') ? 'bg-blue-600 rounded' : ''}`}>
            <ListCollapse className="mr-2 h-5 w-5" />
            Information
          </Link>
          <Link href={`/dashboard/institution/${slug}/employees/${employeeId}/tasks`} className={`flex items-center py-2 px-4 ${isActive('tasks') ? 'bg-blue-600 rounded' : ''}`}>
            <ClipboardEdit className="mr-2 h-5 w-5" />
            Tasks
          </Link>
        </nav>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-2 md:p-4 overflow-y-auto">
        <ToastContainer />
        {children}
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
}
