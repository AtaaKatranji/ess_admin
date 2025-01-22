// app/context/InstitutionContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface InstitutionContextType {
  institutionKey: string;
  setInstitutionKey: (key: string) => void;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [institutionKey, setInstitutionKey] = useState<string>('');

  return (
    <InstitutionContext.Provider value={{ institutionKey, setInstitutionKey }}>
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  if (!context) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return context;
};