// EmployeeContext.tsx
import { createContext, useState, useContext } from 'react';

interface EmployeeContextType {
  employeeId: string | null;
  setEmployeeId: (id: string | null) => void;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider = ({ children }: { children: React.ReactNode }) => {
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  
  return (
    <EmployeeContext.Provider value={{ employeeId, setEmployeeId }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error('useEmployee must be within EmployeeProvider');
  return context;
};
