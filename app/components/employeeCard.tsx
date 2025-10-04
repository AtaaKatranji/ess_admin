
import { useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, CalendarX2 } from "lucide-react"
import { Employee } from "@/app/types/Employee";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "react-toastify";
import ResignDialog from "./resignDialog";

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
interface EmployeeCardProps {
  employee: Employee
  slug: string
}

export function EmployeeCard({ employee, slug  }: EmployeeCardProps) {

const [isEditOpen, setIsEditOpen] = useState(false);
const [isResignOpen, setIsResignOpen] = useState(false);
const [form, setForm] = useState({
  name: employee.name || "",
  phoneNumber: employee.phoneNumber || "",
  email: employee.email || "",
  address: employee.address || "",
  department: employee.department || "",
  role: employee.role || "",
  gender: employee.gender || "",
  hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : "",
  maritalStatus: employee.maritalStatus || "",
  birthDate: employee.birthDate ? employee.birthDate.split("T")[0] : "",
  emergencyContactName: employee.emergencyContactName || "",
  emergencyContactRelation: employee.emergencyContactRelation || "",
  emergencyContactPhone: employee.emergencyContactPhone || "",
  contractType: employee.contractType || "",
  status: employee.status || "active",
  resignationDate: employee.resignationDate || null,
});
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        phoneNumber: form.phoneNumber,
        email: form.email,
        address: form.address,
        department: form.department,
        role: form.role,
        gender: form.gender,
        hireDate: form.hireDate,
        maritalStatus: form.maritalStatus,
        birthDate: form.birthDate,
        emergencyContactName: form.emergencyContactName,
        emergencyContactRelation: form.emergencyContactRelation,
        emergencyContactPhone: form.emergencyContactPhone,
        contractType: form.contractType,
        status: form.status,
        resignationDate: form.status === "resigned" ? form.resignationDate : null,
      };
    
        const res = await fetch(`${BaseUrl}/api/users/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
         // Include credentials for authentication
        body: JSON.stringify(payload),
        });
    
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Employee updated!");
        setIsEditOpen(false);
        // refresh
    } catch {
        toast.error("Error updating employee");
    }
    };       
const getStatusVariant = (status: string) => {
switch (status) {
    case "active":
    return "default"
    case "resigned":
    return "destructive"
    case "suspended":
    return "secondary"
    default:
    return "outline"
}
}

const getStatusColor = (status: string) => {
switch (status) {
    case "active":
    return "bg-success/10 text-success border-success/20"
    case "resigned":
    return "bg-destructive/10 text-destructive border-destructive/20"
    case "suspended":
    return "bg-warning/10 text-warning border-warning/20"
    default:
    return "bg-muted text-muted-foreground"
}
}

const getInitials = (name: string) => {
return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
const handleResign = async ( resignReason: string) => {
  try {
    const payload = {
      userId: employee.id,
      status: "resigned",
      resignationDate: new Date().toISOString().split("T")[0], // today’s date
      shiftId: null, // unassign shift
      reason: resignReason || null,
    };

    const res = await fetch(`${BaseUrl}/institutions/${slug}/resignations/force`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to resign employee");

    toast.success("Employee resigned successfully!");
    setIsResignOpen(false);
  } catch {
    toast.error("Error while resigning employee");
  }
};
  return (
    <div className="container mx-auto px-4">
  <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
    <CardHeader className="pb-3 px-4 sm:px-6 lg:px-8">
      <div className="flex items-start gap-3 sm:gap-4 lg:gap-6">
        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 ring-2 ring-primary/20 flex-shrink-0">
            <AvatarImage src={employee.avatar || "/placeholder.svg"} alt={employee.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm sm:text-lg lg:text-xl">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-bold text-balance leading-tight mb-1">
              {employee.name}
            </CardTitle>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium">
              {employee.position || "Employee"}
            </p>
            <div className="mt-2">
              <Badge variant={getStatusVariant(employee.status)} className={`${getStatusColor(employee.status)} font-medium px-2 py-1 text-xs lg:text-sm`}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 px-4 sm:px-6 lg:px-8">
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {/* 🏠 Address */}
    <div className="p-4 rounded-lg border bg-muted/20">
      <h3 className="font-semibold text-base mb-2">Basic Information</h3>
      <div className="space-y-1 text-sm">
        <p>Gender: <span className="font-medium">{employee.gender || "—"}</span></p>
        <p>Marital Status: <span className="font-medium capitalize">{employee.maritalStatus || "—"}</span></p>
        <p>Birth Date: <span className="font-medium">{employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : "—"}</span></p>
        <p>Address: <span className="font-medium">{employee.address || "—"}</span></p>
      </div>
    </div>

    {/* 💼 Employment Info */}
    <div className="p-4 rounded-lg border bg-muted/20">
      <h3 className="font-semibold text-base mb-2">Employment Details</h3>
      <div className="space-y-1 text-sm">
        <p>Department: <span className="font-medium">{employee.address || "—"}</span></p>
        <p>Role: <span className="font-medium">{employee.role || "—"}</span></p>
        <p>Contract Type: <span className="font-medium capitalize">{employee.contractType || "—"}</span></p>
        <p>Hire Date: <span className="font-medium">{employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : "—"}</span></p>
        <p>Shift: <span className="font-medium">{employee.shiftName || "Unassigned"}</span></p>
        <p>Status: <span className="font-medium capitalize">{employee.status || "—"}</span></p>
      </div>
    </div>

    {/* ☎️ Emergency Contact */}
    <div className="p-4 rounded-lg border bg-muted/20">
      <h3 className="font-semibold text-base mb-2">Emergency Contact</h3>
      <div className="space-y-1 text-sm">
        <p>Name: <span className="font-medium">{employee.emergencyContactName || "—"}</span></p>
        <p>Relation: <span className="font-medium">{employee.emergencyContactRelation || "—"}</span></p>
        <p>Phone: <span className="font-medium">{employee.emergencyContactPhone || "—"}</span></p>
      </div>
    </div>

    {/* 🧾 Financial & Clearance */}
    <div className="p-4 rounded-lg border bg-muted/20">
      <h3 className="font-semibold text-base mb-2">Financial & Clearance</h3>
      <div className="space-y-1 text-sm">
        <p>Paid Leave Balance: <span className="font-medium">—</span></p>
        <p>Unpaid Leave Balance: <span className="font-medium">—</span></p>
        <p>Assets Cleared: <span className="font-medium text-green-600">✅ Cleared</span></p>
        <p>Final Settlement: <span className="font-medium">$—</span></p>
      </div>
    </div>

    {/* 🧳 Resignation (if resigned) */}
    {employee.status === "resigned" && (
      <div className="p-4 rounded-lg border bg-muted/20 sm:col-span-2 lg:col-span-3">
        <h3 className="font-semibold text-base mb-2">Resignation Details</h3>
        <div className="space-y-1 text-sm">
          <p>Resignation Date: <span className="font-medium">{employee.resignationDate ? new Date(employee.resignationDate).toLocaleDateString() : "—"}</span></p>
          <p>Reason: <span className="font-medium">{employee.resignationReason || "—"}</span></p>
          <p>Notes: <span className="font-medium">{employee.resignationNotes || "—"}</span></p>
        </div>
      </div>
    )}
  </div>
</CardContent>


      <CardFooter className="pt-3 px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6 lg:gap-8">
        <Button 
        onClick={() => setIsEditOpen(true)}
        className="w-full lg:w-auto font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm py-2 px-4 lg:px-6">
          <User className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          Edit General Info
        </Button>
        <Button
          variant="destructive"
          onClick={() => setIsResignOpen(true)}
          className="flex-1 lg:flex-none font-medium shadow-sm"
        >
          <CalendarX2 className="h-4 w-4 mr-2" />
          Resign Employee
        </Button>
      </CardFooter>
    </Card>
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Edit General Information</DialogTitle>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium">Address</label>
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Gender</label>
          <Select
            value={form.gender}
            onValueChange={(val) => setForm({ ...form, gender: val })}
          >
            <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Marital Status</label>
          <Select
            value={form.maritalStatus}
            onValueChange={(val) => setForm({ ...form, maritalStatus: val })}
          >
            <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Birth Date</label>
          <Input
            type="date"
            value={form.birthDate}
            onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Hire Date</label>
          <Input
            type="date"
            value={form.hireDate}
            onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <label className="text-sm font-medium">Emergency Contact Name</label>
          <Input
            value={form.emergencyContactName}
            onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Relation</label>
          <Input
            value={form.emergencyContactRelation}
            onChange={(e) => setForm({ ...form, emergencyContactRelation: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Contact Phone</label>
          <Input
            value={form.emergencyContactPhone}
            onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

<ResignDialog
  employeeName={employee.name}
  open={isResignOpen}
  onOpenChange={setIsResignOpen}
  onConfirm={(resignReason) => handleResign(resignReason)}
/>
    </div>
  )

}
