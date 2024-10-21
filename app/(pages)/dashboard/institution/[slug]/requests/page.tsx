"use client"

import React, { useState } from 'react'
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react'

type RequestType = {
  id: number;
  employeeName: string;
  requestType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string; // Added reason property
};
// Mock data for employee requests
const mockRequests: RequestType[] = [
  { id: 1, employeeName: 'John Doe', requestType: 'Vacation', startDate: '2024-07-01', endDate: '2024-07-05', status: 'Pending' },
  { id: 2, employeeName: 'Jane Smith', requestType: 'Sick Leave', startDate: '2024-06-15', endDate: '2024-06-16', status: 'Pending' },
  { id: 3, employeeName: 'Mike Johnson', requestType: 'Work from Home', startDate: '2024-06-20', endDate: '2024-06-22', status: 'Pending' },
]

export default function EmployeeRequests() {
  const [requests, setRequests] = useState(mockRequests)
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null); // Allow number or null
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null);

  const handleApprove = (id: number) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: 'Approved' } : req
    ))
  }

  const handleReject = (id: number) => {
    setSelectedRequest(id)
    setShowRejectModal(true)
  }

  const submitReject = () => {
    setRequests(requests.map(req => 
      req.id === selectedRequest ? { ...req, status: 'Rejected', reason: rejectReason } : req
    ))
    setShowRejectModal(false)
    setRejectReason('')
    setSelectedRequest(null)
  }

  const toggleExpand = (id: number) => {
    setExpandedRequest(expandedRequest === id ? null : id)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Requests</h1>
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">{request.employeeName}</h2>
                <p className="text-sm text-gray-600">{request.requestType}</p>
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
                  onClick={() => toggleExpand(request.id)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  {expandedRequest === request.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
              </div>
            </div>
            {expandedRequest === request.id && (
              <div className="mt-4 space-y-2">
                <p><span className="font-semibold">Start Date:</span> {request.startDate}</p>
                <p><span className="font-semibold">End Date:</span> {request.endDate}</p>
                {request.status === 'Pending' && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 flex items-center"
                    >
                      <Check size={16} className="mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
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

      {showRejectModal && (
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
      )}
    </div>
  )
}