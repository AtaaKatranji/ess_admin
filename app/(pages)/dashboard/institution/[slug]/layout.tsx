// /dashboard/institution/[slug]/layout.tsx
"use client";
import React, { useState } from "react";
import SideBarIns from "@/app/components/SideBarIns";

export default function InstitutionLayout({ children }: { children: React.ReactNode }   ) {
  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Implement section navigation
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Navigation logic can be handled globally or in each page if needed
  };

  // Implement exit logic
  const handleExitInstitution = () => {
    // Your exit logic here, e.g., router.push("/dashboard")
  };

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <SideBarIns
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onExitInstitution={handleExitInstitution}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <main className="flex-1 p-2 md:p-4 overflow-y-auto">{children}</main>
    </div>
  );
}
