// /dashboard/institution/[slug]/layout.tsx
"use client";
import React, {  useState } from "react";
import SideBarIns from "@/app/components/SideBarIns";
//import InstitutionDashboard from "@/app/components/InstitutionDashboard";
import { useParams } from 'next/navigation';
import { toast, ToastContainer } from "react-toastify";
import  { useRouter } from "next/navigation";
// import { fetchInstitution } from "@/app/api/institutions/institutions";
// import { InstitutionInfo } from "@/app/types/Institution";
import { InstitutionProvider, useInstitution } from "@/app/context/InstitutionContext";
import { EmployeeProvider } from "@/app/context/EmployeeContext";
import { SocketProvider } from "@/app/context/SocketContext";


export default function InstitutionLayout( { children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();

  // const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const [institutionInfo, setInstitutionInfo] = useState<InstitutionInfo | null>(null);

  // useEffect(() => {
  //   if (!slug) return;
  //   let alive = true;
  
  //   (async () => {
  //     const r = await fetchInstitution(String(slug));
  //     if (!alive) return;
  
  //     if (!r.ok) {
  //       toast.error(r.data?.message ?? `Failed to load institution (HTTP ${r.status})`);
  //       setInstitutionInfo(null);
  //       return;
  //     }
  
  //     setInstitutionInfo(r.data); // r.data هو InstitutionInfo
  //   })();
  
  //   return () => { alive = false; };
  // }, [slug]);

  const { clearInstitutionKey } = useInstitution();
  const handleExitInstitution = () => {
// 
    toast.info(`Exiting institution ${slug}`);
    clearInstitutionKey();
    setTimeout(() => {
      router.push(`/dashboard`);
    }, 1500);
  };
  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  // const toggleSidebar = () => {
  //   setIsSidebarOpen(!isSidebarOpen);
  // };

  return (
    
    <SocketProvider>
    <EmployeeProvider>
    <div className="flex flex-col md:flex-row h-screen min-h-0 min-w-0 overflow-hidden bg-gray-100">
      <SideBarIns
        // activeSection={activeSection}
        // onSectionChange={handleSectionChange}
        onExitInstitution={handleExitInstitution}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
    
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
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
       <main className="flex-1 overflow-y-auto min-h-0">
       <div className="w-full px-3 sm:px-6 pt-14 md:pt-6 pb-6">
      <InstitutionProvider>

       {/* <InstitutionDashboard activeSection={activeSection} slug={slug!} /> */}
       {children}
       <ToastContainer />

      </InstitutionProvider>
      </div>
    </main>      
    </div>
    </EmployeeProvider>
    </SocketProvider>
  );
}
