// /dashboard/institution/[slug]/Sidebar.tsx
"use client";
import Link from "next/link";
import { Home, Users, Table, FileText, Settings } from "lucide-react";
import { CalendarDays as CalendarDaysIcon, SquareArrowLeft as SquareArrowLeftIcon } from "lucide-react";

import React from "react";
import { useParams, useRouter } from "next/navigation";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onExitInstitution: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarIns: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  onExitInstitution,
  isSidebarOpen,
  
}) => {
  // Inside your SidebarIns function:
const router = useRouter();
const params = useParams();
const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

const handleSectionClick = (section: string) => {
  router.push(`/dashboard/institution/${slug}/${section}`);
};
  return (
    <aside
      className={`${
        isSidebarOpen ? "translate-x-0 " : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 ease-in-out fixed md:static top-0 left-0 z-40 w-64 h-screen bg-gray-800 text-white  flex flex-col  justify-between`}
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.8)), url('')",
        backgroundPosition: "bottom",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <nav className="p-4 space-y-4">
        <h1 className="text-xl font-bold mb-6 hidden md:block">
          Institution Dashboard
        </h1>
        <Link href="#" legacyBehavior>
          <a
            // onClick={() => onSectionChange("overview")}
            onClick={() => handleSectionClick("overview")}
            className={`flex items-center py-2 px-4 ${
              activeSection === "overview" ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Home className="mr-2 h-5 w-5" />
            Overview
          </a>
        </Link>
        {/* <Link href="#" legacyBehavior>
          <a
            //onClick={() => onSectionChange("employees")}
            onClick={() => handleSectionClick("employees")}
            className={`flex items-center py-2 px-4 ${
              activeSection === "employees" ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Users className="mr-2 h-5 w-5" />
            Employees
          </a>
        </Link> */}
        <Link href={`/dashboard/institution/${slug}/employees`} legacyBehavior>
  <a className={activeSection === "employees" ? "bg-blue-600 rounded" : ""}>
    <Users className="mr-2 h-5 w-5" />
    Employees
  </a>
</Link>
        <Link href="#" legacyBehavior>
          <a
            //onClick={() => onSectionChange("shifts")}
            onClick={() => handleSectionClick("shifts")}
            className={`flex items-center py-2 px-4 ${
              activeSection === "shifts" ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Table className="mr-2 h-5 w-5" />
            Shifts
          </a>
        </Link>
        <Link href="#" legacyBehavior>
          <a
            onClick={() => onSectionChange("requests")}
            className={`flex items-center py-2 px-4 ${
              activeSection === "requests" ? "bg-blue-600 rounded" : ""
            }`}
          >
            <FileText className="mr-2 h-5 w-5" />
            Requests
          </a>
        </Link>
        <Link href="#" legacyBehavior>
          <a
            onClick={() => onSectionChange("holidays")}
            className={`flex items-center py-2 px-4 ${
              activeSection === "holidays" ? "bg-blue-600 rounded" : ""
            }`}
          >
            <CalendarDaysIcon className="mr-2 h-5 w-5" />
            Holidays
          </a>
        </Link>
        <Link href="#" legacyBehavior>
          <a
            onClick={() => onSectionChange("settings")}
            className={`flex items-center py-2 px-4 ${
              activeSection === "settings" ? "bg-blue-600 rounded" : ""
            }`}
          >
            <Settings className="mr-2 h-5 w-5" />
            Settings
          </a>
        </Link>
      </nav>
      <div className="p-4">
        <button
          onClick={onExitInstitution}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
        >
          <SquareArrowLeftIcon className="mr-2 h-5 w-5" />
          Exit Institution
        </button>
      </div>
    </aside>
  );
};

export default SidebarIns;
