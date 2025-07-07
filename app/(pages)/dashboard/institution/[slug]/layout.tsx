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


export default function InstitutionLayout( { children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const router = useRouter();

  const [activeSection, setActiveSection] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [institutionInfo, setInstitutionInfo] = useState<Institution | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetchInstitution(slug).then(data => setInstitutionInfo(data));
  }, [slug]);
  // Implement section navigation
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Navigation logic can be handled globally or in each page if needed
  };
  // const handleNavigation = (section: string) => {
  //   setActiveSection(section);
  //   console.log(
  //     "before pass it : ",institutionInfo.uniqueKey
  //   );
  //     router.push(`/dashboard/institution/${slug}/${section}`);

 
  //   setIsSidebarOpen(false);
  // };
  // Implement exit logic
  // const handleExitInstitution = () => {
  //   // Your exit logic here, e.g., router.push("/dashboard")
  // };
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

  return (
    <EmployeeProvider>
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-100">
      <SideBarIns
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onExitInstitution={handleExitInstitution}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
    

      <main className="flex-1 p-2 md:p-4 overflow-y-auto">
        <InstitutionProvider>
 
         {/* <InstitutionDashboard activeSection={activeSection} slug={slug!} /> */}
         {children}
         <ToastContainer />

        </InstitutionProvider>
      </main>
    </div>
    </EmployeeProvider>
  );
}
