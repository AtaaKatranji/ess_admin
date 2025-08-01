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
interface SSIDInfo {
  wifiName: string;
  macAddress: string;
}

interface Institution {
  name: string;
  adminId: string;
  address: string;
  uniqueKey: string;
  macAddresses: SSIDInfo[];
  slug: string;
}
interface InstitutionDashboardProps {
  activeSection: string;
}
const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ( {activeSection}  ) => {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    const { setInstitutionKey } = useInstitution();
 
  const [isloading, setIsLoading] = useState(true);
  const [institutionInfo, setInstitutionInfo] = useState<Institution>({
    name: '',
    adminId: '',
    address: '',
    uniqueKey: '',
    macAddresses: [],
    slug: '',
  });

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

        // Fetch the institution data (including the key) from your API
        const institution = await fetchInstitution(slug);
        if (institution && institution.uniqueKey) {
          // Set the institution key in the context
          setInstitutionKey(institution.uniqueKey);
          setInstitutionInfo(institution);
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
      <div className="h-full flex items-center justify-center">
        {/* Loading Spinner */}
        <Circles height="80" width="80" color="#002E3BFF" ariaLabel="loading" />
      </div>
    );
  }

  if (!institutionInfo) {
    return <p>Institution not found</p>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full bg-gray-100">
      {/* Mobile header */}
      <header className="md:hidden bg-gray-800 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold  text-gray-800">{institutionInfo.name}</h1>
        {/* <button onClick={toggleSidebar} className="text-white focus:outline-none">
          <Menu className="h-6 w-6" />
        </button> */}
      </header>

      {/* Main content */}
      <main className="flex-1 p-2 md:p-4 overflow-y-auto">
        
        {renderContent()}
      </main>

      {/* Overlay for mobile */}
      {/* {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )} */}
    </div>
  );
};

export default InstitutionDashboard;