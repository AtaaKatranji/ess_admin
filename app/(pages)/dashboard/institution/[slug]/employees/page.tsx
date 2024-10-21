"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchEmployees } from '@/app/api/employees/employeeId'; // Update import path
import { fetchInstitution } from '@/app/api/institutions/institutions';

const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // To handle loading state
  const [error, setError] = useState<string | null>(null);
  const [key,setKey]=useState('')
  const [institutionId,setInstitutionId]=useState('')
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug; // Get institution ID from URL parameters

  const  fetchins = async () => {
    
    
  
    
  }
  const fetchData = async () => {
    try {
      setLoading(true);
      const dataIns =  await fetchInstitution(Array.isArray(slug) ? slug[0] : slug)!
    setKey(dataIns.uniqueKey);
    setInstitutionId(dataIns._id);
      const data = await fetchEmployees(dataIns.uniqueKey); // Fetch employees by institutionKey
      console.log("users ",data)
      setEmployees(data); // Set the employees fetched from backend
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to fetch employees.');
      setLoading(false);
    }
  };

  useEffect(() => {
    
    // Assuming institutionKey is the same as institutionId, update if needed
    
    fetchData();
  }, []);

  // Filter employees based on the search term
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (employeeId: string) => {
    router.push(`/dashboard/institution/${slug}/employees/${employeeId}`);
  };

  const removeEmployee = (id: number): void => {
    // Implement the logic to remove the employee (e.g., API call)
    setEmployees((prev) => prev.filter((employee) => employee._id !== id));
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
        {filteredEmployees.map((employee) => (
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
