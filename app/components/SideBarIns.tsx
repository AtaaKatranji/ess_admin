// /dashboard/institution/[slug]/Sidebar.tsx
"use client";
import Link from "next/link";
import { Home, Users, Table, FileText, Settings, Bell } from "lucide-react";
import { CalendarDays as CalendarDaysIcon, SquareArrowLeft as SquareArrowLeftIcon } from "lucide-react";

import React, { useEffect } from "react";
import { useParams, usePathname} from "next/navigation";
import { useEmployee } from "../context/EmployeeContext";


interface SidebarProps {
  // activeSection: string;
  // onSectionChange: (section: string) => void;
  onExitInstitution: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}
function useIsLgUp() {
  const [isLg, setIsLg] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsLg(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isLg;
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

const isLg = useIsLgUp();
const showText = isLg || isSidebarOpen;

// كلاس مشترك لعناصر القائمة
const itemBase =
  "flex items-center gap-2 py-2 px-4 rounded transition-colors";
const itemLayout = showText ? "flex-row justify-start" : "md:flex-col md:justify-center";
const itemClasses = (href: string, exact = false) =>
  `${itemBase} ${itemLayout} ${
    isActive(href, exact) ? "bg-blue-600 text-white" : "hover:bg-blue-600/10"
  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800`;

// Utility for highlight
const normalize = (path: string) => path.replace(/\/$/, '');
const isActive = (href: string, exact = false) => {
  if (exact) return normalize(pathname) === normalize(href);
  return normalize(pathname) === normalize(href) || normalize(pathname).startsWith(normalize(href) + '/');
};
useEffect(() => {
  if (isSidebarOpen) document.body.classList.add('overflow-hidden');
  else document.body.classList.remove('overflow-hidden');
  return () => document.body.classList.remove('overflow-hidden');
}, [isSidebarOpen]);
  return (
    <aside
      className={`
        fixed left-0 z-40 bg-gray-800 text-white overflow-y-auto
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        w-64 md:static md:translate-x-0 md:w-20 lg:w-64
        top-14 md:top-0
        h-[calc(100vh-3.5rem)] md:h-screen
      `}
    >
      <nav className="p-4 space-y-4">
        <h1 className="text-xl font-bold mb-6 hidden lg:block">
          Institution Dashboard
        </h1>
        <Link href={`/dashboard/institution/${slug}/`} legacyBehavior>
           <a className={itemClasses(`/dashboard/institution/${slug}/`, true)}>
            <Home className="mr-2 h-5 w-5" />
            {showText && <span className="truncate">Overview</span>}
            
          </a>
        </Link>
        <div>
          <Link href={`/dashboard/institution/${slug}/employees`} legacyBehavior>
          <a className={itemClasses(`/dashboard/institution/${slug}/employees`,false)}>
          
              <Users className="mr-2 h-5 w-5" />
             
             {showText && <span className="truncate">Employees</span>}
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
        <a className={itemClasses(`/dashboard/institution/${slug}/shifts`, false)}>
        
            <Table className="mr-2 h-5 w-5" />
           
           {showText && <span className="truncate">Shifts</span>}
          </a>
        </Link>
        <Link href={`/dashboard/institution/${slug}/requests`} legacyBehavior>
           <a className={`flex items-center lg:justify-start md:justify-center md:flex-col lg:flex-row  gap-2 md:gap-0 lg:gap-2 py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/requests`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <FileText className="mr-2 h-5 w-5" />
           
           {showText && <span className="truncate">Requests</span>}
            
          </a>
        </Link>
        <Link href={`/dashboard/institution/${slug}/holidays`} legacyBehavior>
           <a className={`flex items-center lg:justify-start md:justify-center md:flex-col lg:flex-row gap-2 md:gap-0 lg:gap-2 py-2  px-4 ${
              isActive(`/dashboard/institution/${slug}/holidays`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <CalendarDaysIcon className="mr-2 h-5 w-5" />
           
           {showText && <span className="truncate">Holidays</span>}
          </a>
        </Link>
        <Link href={`/dashboard/institution/${slug}/notifications`} legacyBehavior>
           <a className={`flex items-center lg:justify-start md:justify-center md:flex-col lg:flex-row gap-2 md:gap-0 lg:gap-2 py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/notifications`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Bell className="mr-2 h-5 w-5" />
            {showText && <span className="truncate">Notifications</span>}
           <span className="hidden lg:inline">Notifications</span>
            
          </a>
        </Link>
        <Link href={`/dashboard/institution/${slug}/settings`} legacyBehavior>
        <a className={`flex items-center lg:justify-start md:justify-center md:flex-col lg:flex-row gap-2 md:gap-0 lg:gap-2 py-2 px-4 ${
              isActive(`/dashboard/institution/${slug}/settings`) ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Settings className="mr-2 h-5 w-5" />
            {showText && <span className="truncate">Settings</span>}
            
          </a>
        </Link>
      </nav>
      <div className="p-4">
        <button
          onClick={onExitInstitution}
          className={`w-full px-4 py-2 rounded flex items-center gap-2
            ${showText ? "justify-start" : "justify-center"}
            bg-blue-400 hover:bg-blue-600/10 text-white`}
        >
          <SquareArrowLeftIcon className="h-5 w-5" />
          {showText && <span>Exit Institution</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidebarIns;
