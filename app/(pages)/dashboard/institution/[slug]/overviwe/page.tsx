"use client";
import { fetchInstitution } from "@/app/api/institutions/institutions";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";



const OverviewPage = () => {
    const params = useParams();
    const slug = params?.slug; 
    const [data, setData] = useState({
        name: '',
        totalEmployees: 0,
        activeRequests: 0,
        recentActivities: [],
      });
    
      useEffect(() => {
        // Fetch data from your backend API for the specific institution
        const fetchData = async () => {
          console.log(slug)
          try {
            const data = await fetchInstitution(slug.toString());
            
            setData(data);
          } catch (error) {
            console.error('Error fetching institution data:', error);
          }
        };
        fetchData();
      }, [slug]);
  return (
    <div>
         
    {/* Display overview content like stats, charts, etc. */}
    <div className="text-2xl mb-4 shadow-md w-full px-6 py-4 bg-white">
    <h2>{data.name}</h2>
    </div>
    
    {/* Overview Content */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
    {/* Summary Cards */}
    <div className="bg-white rounded shadow-md p-4">
      <h3 className="text-lg font-bold">Total Employees</h3>
      <p className="text-3xl mt-2">{data.totalEmployees}</p>
    </div>
    <div className="bg-white rounded shadow-md p-4">
      <h3 className="text-lg font-bold">Active Requests</h3>
      <p className="text-3xl mt-2">{data.activeRequests}</p>
    </div>
    <div className="bg-white rounded shadow-md p-4">
      <h3 className="text-lg font-bold">Recent Activities</h3>
      <ul className="list-disc list-inside mt-2">
        {/* {data.recentActivities.length > 0 ? (
          data.recentActivities.map((activity, index) => (
            <li key={index} className="text-sm">{activity}</li>
          ))
        ) : (
          <li className="text-sm text-gray-500">No recent activities</li>
        )} */}
      </ul>
    </div>
    </div>
    
    {/* Chart Example */}
    <div className="p-6">
    <div className="bg-white p-6 rounded shadow-md">
      <h3 className="text-lg font-bold mb-4">Employee Attendance Chart</h3>
      {/* Placeholder for chart - you can use a library like Chart.js, Recharts, etc. */}
      <div className="h-64 bg-gray-100 flex items-center justify-center">
        <p>Chart goes here</p>
      </div>
    </div>
    </div>
    </div>
   
  )
}

export default OverviewPage;