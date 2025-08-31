// /dashboard/institution/[slug]/layout.tsx
"use client";
import React, {  useEffect, useState } from "react";
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

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

async function fetchInstitutionBySlug(slug: string) {
  const res = await fetch(`${BaseUrl}/ins/institutions/slug/${slug}`,{
    cache: "no-store",
    credentials: "include", 
    headers: {
      "Content-Type": "application/json",
    }});
  if (!res.ok) throw new Error("Failed to load institution");
  return res.json(); // { institutionKey: '...', name: '...', ... }
}

function LayoutBody({ children, slug }: { children: React.ReactNode; slug: string }) {
  const { setInstitutionKey, clearInstitution, institutionKey } = useInstitution();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!slug) return;
      // إذا كان الـ institutionKey متوفّر مسبقاً لنفس الـ slug، لا داعي لإعادة الجلب
      if (institutionKey) return;

      try {
        const data = await fetchInstitutionBySlug(slug);
        if (!ignore && data?.institutionKey) {
          setInstitutionKey(data.institutionKey);
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to resolve institution");
      }
    })();

    return () => {
      ignore = true;
    };
  }, [slug, institutionKey, setInstitutionKey]);
  
  const handleExitInstitution = () => {
    toast.info(`Exiting institution ${slug}`);
    clearInstitution();
    setTimeout(() => router.push(`/dashboard`), 1000);
  };

  const toggleSidebar = () => setIsSidebarOpen(v => !v);

  return (
    <div className="flex flex-col md:flex-row h-dvh min-h-0 min-w-0 overflow-hidden bg-gray-100">
      <SideBarIns
        onExitInstitution={handleExitInstitution}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <header className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4  bg-gray-800 text-white">
        <h1 className="text-lg font-semibold">Menu</h1>
        <button onClick={toggleSidebar}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black opacity-50 z-30 md:hidden" onClick={toggleSidebar} />
      )}

      <main className="flex-1 overflow-y-auto min-h-0 bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="w-full px-3 sm:px-6 pt-14 md:pt-6 pb-6">
          {children}
          <ToastContainer />
        </div>
      </main>
    </div>
  );
}

export default function InstitutionLayout( { children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = (Array.isArray(params.slug) ? params.slug[0] : params.slug) ?? "";
  return (
    <SocketProvider>
      <EmployeeProvider>
      <InstitutionProvider initialSlug={slug}>
          <LayoutBody slug={slug}>{children}</LayoutBody>
        </InstitutionProvider>
      </EmployeeProvider>
    </SocketProvider>
  );
}
