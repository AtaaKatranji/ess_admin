"use client"

import { useEffect, useMemo, useState } from "react"
import { LeaveRequestCard } from "@/app/components/leave-request-card"
import { HourlyLeaveCard } from "@/app/components/hourly-leave-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search,Clock, Calendar as LucideCalendar, AlertCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { useSSE } from "@/app/context/SSEContext"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
 
import { Button } from "@/components/ui/button"
import { useInstitution } from "@/app/context/InstitutionContext"
import { toast } from "react-toastify"



// Define the type for a leave request
type LeaveRequest = {
  id: string;
  user: {
    id: string
    name: string
  }
  status: "Pending" | "Approved" | "Rejected";
  startDate: string;
  endDate: string;
  type: "Paid" | "Unpaid";
  annualPaidLeave: number;
  reason: string;}

// Hourly leave (custom break) type definition
type HourlyLeave = {
  breakDetails: {
    id: string;
    employeeId: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: "Approved" | "Rejected" | "Pending"
  };
  employeeDetails: {
    _id: string;
    name: string;
  };
}
export default function LeaveRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [hourlyLeaves, setHourlyLeaves] = useState<HourlyLeave[]>([]);
  const [activeTab, setActiveTab] = useState("pending")
  const [leaveType, setLeaveType] = useState<"daily" | "hourly">("daily");
  const [filterDate, setFilterDate] = useState("");

  const { slug } = useInstitution(); 
  //const { institutionKey } = useInstitution();
  // const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  // const [expandedHourlyLeave, setExpandedHourlyLeave] = useState<string | null>(null);
  const { notificationsHourly, notificationsLeave } = useSSE();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const orgApi = useMemo(() => {
    if (!BaseUrl || !slug) return null;
    const base = `${BaseUrl}/institutions/${slug}`;
    return {
      leaves: {
        list: `${base}/leaves`,
        approve: (id: string) => `${base}/leaves/${id}/approve`,
        reject: (id: string) => `${base}/leaves/${id}/reject`,
      },
      hourly: {
        list: `${base}/break/employee-breaks/request-custom-break?customBreak=true`,
        status: (id: string) => `${base}/break/employee-breaks/${id}/status`,
      },
    };
  }, [BaseUrl, slug]);
  const fetchLeaveRequests = async () => {
    if (!orgApi) return;
    try {
      const response = await fetch(orgApi.leaves.list, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (response?.status === 401) {
        toast.error("You are not authenticated. Please sign in.");
        return;
      }
      if (response?.status === 403) {
        const data = await response?.json().catch(() => ({}));
        const msg = data?.message || "You do not have permission to send notifications.";
        setAllowed(false); // عطّل الواجهة لاحقًا
        toast.error(msg);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch leave requests");
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setRequests([]);
    }
  };
  const fetchHourlyLeaves = async () => {
    if (!orgApi) return;
    try {
      const response = await fetch(orgApi.hourly.list, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (response?.status === 401) {
        toast.error("You are not authenticated. Please sign in.");
        return;
      }
      if (response?.status === 403) {
        const data = await response?.json().catch(() => ({}));
        const msg = data?.message || "You do not have permission to send notifications.";
        setAllowed(false); // عطّل الواجهة لاحقًا
        toast.error(msg);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch hourly leaves");
      const data = await response.json();
      setHourlyLeaves(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching hourly leaves:", error);
      setHourlyLeaves([]);
    }
  };
 
  // Fetch hourly leaves (custom breaks)
  useEffect(() => {
    if (!orgApi) return;
    fetchLeaveRequests();
    fetchHourlyLeaves();
  }, [orgApi]);

  useEffect(() => {
    if (notificationsHourly.length > 0) {
      fetchHourlyLeaves();
    }
  }, [notificationsHourly]);
  useEffect(() => {
    if (notificationsLeave.length > 0) {
      fetchLeaveRequests();
    }
  }, [notificationsLeave]);
  // Handle daily leave requests
  const handleApprove = async(id: string) => {
    if (!orgApi) return;
    const response = await fetch(orgApi.leaves.approve(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to approve leave request");
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "Approved" } : req)));
  };

  const handleReject = async (id: string) => {
    if (!orgApi) return;
    const response = await fetch(orgApi.leaves.reject(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to reject leave request");
    setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: "Rejected" } : req)));
  };

  const handleTypeChange = (id: string, type: string) => {
    setRequests(requests!.map((req) => (req.id === id ? { ...req, type: type as "Paid" | "Unpaid" } : req)))
  }
// Handle hourly leave requests
// ===== Actions (Hourly) =====
const updateHourlyStatus = async (id: string, status: "Approved" | "Rejected") => {
  if (!orgApi) return;
  const response = await fetch(orgApi.hourly.status(id), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(`Failed to ${status.toLowerCase()} hourly leave`);
  const updated = await response.json(); // توقع { status: "Approved" | "Rejected" ... }
  setHourlyLeaves((prev) =>
    prev.map((leave) =>
      leave.breakDetails.id === id
        ? { ...leave, breakDetails: { ...leave.breakDetails, status: updated.status } }
        : leave
    )
  );
};

const handleApproveHourlyLeave = (id: string) => updateHourlyStatus(id, "Approved");
const handleRejectHourlyLeave = (id: string) => updateHourlyStatus(id, "Rejected");

  // Filter daily leave requests
  const filteredRequests = requests!.filter((req) => {
    //req.employeeName.toLowerCase().includes(searchQuery.toLowerCase())
    const leaveDate = new Date(req.startDate).toISOString().split('T')[0];
    const matchesDate = !filterDate || leaveDate === filterDate;
    const matchesSearch = req.user.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDate && matchesSearch;
  })
  const pendingRequests = filteredRequests.filter((req) => req.status === "Pending")
  const approvedRequests = filteredRequests.filter((req) => req.status === "Approved")
  const rejectedRequests = filteredRequests.filter((req) => req.status === "Rejected")
// Filter hourly leave requests
// const filteredHourlyLeaves = hourlyLeaves.filter((leave) =>
//   leave.employeeDetails.name.toLowerCase().includes(searchQuery.toLowerCase()),
// )
const filteredHourlyLeaves = useMemo(() => 
  hourlyLeaves.filter(leave => {
    const leaveDate = new Date(leave.breakDetails.startTime).toISOString().split('T')[0];
    const matchesDate = !filterDate || leaveDate === filterDate;
    const matchesSearch = leave.employeeDetails.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  }), [hourlyLeaves, filterDate, searchQuery]);

  const pendingHourlyLeaves = useMemo(() =>
    filteredHourlyLeaves.filter(leave => leave.breakDetails.status === "Pending"), [filteredHourlyLeaves]
  );
  
  const approvedHourlyLeaves = useMemo(() =>
    filteredHourlyLeaves.filter(leave => leave.breakDetails.status === "Approved"), [filteredHourlyLeaves]
  );
  
  const rejectedHourlyLeaves = useMemo(() =>
    filteredHourlyLeaves.filter(leave => leave.breakDetails.status === "Rejected"), [filteredHourlyLeaves]
  );
  const banner =
  allowed === false ? (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 mt-0.5" />
        <div>
          <div className="font-semibold">Permission required</div>
          <div className="text-sm">
            Your account doesn’t have <code className="px-1 py-0.5 bg-white rounded border">Permissions</code>. Ask an admin to grant this permission or assign a role that includes it.
          </div>
        </div>
      </div>
    </div>
  ) : null;
return (
  <div className="container min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Leave Requests</h1>
      <p className="text-slate-600">Manage and review employee leave requests</p>
    </div>
    {/* Search and Filter Section */}
    {banner}
    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by employee name..."
                className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-11 px-4 border-slate-200 hover:bg-slate-50 bg-transparent">
                  <LucideCalendar className="mr-2 h-4 w-4 text-slate-500" />
                  {filterDate || "Filter by date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={filterDate ? new Date(filterDate) : undefined}
                  onSelect={(date) => setFilterDate(date ? date.toISOString().split("T")[0] : "")}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
    </div>

    <div className="w-full bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-6 grid grid-cols-2 gap-4">
      <button
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          leaveType === "daily"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
        onClick={() => setLeaveType("daily")}
      >
        <LucideCalendar className="h-4 w-4" />
        <span>Daily Leaves</span>
      </button>
      <button
        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          leaveType === "hourly"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
        onClick={() => setLeaveType("hourly")}
      >
        <Clock className="h-4 w-4" />
        <span>Hourly Leaves</span>
      </button>
    </div>

    {leaveType === "daily" ? (
      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingRequests.length > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" 
          >Approved</TabsTrigger>
          <TabsTrigger value="rejected"
          >Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-0">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8  text-gray-600">No pending requests</div>
          ) : (
            pendingRequests.map((request) => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onTypeChange={handleTypeChange}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          {approvedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No approved requests</div>
          ) : (
            approvedRequests.map((request) => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onTypeChange={handleTypeChange}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          {rejectedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No rejected requests</div>
          ) : (
            rejectedRequests.map((request) => (
              <LeaveRequestCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onTypeChange={handleTypeChange}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    ) : (
      <Tabs defaultValue="pending" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingHourlyLeaves.length > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingHourlyLeaves.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-0">
          {pendingHourlyLeaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No pending hourly leaves</div>
          ) : (
            pendingHourlyLeaves.map((leave) => (
              <HourlyLeaveCard
                key={leave.breakDetails.id}
                leave={{...leave, breakDetails: {...leave.breakDetails, duration: leave.breakDetails.duration.toString()}}}
                onApprove={handleApproveHourlyLeave}
                onReject={handleRejectHourlyLeave}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-0">
          {approvedHourlyLeaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No approved hourly leaves</div>
          ) : (
            approvedHourlyLeaves.map((leave) => (
              <HourlyLeaveCard
                key={leave.breakDetails.id}
                leave={{...leave, breakDetails: {...leave.breakDetails, duration: leave.breakDetails.duration.toString()}}}
                onApprove={handleApproveHourlyLeave}
                onReject={handleRejectHourlyLeave}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-0">
          {rejectedHourlyLeaves.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No rejected hourly leaves</div>
          ) : (
            rejectedHourlyLeaves.map((leave) => (
              <HourlyLeaveCard
                key={leave.breakDetails.id}
                leave={{...leave, breakDetails: {...leave.breakDetails, duration: leave.breakDetails.duration.toString()}}}
                onApprove={handleApproveHourlyLeave}
                onReject={handleRejectHourlyLeave}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    )}
  </div>
)
}


