// app/context/InstitutionContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface InstitutionContextType {
  institutionKey: string | null;
  setInstitutionKey: (key: string | null) => void;
  clearInstitutionKey: () => void;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [institutionKey, setInstitutionKeyState] = useState<string | null>(null);
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('institutionKey') : null;
    if (saved) setInstitutionKeyState(saved);
  }, []);

  // keep in sync
  const setInstitutionKey = (key: string | null) => {
    setInstitutionKeyState(key);
    if (typeof window === 'undefined') return;
    if (key) localStorage.setItem('institutionKey', key);
    else localStorage.removeItem('institutionKey');
  };
  const clearInstitutionKey = () => {
    setInstitutionKey(null); // ببساطة نستعمل الدالة نفسها
  };

  return (
    <InstitutionContext.Provider value={{ institutionKey, setInstitutionKey, clearInstitutionKey  }}>
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