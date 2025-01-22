"use client";

import { useState, useEffect } from "react";
import { Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { sendNotification } from "@/app/api/notifications/notification-api"
// Leave request type definition
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

// Hourly leave (custom break) type definition
interface HourlyLeave {
  _id: string;
  employeeId: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: string;
  employeeName: string;
  customBreak: boolean;
}

const LeaveRequestsPage: React.FC = () => {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [expandedHourlyLeave, setExpandedHourlyLeave] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [hourlyLeaves, setHourlyLeaves] = useState<HourlyLeave[]>([]);
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

  // Fetch leave requests
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(`${BaseUrl}/leaves/`);
        const data: LeaveRequest[] = await response.json();
        setLeaveRequests(data);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      }
    };
    fetchLeaveRequests();
  }, [BaseUrl]);

  // Fetch hourly leaves (custom breaks)
  useEffect(() => {
    const fetchHourlyLeaves = async () => {
      try {
        const response = await fetch(`${BaseUrl}/break/employee-breaks/request-custom-break?customBreak=true`);
        if (!response.ok) {
          throw new Error("Failed to fetch hourly leaves");
        }
        const data = await response.json();
        console.log(data.data)
        setHourlyLeaves(Array.isArray(data.data.data) ? data.data.data : []); // Ensure data is an array
      } catch (error) {
        console.error("Error fetching hourly leaves:", error);
        setHourlyLeaves([]); // Set to empty array on error
      }
    };
    fetchHourlyLeaves();
  }, [BaseUrl]);

  // Handle approve leave request
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`${BaseUrl}/leaves/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to approve leave request");

      const updatedLeaveRequest = await response.json();
      setLeaveRequests(
        leaveRequests.map((req) =>
          req._id === id ? { ...req, status: updatedLeaveRequest.leaveRequest.status } : req
        )
      );
      sendNotification("669272cf3784386de1a710f2", 'Hello from the admin!');
    } catch (error) {
      console.error("Error approving leave request:", error);
    }
  };

  // Handle reject leave request
  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`${BaseUrl}/leaves/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to reject leave request");

      const updatedLeaveRequest = await response.json();
      setLeaveRequests(
        leaveRequests.map((req) =>
          req._id === id ? { ...req, status: updatedLeaveRequest.leaveRequest.status } : req
        )
      );
    } catch (error) {
      console.error("Error rejecting leave request:", error);
    }
  };

  // Handle approve hourly leave (custom break)
  const handleApproveHourlyLeave = async (id: string) => {
    try {
      const response = await fetch(`${BaseUrl}/break/employee-breaks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Approved" }), // Send status as JSON
      });
      if (!response.ok) throw new Error("Failed to approve hourly leave");

      const updatedHourlyLeave = await response.json();
      setHourlyLeaves(
        hourlyLeaves.map((leave) =>
          leave._id === id ? { ...leave, status: updatedHourlyLeave.status } : leave
        )
      );
    } catch (error) {
      console.error("Error approving hourly leave:", error);
    }
  };

  // Handle reject hourly leave (custom break)
  const handleRejectHourlyLeave = async (id: string) => {
    try {
      const response = await fetch(`${BaseUrl}/break/employee-breaks/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" }), // Send status as JSON

      });
      if (!response.ok) throw new Error("Failed to reject hourly leave");

      const updatedHourlyLeave = await response.json();
      setHourlyLeaves(
        hourlyLeaves.map((leave) =>
          leave._id === id ? { ...leave, status: updatedHourlyLeave.status } : leave
        )
      );
    } catch (error) {
      console.error("Error rejecting hourly leave:", error);
    }
  };

  // Format date
  const formattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format time
  const formattedTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString();
  };

  // Toggle expand leave request
  const toggleExpand = (id: string) => {
    setExpandedRequest(expandedRequest === id ? null : id);
  };

  // Toggle expand hourly leave
  const toggleExpandHourlyLeave = (id: string) => {
    setExpandedHourlyLeave(expandedHourlyLeave === id ? null : id);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Employee Requests</h1>

      {/* Two Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 1: Leave Requests */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Leave Requests</h2>
          <div className="space-y-6">
            {leaveRequests.length === 0 ? ( // Check if leaveRequests is empty
              <div className="text-center text-gray-500">
                No leave requests.
              </div>
            ) : (
              leaveRequests.map((request) => (
                <div
                  key={request._id}
                  className="bg-white shadow rounded-lg p-4 border border-gray-200 cursor-pointer"
                  onClick={() => toggleExpand(request._id)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">{request.employeeName}</h2>
                      <p className="text-sm text-gray-500">{request.type}</p>
                    </div>
                    <div className="flex items-center space-x-3">
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
                      <button
                        onClick={() => toggleExpand(request._id)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Expand details"
                      >
                        {expandedRequest === request._id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedRequest === request._id && (
                    <div className="border-t pt-4 space-y-3 text-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <p>
                          <span className="font-semibold">Start Date:</span>{" "}
                          {formattedDate(request.startDate)}
                        </p>
                        <p>
                          <span className="font-semibold">End Date:</span>{" "}
                          {formattedDate(request.endDate)}
                        </p>
                        {request.reason && (
                          <p className="col-span-2">
                            <span className="font-semibold">Reason:</span>{" "}
                            {request.reason}
                          </p>
                        )}
                      </div>
                      {request.status === "Pending" && (
                        <div className="flex space-x-3 mt-3">
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                          >
                            <Check size={16} className="mr-2" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
                          >
                            <X size={16} className="mr-2" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: Hourly Leaves (Custom Breaks) */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Hourly Leaves (Custom Breaks)</h2>
          <div className="space-y-6">
            {hourlyLeaves.length === 0 ? ( // Check if hourlyLeaves is empty
              <div className="text-center text-gray-500">
                No hourly leave requests.
              </div>
            ) : (
              hourlyLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="bg-white shadow rounded-lg p-4 border border-gray-200 cursor-pointer"
                  onClick={() => toggleExpandHourlyLeave(leave._id)}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">{leave.employeeName}</h2>
                      <p className="text-sm text-gray-500">Custom Break</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          leave.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {leave.status}
                      </span>
                      <button
                        onClick={() => toggleExpandHourlyLeave(leave._id)}
                        className="text-gray-500 hover:text-gray-700"
                        aria-label="Expand details"
                      >
                        {expandedHourlyLeave === leave._id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {expandedHourlyLeave === leave._id && (
                    <div className="border-t pt-4 space-y-3 text-gray-700">
                      <div className="grid grid-cols-2 gap-4">
                        <p>
                          <span className="font-semibold">Start Time:</span>{" "}
                          {formattedTime(leave.startTime)}
                        </p>
                        <p>
                          <span className="font-semibold">End Time:</span>{" "}
                          {formattedTime(leave.endTime)}
                        </p>
                        <p>
                          <span className="font-semibold">Duration:</span>{" "}
                          {leave.duration} hours
                        </p>
                      </div>
                      {leave.status === "Pending" && (
                        <div className="flex space-x-3 mt-3">
                          <button
                            onClick={() => handleApproveHourlyLeave(leave._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                          >
                            <Check size={16} className="mr-2" /> Approve
                          </button>
                          <button
                            onClick={() => handleRejectHourlyLeave(leave._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
                          >
                            <X size={16} className="mr-2" /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestsPage;