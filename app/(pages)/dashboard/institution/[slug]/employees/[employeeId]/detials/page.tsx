// app/employee/[employeeId]/page.tsx
"use client";
import { InstitutionProvider } from "@/app/context/InstitutionContext";
import EmployeeDetails from "@/app/components/employeeDetails";

export default function EmployeeDetailsPage() {
  return (
    <InstitutionProvider>
      <EmployeeDetails />
    </InstitutionProvider>
  );
}
