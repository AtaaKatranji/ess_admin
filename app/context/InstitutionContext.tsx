// // app/context/InstitutionContext.tsx
// 'use client';

// import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

// interface InstitutionContextType {
//   slug: string;
//   setSlug: (s: string) => void;
//   institutionKey: string | null;
//   setInstitutionKey: (key: string | null) => void;
//   clearInstitutionKey: () => void;
// }

// const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

// export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [institutionKey, setInstitutionKeyState] = useState<string | null>(null);
//   useEffect(() => {
//     const saved = typeof window !== 'undefined' ? localStorage.getItem('institutionKey') : null;
//     if (saved) setInstitutionKeyState(saved);
//   }, []);

//   // keep in sync
//   const setInstitutionKey = (key: string | null) => {
//     setInstitutionKeyState(key);
//     if (typeof window === 'undefined') return;
//     if (key) localStorage.setItem('institutionKey', key);
//     else localStorage.removeItem('institutionKey');
//   };
//   const clearInstitutionKey = () => {
//     setInstitutionKey(null); // ببساطة نستعمل الدالة نفسها
//   };

//   return (
//     <InstitutionContext.Provider value={{ institutionKey, setInstitutionKey, clearInstitutionKey  }}>
//       {children}
//     </InstitutionContext.Provider>
//   );
// };

// export const useInstitution = () => {
//   const context = useContext(InstitutionContext);
//   if (!context) {
//     throw new Error('useInstitution must be used within an InstitutionProvider');
//   }
//   return context;
// };
// app/context/InstitutionContext.tsx
"use client";
import React, { createContext, useContext, useState, useMemo } from "react";

type InstitutionCtx = {
  slug: string;
  institutionKey?: string | null;
  setSlug: React.Dispatch<React.SetStateAction<string>>;
  setInstitutionKey: React.Dispatch<React.SetStateAction<string | null>>;
  clearInstitution: () => void;
};

const Ctx = createContext<InstitutionCtx | undefined>(undefined);

export function InstitutionProvider({
  children,
  initialSlug,
}: { children: React.ReactNode; initialSlug: string }) {
  const [slug, setSlug] = useState(initialSlug);
  const [institutionKey, setInstitutionKey] = useState<string | null>(null);

  const value = useMemo(() => ({
    slug,
    institutionKey,
    setSlug,
    setInstitutionKey,
    clearInstitution: () => {
      setInstitutionKey(null);
      // مافي داعي تمسح localStorage بهالحالة (اختياري)
    },
  }), [slug, institutionKey]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInstitution() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useInstitution must be used within InstitutionProvider");
  return v;
}
