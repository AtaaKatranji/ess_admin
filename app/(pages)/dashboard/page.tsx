'use client';

import { useState, useEffect } from 'react';

import { List, Grid, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InstitutionCard from '@/app/components/InstitutionCard';
import {  fetchInstitutionsByAdmin } from '../../api/institutions/institutions';
import { toast, ToastContainer } from 'react-toastify';
import AddInstitutionDialog from '@/app/ui/Addinstitution';
import { useRouter  } from 'next/navigation';
import { Circles } from 'react-loader-spinner'; // For loader
import { motion } from 'framer-motion'; // For animations
import { parseCookies, setCookie } from 'nookies';
import { requestPermission } from '@/app/lib/firebase/requestPermission';



export default function DashboardPage() {

  const navigate = useRouter();
  const [loading, setLoading] = useState(true); // Loading state

  type InstitutionData = {
    _id: string;
    adminId: string;
    name: string;
    address: string;
    keyNumber: string;
    macAddresses: { wifiName: string; mac: string }[];
    image: string;
    slug: string;
  };

  const [view, setView] = useState<'list' | 'grid'>('list');
  const [institutions, setInstitutions] = useState<InstitutionData[]>([]);
  const [adminId, setAdminId] = useState<string>();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setAdminId(params.get('adminId')!);
    }
  }, []);
  useEffect(() => {
  console.log("TEst");
  console.log(adminId);
  
  requestPermission(); 
  },[])

  const fetchData = async () => {
    const data = await fetchInstitutionsByAdmin();
    setInstitutions(data || []);
    setLoading(false); // Stop loading once data is fetched
  }
  const cookies = parseCookies();
  useEffect(() => {
    const savedView = cookies.preferredView;
    if (savedView) {
      setView(savedView as 'list' | 'grid');
    }
   
    setTimeout(() => {
    fetchData();
    
    }, 1000);
  }, []);
  
  
 
  const handleViewChange = (newView: 'list' | 'grid') => {
    setView(newView);
     // Store the preferred view in a cookie
    setCookie(null, 'preferredView', newView, {
      maxAge: 30 * 24 * 60 * 60, // 30 days expiration
      path: '/', // Make the cookie accessible throughout the site
      secure: process.env.NODE_ENV === 'production', // Only set cookies over HTTPS in production
    });
    
  };

  const handleCardClick = async (slug: string) => {
    
    try {
      navigate.push(`/dashboard/institution/${slug}`);
    } catch (error) {
      toast.error(`Error fetching institutions: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        {/* Loading Spinner */}
        <Circles
          height="80"
          width="80"
          color="#002E3BFF"
          ariaLabel="loading"
        />
      </div>
    );
  }

  return (
    <div>
      
      <div>
      {institutions.length === 0 ? (
        <div className="h-screen flex flex-col items-center justify-center text-center ">
          <h1 className="text-3xl font-bold">Welcome to ESS</h1>
          <p className="text-lg">No institutions available yet.</p>
          <AddInstitutionDialog
            
            onSuccess={async () => {
              toast.success('Institution added successfully', {
                autoClose: 2500 // duration in milliseconds
              });
              
              await fetchData();
            }}
          />
          <ToastContainer />
        </div>
      ) : (
        <div>
          <div className="p-6">
            <div className="flex justify-between mb-4 w-full">
              <h2 className="text-3xl font-bold" style={{ color: '#002E3BFF' }}>
                Institutions
              </h2>
              <AddInstitutionDialog
                
                onSuccess={async () => {
                  toast.success('Institution added successfully', {
                    autoClose: 2500 // duration in milliseconds
                  });
                  await fetchData();
                }}
              />
              
            </div>
            <ToastContainer />
            <div className="flex mb-4 space-x-2">
              <Button
                variant={view === 'grid' ? 'default' : 'outline'}
                onClick={() => handleViewChange('grid')}
              >
                <Grid className="mr-2 h-4 w-4" /> Grid View
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                onClick={() => handleViewChange('list')}
              >
                <List className="mr-2 h-4 w-4" /> List View
              </Button>
            </div>
            
            <div
              className={
                view === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                  : 'space-y-2'
              }
            >
              {institutions.map((institution) => (
                <motion.div
                  className="my-2"
                  key={institution._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  
                >
                  <InstitutionCard
                    name={institution.name}
                    address={institution.address}
                    onClick={() => handleCardClick(institution.slug)}
                  >
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </InstitutionCard>
                </motion.div>
              ))}
            </div>
            
          </div>
        </div>
      )}
      
    </div>
    <ToastContainer />
  
    </div>
    
  );
}
