"use client";
import { createContext, useContext, useEffect, useState } from "react";

interface AnnualLeaveContextProps {
  annualPaidLeaves: number | null;
  refreshAnnualLeave: (employeeId: string) => Promise<void>;
}

const AnnualLeaveContext = createContext<AnnualLeaveContextProps>({
  annualPaidLeaves: null,
  refreshAnnualLeave: async () => {},
});

export function AnnualLeaveProvider({
  employeeId,
  children,
}: {
  employeeId: string;
  children: React.ReactNode;
}) {
  const [annualPaidLeaves, setAnnualPaidLeaves] = useState<number | null>(null);

  const fetchAnnualPaidLeaves = async (employeeId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/annual-leave-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId: employeeId }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      let value = 0;

        // ✅ تحقق من نوع الاستجابة
        if (Array.isArray(data.annualLeave)) {
        // الحالة الأولى: Array
        if (data.annualLeave.length > 0) {
            value = data.annualLeave[0]?.value ?? 0;
        }
        } else if (typeof data.annualLeave === "object" && data.annualLeave !== null) {
        // الحالة الثانية: Object
        value = data.annualLeave.value ?? 0;
        } else if (typeof data.annualLeave === "number") {
        // الحالة الثالثة: رقم مباشر
        value = data.annualLeave;
        }

        setAnnualPaidLeaves(value);
    } catch (error) {
      console.error("Error fetching annual leaves:", error);
      setAnnualPaidLeaves(0);
    }
  };

  useEffect(() => {
    if (employeeId) fetchAnnualPaidLeaves(employeeId);
  }, [employeeId]);

  return (
    <AnnualLeaveContext.Provider
      value={{
        annualPaidLeaves,
        refreshAnnualLeave: fetchAnnualPaidLeaves,
      }}
    >
      {children}
    </AnnualLeaveContext.Provider>
  );
}

export function useAnnualLeave() {
  return useContext(AnnualLeaveContext);
}
