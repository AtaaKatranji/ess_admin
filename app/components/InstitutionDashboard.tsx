"use client";


import React, { useEffect, useState } from 'react';




import { fetchInstitution } from '@/app/api/institutions/institutions';
import { Circles } from 'react-loader-spinner';
import { useInstitution } from '../context/InstitutionContext';

import ShiftsPage from '@/app/(pages)/dashboard/institution/[slug]/shifts/page'

import PublicHolidaysPage from '../(pages)/dashboard/institution/[slug]/holidays/page';
import OverviewPage from '@/app/(pages)/dashboard/institution/[slug]/overviwe/page';
import EmployeeRequests from '@/app/(pages)/dashboard/institution/[slug]/requests/page'
import SettingsPage from '@/app/(pages)/dashboard/institution/[slug]/settings/page'
import EmployeeList from '@/app/(pages)/dashboard/institution/[slug]/employees/page';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import ForbiddenDialog from './ForbiddenDialog';
import { InstitutionInfo } from "@/app/types/Institution";
interface InstitutionDashboardProps {
  activeSection: string;
}
const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ( {activeSection}  ) => {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const { setInstitutionKey } = useInstitution();
 
  const [isloading, setIsLoading] = useState(true);
  const [institution, setInstitution] = useState<InstitutionInfo| null>(null);
  const [forbiddenOpen, setForbiddenOpen] = React.useState(false);
  const [requiredPerms, setRequiredPerms] = React.useState<string[]>([]);

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewPage />;
      case 'employees':
        return <EmployeeList />;
      case 'shifts':
        return <ShiftsPage />;
      case 'requests':
        return <EmployeeRequests />;
      case 'holidays':
        return <PublicHolidaysPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  useEffect(() => {
    const fetchInstitutionData = async () => {
      setIsLoading(true)
      try {
        if (!slug) return;

        const result = await fetchInstitution(slug);
        if (!result.ok) {
          if (result.status === 403) {
            setRequiredPerms(result.data?.required ?? []);
            setForbiddenOpen(true);
          } else {
            const msg = result.data?.message ?? 'فشل تحميل المؤسسة';
            toast.error(msg);
          }
          setInstitution(null);
          setIsLoading(false);
          return;
        }
        setInstitution(result.data);
        setIsLoading(false);
        // Fetch the institution data (including the key) from your API
        //const institution = await fetchInstitution(slug);
        if (institution && institution.uniqueKey) {
          // Set the institution key in the context
          setInstitutionKey(institution.uniqueKey);
          setInstitution(institution);
        }
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching institution data:', error);
      }
    };

    fetchInstitutionData();
  }, [slug, setInstitutionKey]);

  if (isloading) {
    return (
      <div className="flex items-center justify-center">
        {/* Loading Spinner */}
        <Circles height="80" width="80" color="#002E3BFF" ariaLabel="loading" />
      </div>
    );
  }

  if (!institution) {
    return <p>Institution not found</p>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-100">
      {/* Mobile header */}
      {/* <header className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold  text-gray-800">{institution.name}</h1>
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <Menu className="h-6 w-6" />
        </button>
      </header> */}

      {/* Main content */}
      <main className="flex-1 p-2 md:p-4 overflow-y-auto">
        
        {renderContent()}
      </main>

      {/* Forbidden dialog */}
    <ForbiddenDialog
      open={forbiddenOpen}
      onOpenChange={setForbiddenOpen}
      required={requiredPerms}
      institutionNameOrSlug={slug}
      backHref="/ins"
    />
    </div>
  );
};

export default InstitutionDashboard;