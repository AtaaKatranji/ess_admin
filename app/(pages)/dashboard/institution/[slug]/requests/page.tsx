"use client";

import { useState, useEffect } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";

interface LeaveRequest {
  _id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  type: string;
  status: string;
  reason: string;
  employeeName: string;
}

const LeaveRequestsPage: React.FC = () => {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(`${BaseUrl}/leaves`);
        const data: LeaveRequest[] = await response.json();
        setLeaveRequests(data);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, [BaseUrl]);

  const handleApprove = async (id: string) => {
    // Approve logic here
  };

  const handleReject = async (id: string) => {
    // Reject logic here
  };

  const toggleExpand = (id: string) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  const formattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Employee Leave Requests</h1>
      <div className="space-y-6">
        {leaveRequests.map((request) => (
          <div
            key={request._id}
            className="bg-white shadow rounded-lg p-6 border border-gray-200 cursor-pointer"
            onClick={() => toggleExpand(request._id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{request.employeeName}</h2>
                <p className="text-sm text-gray-500">{request.type}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  request.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : request.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {request.status}
              </span>
            </div>

            {expandedRequest === request._id && (
              <div className="mt-4 border-t pt-4 space-y-3 text-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <span className="font-semibold">Start Date:</span> {formattedDate(request.startDate)}
                  </p>
                  <p>
                    <span className="font-semibold">End Date:</span> {formattedDate(request.endDate)}
                  </p>
                  {request.reason && request.status === "Rejected" && (
                    <p className="col-span-2">
                      <span className="font-semibold">Reason:</span> {request.reason}
                    </p>
                  )}
                </div>
                {request.status === "Pending" && (
                  <div className="flex space-x-3 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents the click from propagating to the parent div
                        handleApprove(request._id);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                    >
                      <Check size={16} className="mr-2" /> Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents the click from propagating to the parent div
                        handleReject(request._id);
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
                    >
                      <X size={16} className="mr-2" /> Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveRequestsPage;
