"use client";

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Home, Users, FileText, Bell, Settings, Menu, SquareArrowLeftIcon, Table } from 'lucide-react';
import OverviewPage from './overviwe/page';
import EmployeeRequests from './requests/page';
import SettingsPage from './settings/page';
import NotificationsPage from './notifications/page';
import EmployeeList from './employees/page';
import Holiday from './holidays/page';
import { CalendarDaysIcon } from '@heroicons/react/16/solid';
import { fetchInstitution } from '@/app/api/institutions/institutions';
import { Circles } from 'react-loader-spinner';
import { toast, ToastContainer } from 'react-toastify';
import ShiftsPage from './shifts/page';
interface SSIDInfo {
  
  wifiName: string;
  macAddress: string;

}
interface Institution {
  name: string;
  address: string;
  uniqueKey: string;
  macAddresses: SSIDInfo[];
  slug: string;
}
const InstitutionDashboard: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<Institution>({
    name: '',
    address: '',
    uniqueKey: '',
    macAddresses: [],
    slug: '',
  });

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    router.push(`/dashboard/institution/${slug}/${section}`);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    toast.info(`Logging out from institution ${slug}`);
    router.push('/dashboard');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const fetchData = async () => {
    const data = await fetchInstitution(slug.toString());
    setInstitution(data || []);
    setLoading(false); // Stop loading once data is fetched
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPage />;
      case 'employees':
        return <EmployeeList />;
      case 'shifts':
        return <ShiftsPage institutionKey={institution.uniqueKey}  />;
      case 'requests':
        return <EmployeeRequests />;
      case 'notifications':
        return <NotificationsPage params={{ slug }} />;
      case 'holidays':
        return <Holiday />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <div>Select a section from the menu</div>;
    }
  };

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        {/* Loading Spinner */}
        <Circles height="80" width="80" color="#002E3BFF" ariaLabel="loading" />
      </div>
    );
  }

  if (!institution) {
    return <p>Institution not found</p>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile header */}
      <header className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{institution.name}</h1>
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0 ' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static top-0 left-0 z-40 w-64 h-screen bg-gray-800 text-white  flex flex-col  justify-between`}
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8)), url('')`, // Gradient overlay and image
          backgroundPosition: 'bottom',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <nav className="p-4 space-y-4">
          <h1 className="text-xl font-bold mb-6 hidden md:block">Institution Dashboard</h1>
          <Link href="#" legacyBehavior>
            <a
              onClick={() => handleNavigation('overview')}
              className={`flex items-center py-2 px-4 ${activeSection === 'overview' ? 'bg-blue-600 rounded' : ''}`}
            >
              <Home className="mr-2 h-5 w-5" />
              Overview
            </a>
          </Link>
          <Link href="#" legacyBehavior>
            <a
              onClick={() => handleNavigation('employees')}
              className={`flex items-center py-2 px-4 ${activeSection === 'employees' ? 'bg-blue-600 rounded' : ''}`}
            >
              <Users className="mr-2 h-5 w-5" />
              Employees
            </a>
          </Link>
          <Link href="#" legacyBehavior>
            <a
              onClick={() => handleNavigation('shifts')}
              className={`flex items-center py-2 px-4 ${activeSection === 'shifts' ? 'bg-blue-600 rounded' : ''}`}
            >
              <Table className="mr-2 h-5 w-5" />
              Shifts
            </a>
          </Link>
          <Link href="#" legacyBehavior>
            <a
              onClick={() => handleNavigation('requests')}
              className={`flex items-center py-2 px-4 ${activeSection === 'requests' ? 'bg-blue-600 rounded' : ''}`}
            >
              <FileText className="mr-2 h-5 w-5" />
              Requests
            </a>
          </Link>
          <Link href="#" legacyBehavior>
            <a
              onClick={() => handleNavigation('notifications')}
              className={`flex items-center py-2 px-4 ${activeSection === 'notifications' ? 'bg-blue-600 rounded' : ''}`}
            >
              <Bell className="mr-2 h-5 w-5" />
              Notifications
            </a>
          </Link>
          <Link href="#" legacyBehavior>
            <a
              onClick={() => handleNavigation('holidays')}
              className={`flex items-center py-2 px-4 ${activeSection === 'holidays' ? 'bg-blue-600 rounded' : ''}`}
            >
              <CalendarDaysIcon className="mr-2 h-5 w-5" />
              Holidays
            </a>
          </Link>
          <Link href="#" legacyBehavior>
            <a
              onClick={() => handleNavigation('settings')}
              className={`flex items-center py-2 px-4 ${activeSection === 'settings' ? 'bg-blue-600 rounded' : ''}`}
            >
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </a>
          </Link>
        </nav>
        <div className="p-4">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
          >
            <SquareArrowLeftIcon className="mr-2 h-5 w-5" />
            Logout
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default InstitutionDashboard;
