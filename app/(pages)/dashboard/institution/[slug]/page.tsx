// app/dashboard/institution/[slug]/page.tsx
'use client';

import { InstitutionProvider } from '@/app/context/InstitutionContext';
import InstitutionDashboard from '@/app/components/InstitutionDashboard';


export default function InstitutionPage() {
  return (
      <InstitutionProvider>
        <InstitutionDashboard /> 
    
      </InstitutionProvider>
 
  );
}