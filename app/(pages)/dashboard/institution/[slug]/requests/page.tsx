"use client"

import { useState, useEffect } from 'react';


import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'

// type RequestType = {
//   id: number;
//   employeeName: string;
//   requestType: string;
//   startDate: string;
//   endDate: string;
//   status: string;
//   reason?: string; // Added reason property
// };
// Mock data for employee requests
// const mockRequests: RequestType[] = [
//   { id: 1, employeeName: 'John Doe', requestType: 'Vacation', startDate: '2024-07-01', endDate: '2024-07-05', status: 'Pending' },
//   { id: 2, employeeName: 'Jane Smith', requestType: 'Sick Leave', startDate: '2024-06-15', endDate: '2024-06-16', status: 'Pending' },
//   { id: 3, employeeName: 'Mike Johnson', requestType: 'Work from Home', startDate: '2024-06-20', endDate: '2024-06-22', status: 'Pending' },
// ]
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


const LeaveRequestsPage: React.FC = () =>{

  // const [selectedRequest, setSelectedRequest] = useState<string | null>(null); // Allow number or null
  // const [rejectReason, setRejectReason] = useState('')
  // const [showRejectModal, setShowRejectModal] = useState(false)
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const BaseUrl = process.env.NEXT_PUBLIC_API_URL
  // Function to handle a new leave request
  // const handleNewLeaveRequest = (leaveRequest: LeaveRequest) => {
  //   setLeaveRequests((prevRequests) => [leaveRequest, ...prevRequests]);
  // };


  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await fetch(`${BaseUrl}/leaves`);
        const data: LeaveRequest[] = await response.json();
        console.log(data)
        setLeaveRequests(data);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchLeaveRequests();

  }, []);
  const handleApprove = async (id: string) => {
    try {
      // Call the API to approve the leave request
      const response = await fetch(`${BaseUrl}/leaves/${id}/approve`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      // Check if the response is successful
      if (!response.ok) {
          throw new Error('Failed to approve leave request');
      }

      // Update local state after successful API call
      const updatedLeaveRequest = await response.json();
      
      setLeaveRequests(leaveRequests.map(req => 
          req._id === id ? { ...req, status: updatedLeaveRequest.leaveRequest.status } : req
      ));
  } catch (error) {
      console.error('Error approving leave request:', error);
  }
};

  const handleReject = async (id: string) => {
    try {
      // Call the API to approve the leave request
      const response = await fetch(`${BaseUrl}/leaves/${id}/reject`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
          },
      });

      // Check if the response is successful
      if (!response.ok) {
          throw new Error('Failed to reject leave request');
      }

      // Update local state after successful API call
      const updatedLeaveRequest = await response.json();
      
      setLeaveRequests(leaveRequests.map(req => 
          req._id === id ? { ...req, status: updatedLeaveRequest.leaveRequest.status } : req
      ));
  } catch (error) {
      console.error('Error rejecting leave request:', error);
  }
};

  // const submitReject = () => {
  //   setLeaveRequests(leaveRequests.map(req => 
  //     req._id === selectedRequest ? { ...req, status: 'Rejected', reason: rejectReason } : req
  //   ))
  //   setShowRejectModal(false)
  //   setRejectReason('')
  //   setSelectedRequest(null)
  // }

  const toggleExpand = (id: string) => {
    setExpandedRequest(expandedRequest === id ? null : id)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Requests</h1>
      <div className="space-y-4">
        {leaveRequests.map((request) => (
          <div key={request._id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{request.employeeName}</h2>
                <p className="text-sm text-gray-600">{request.type}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  request.status === 'Approved' ? 'bg-green-200 text-green-800' :
                  request.status === 'Rejected' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {request.status}
                </span>
                <button
                  onClick={() => toggleExpand(request._id)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  {expandedRequest === request._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>
            {expandedRequest === request._id && (
              <div className="mt-4 space-y-2">
                <p><span className="font-semibold">Start Date:</span> {request.startDate}</p>
                <p><span className="font-semibold">End Date:</span> {request.endDate}</p>
                {request.status === 'Pending' && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 flex items-center"
                    >
                      <Check size={16} className="mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 flex items-center"
                    >
                      <X size={16} className="mr-1" /> Reject
                    </button>
                  </div>
                )}
                {request.status === 'Rejected' && request.reason && (
                  <p><span className="font-semibold">Reason:</span> {request.reason}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Reject Request</h2>
            <textarea
              className="w-full p-2 border rounded-md mb-4"
              rows={4}
              placeholder="Enter reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}
export default LeaveRequestsPage;