"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchEmployees } from '@/app/api/employees/employeeId'; // Update import path
import { fetchInstitution } from '@/app/api/institutions/institutions';

interface Employee {
  _id: string;
  name: string;
  position: string;
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const fetchData = async () => {
    try {
      setLoading(true);
      const dataIns = await fetchInstitution(slug!);

      const data = await fetchEmployees(dataIns.uniqueKey);
      console.log("users ", data);
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees.');
    } finally {
      setLoading(false); // Ensure loading is false in both success and error cases
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewDetails = (employeeId: string) => {
    router.push(`/dashboard/institution/${slug}/employees/${employeeId}`);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employees List</h1>
      <ul className="space-y-4">
        {employees.map((employee) => (
          <li key={employee._id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">{employee.name}</h2>
              <p className="text-gray-600">{employee.position}</p>
            </div>
            <button
              onClick={() => handleViewDetails(employee._id)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              View Details
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeList;
