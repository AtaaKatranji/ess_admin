// /dashboard/institution/[slug]/layout.tsx
"use client";
import React, { useEffect, useState } from "react";
import SideBarIns from "@/app/components/SideBarIns";
//import InstitutionDashboard from "@/app/components/InstitutionDashboard";
import { useParams } from 'next/navigation';
import { toast, ToastContainer } from "react-toastify";
import  { useRouter } from "next/navigation";
import { fetchInstitution } from "@/app/api/institutions/institutions";
import { Institution } from "@/app/types/Employee";
import { InstitutionProvider } from "@/app/context/InstitutionContext";
import { EmployeeProvider } from "@/app/context/EmployeeContext";
import { SocketProvider } from "@/app/context/SocketContext";


export default function InstitutionLayout( { children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();

  // const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [institutionInfo, setInstitutionInfo] = useState<Institution | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchInstitution(slug).then(data => setInstitutionInfo(data));
  }, [slug]);

  const handleExitInstitution = () => {

    toast.info(`Exiting institution ${slug}`);
    setTimeout(() => {
      router.push(`/dashboard?adminId=${institutionInfo!.adminId}`);
    }, 1500);
  };
  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  // const toggleSidebar = () => {
  //   setIsSidebarOpen(!isSidebarOpen);
  // };

  /// clasname flex-col md:flex-row h-screen overflow-hidden
  return (
    
    <SocketProvider>
    <EmployeeProvider>
    <div className="flex  bg-gray-100">
      <SideBarIns
        // activeSection={activeSection}
        // onSectionChange={handleSectionChange}
        onExitInstitution={handleExitInstitution}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
    
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <h1 className="text-lg font-semibold">Menu</h1>
        <button onClick={toggleSidebar}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"
              viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>
      {/* Dark Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
       {/* Main Content */}
       <main className="pt-14 md:pt-0 h-[calc(100vh-3.5rem)] md:h-screen overflow-y-auto">
      
      <InstitutionProvider>

       {/* <InstitutionDashboard activeSection={activeSection} slug={slug!} /> */}
       {children}
       <ToastContainer />

      </InstitutionProvider>
    </main>      
    </div>
    </EmployeeProvider>
    </SocketProvider>
  );
}
