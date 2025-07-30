// /dashboard/institution/[slug]/Sidebar.tsx
"use client";
import Link from "next/link";
import { Home, Users, Table, FileText, Settings, Bell } from "lucide-react";
import { CalendarDays as CalendarDaysIcon, SquareArrowLeft as SquareArrowLeftIcon } from "lucide-react";

import React from "react";
import { useParams, usePathname} from "next/navigation";
import { useEmployee } from "../context/EmployeeContext";


interface SidebarProps {
  // activeSection: string;
  // onSectionChange: (section: string) => void;
  onExitInstitution: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarIns: React.FC<SidebarProps> = ({
  // activeSection,
  // onSectionChange,
  onExitInstitution,
  isSidebarOpen,
  
}) => {
  // Inside your SidebarIns function:
  const { employeeId } = useEmployee();
const params = useParams();
const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

const pathname = usePathname();

const employeeSubMenu = employeeId
? [
    { label: 'Information', href: `/dashboard/institution/${slug}/employees/${employeeId}/details` },
    { label: 'Tasks', href: `/dashboard/institution/${slug}/employees/${employeeId}/tasks` },
    { label: 'Covenant', href: `/dashboard/institution/${slug}/employees/${employeeId}/covenant` },
  ]
: [];
// Utility for highlight
const normalize = (path: string) => path.replace(/\/$/, '');
const isActive = (href: string, exact = false) => {
  if (exact) return normalize(pathname) === normalize(href);
  return normalize(pathname) === normalize(href) || normalize(pathname).startsWith(normalize(href) + '/');
};
  return (
    <aside
      className={`fixed md:static top-0 left-0 z-40 h-screen bg-gray-800 text-white overflow-y-auto
        flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        w-64 md:w-20 lg:w-64
      `}
    >
      <nav className="p-4 space-y-4">
        <h1 className="text-xl font-bold mb-6 hidden md:block">
          Institution Dashboard
        </h1>
        <Link href={`/dashboard/institution/${slug}/`} legacyBehavior>
          <a
            // onClick={() => onSectionChange("overview")}
            className={`flex items-center py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/`, true) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Home className="mr-2 h-5 w-5" />
           <span className="hidden lg:inline">Overview</span>
            
          </a>
        </Link>
        <div>
          <Link href={`/dashboard/institution/${slug}/employees`} legacyBehavior>
            <a
              // onClick={() => onSectionChange('employees')}
              className={`flex items-center py-2 px-4 ${
                isActive(`/dashboard/institution/${slug}/employees`) ? 'bg-blue-600 rounded' : ''
              }`}
            >
              <Users className="mr-2 h-5 w-5" />
             <span className="hidden lg:inline">Employees</span>
              
            </a>
          </Link>

          {/* Employee Submenu */}
          {employeeSubMenu.length > 0 && (
            <ul className="ml-8 mt-2 space-y-2 border-l-2 border-gray-600 pl-2">
              {employeeSubMenu.map((subItem) => (
                <li key={subItem.href}>
                  <Link href={subItem.href} legacyBehavior>
                    <a
                      className={`block py-1 px-2 text-sm rounded ${
                        pathname === subItem.href ? 'bg-blue-500' : 'hover:bg-gray-700'
                      }`}
                    >
                     <span className="hidden lg:inline"> {subItem.label}</span>
                     
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link href={`/dashboard/institution/${slug}/shifts`} legacyBehavior>
          <a
            //onClick={() => onSectionChange("shifts")}
            className={`flex items-center py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/shifts`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Table className="mr-2 h-5 w-5" />
           <span className="hidden lg:inline">Shifts</span>
            
          </a>
        </Link>
        <Link href={`/dashboard/institution/${slug}/requests`} legacyBehavior>
          <a
            //onClick={() => onSectionChange("requests")}
            className={`flex items-center py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/requests`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <FileText className="mr-2 h-5 w-5" />
           <span className="hidden lg:inline">Requests</span>
            
          </a>
        </Link>
        <Link href={`/dashboard/institution/${slug}/holidays`} legacyBehavior>
          <a
            //onClick={() => onSectionChange("holidays")}
            className={`flex items-center py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/holidays`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <CalendarDaysIcon className="mr-2 h-5 w-5" />
           <span className="hidden lg:inline">Holidays</span>
            
          </a>
        </Link>
        <Link href={`/dashboard/institution/${slug}/notifications`} legacyBehavior>
          <a
            //onClick={() => onSectionChange("settings")}
            className={`flex items-center py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/notifications`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Bell className="mr-2 h-5 w-5" />
           <span className="hidden lg:inline">Notifications</span>
            
          </a>
        </Link>
        <Link href={`/dashboard/institution/${slug}/settings`} legacyBehavior>
          <a
            //onClick={() => onSectionChange("settings")}
            className={`flex items-center py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/settings`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Settings className="mr-2 h-5 w-5" />
           <span className="hidden lg:inline">Settings</span>
            
          </a>
        </Link>
      </nav>
      <div className="p-4">
        <button
          onClick={onExitInstitution}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
        >
          <SquareArrowLeftIcon className="mr-2 h-5 w-5" />
         <span className="hidden lg:inline">Exit Institution</span>
          
        </button>
      </div>
    </aside>
  );
};

export default SidebarIns;
