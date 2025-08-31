// /dashboard/institution/[slug]/Sidebar.tsx
"use client";
import Link from "next/link";
import { Home, Users, Table, FileText, Settings, Bell } from "lucide-react";
import { CalendarDays as CalendarDaysIcon, SquareArrowLeft as SquareArrowLeftIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useEmployee } from "../context/EmployeeContext";

interface SidebarProps {
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
  onExitInstitution,
  isSidebarOpen,
  toggleSidebar,
}) => {
  const { employeeId } = useEmployee();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : (params.slug as string);
  const pathname = usePathname();

  const employeeSubMenu = employeeId
    ? [
        { label: "Information", href: `/dashboard/institution/${slug}/employees/${employeeId}/details` },
        { label: "Tasks", href: `/dashboard/institution/${slug}/employees/${employeeId}/tasks` },
        { label: "Covenant", href: `/dashboard/institution/${slug}/employees/${employeeId}/covenant` },
      ]
    : [];

  const isLg = useIsLgUp();
  const showText = isLg || isSidebarOpen;

  // ===== Helpers =====
  const normalize = (path: string) => path.replace(/\/$/, "");
  const isActive = (href: string, exact = false) => {
    if (exact) return normalize(pathname) === normalize(href);
    return (
      normalize(pathname) === normalize(href) ||
      normalize(pathname).startsWith(normalize(href) + "/")
    );
  };

  const itemBase =
    "group flex items-center gap-2 py-2 px-4 rounded-lg transition-colors text-slate-200";
    const itemLayout = "flex-row";
  const itemClasses = (href: string, exact = false) =>
    `${itemBase} ${itemLayout} ${
      isActive(href, exact) ? "bg-blue-600 text-white" : "hover:bg-blue-600/10"
    } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800`;

  // Lock body scroll when open (already good)
  useEffect(() => {
    if (isSidebarOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, [isSidebarOpen]);

  // Close drawer on link click in mobile only
  const onNavItemClick = () => {
    if (!isLg) toggleSidebar();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        aria-hidden={!isSidebarOpen}
        onClick={toggleSidebar}
        className={`fixed inset-0 z-30 bg-black/40 md:hidden transition-opacity ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        role="navigation"
        aria-label="Institution sidebar"
        aria-expanded={isSidebarOpen}
        className={`
          fixed left-0 z-40 bg-gray-800 text-white
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          w-64 md:static md:translate-x-0 md:w-20 lg:w-64
          top-14 md:top-0
          h-[calc(100dvh-3.5rem)] md:h-dvh
          pb-[env(safe-area-inset-bottom)]
          flex flex-col
        `}
      >
        <nav className="p-4 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          <h1 className="text-xl font-bold mb-6 hidden lg:block">Institution Dashboard</h1>

          <Link
            href={`/dashboard/institution/${slug}/`}
            className={itemClasses(`/dashboard/institution/${slug}/`, true)}
            onClick={onNavItemClick}
          >
            <Home className={`h-5 w-5 shrink-0 ${showText ? "mr-2" : ""}`} />
            {showText && <span className="truncate">Overview</span>}
          </Link>

          <div>
            <Link
              href={`/dashboard/institution/${slug}/employees`}
              className={itemClasses(`/dashboard/institution/${slug}/employees`, false)}
              onClick={onNavItemClick}
            >
              <Users className={`h-5 w-5 shrink-0 ${showText ? "mr-2" : ""}`} />
              {showText && <span className="truncate">Employees</span>}
            </Link>

            {/* Employee Submenu */}
            {employeeSubMenu.length > 0 && (
              <ul className="ml-8 mt-2 space-y-2 border-l-2 border-gray-600 pl-2">
                {employeeSubMenu.map((subItem) => (
                  <li key={subItem.href}>
                    <Link
                      href={subItem.href}
                      className={`block py-1 px-2 text-sm rounded ${
                        pathname === subItem.href ? "bg-blue-500 text-white" : "hover:bg-gray-700"
                      }`}
                      onClick={onNavItemClick}
                    >
                       {showText && <span>{subItem.label}</span>}
                       {!showText && <span className="sr-only">{subItem.label}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href={`/dashboard/institution/${slug}/shifts`}
            className={itemClasses(`/dashboard/institution/${slug}/shifts`, false)}
            onClick={onNavItemClick}
          >
            <Table className={`h-5 w-5 shrink-0 ${showText ? "mr-2" : ""}`} />
            {showText && <span className="truncate">Shifts</span>}
          </Link>

          <Link
            href={`/dashboard/institution/${slug}/requests`}
            className={itemClasses(`/dashboard/institution/${slug}/requests`, false)}
            onClick={onNavItemClick}
          >
            <FileText className={`h-5 w-5 shrink-0 ${showText ? "mr-2" : ""}`} />
            {showText && <span className="truncate">Requests</span>}
          </Link>

          <Link
            href={`/dashboard/institution/${slug}/holidays`}
            className={itemClasses(`/dashboard/institution/${slug}/holidays`, false)}
            onClick={onNavItemClick}
          >
            <CalendarDaysIcon className={`h-5 w-5 shrink-0 ${showText ? "mr-2" : ""}`} />
            {showText && <span className="truncate">Holidays</span>}
          </Link>

          <Link
            href={`/dashboard/institution/${slug}/notifications`}
            className={itemClasses(`/dashboard/institution/${slug}/notifications`, false)}
            onClick={onNavItemClick}
          >
            <Bell className={`h-5 w-5 shrink-0 ${showText ? "mr-2" : ""}`} />
            {showText && <span className="truncate">Notifications</span>}
          </Link>

          <Link
            href={`/dashboard/institution/${slug}/settings`}
            className={itemClasses(`/dashboard/institution/${slug}/settings`, false)}
            onClick={onNavItemClick}
          >
            <Settings className={`h-5 w-5 shrink-0 ${showText ? "mr-2" : ""}`} />
            {showText && <span className="truncate">Settings</span>}
          </Link>
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={() => {
              onExitInstitution();
              if (!isLg) toggleSidebar();
            }}
            className={`w-full px-4 py-2 rounded flex items-center gap-2
              ${
                showText
                  ? "justify-start bg-blue-600 text-white"
                  : "justify-center bg-transparent hover:bg-blue-600/10 text-white"
              }`}
          >
            <SquareArrowLeftIcon className="h-5 w-5" />
            {showText && <span>Exit Institution</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarIns;
