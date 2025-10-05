
import { useState } from "react";
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  <Card className="w-full border-none shadow-md bg-gradient-to-br from-background to-muted/40 rounded-2xl overflow-hidden">
  {/* HEADER */}
  <CardHeader className="bg-gradient-to-r from-primary/10 to-blue-100/30 dark:from-primary/5 dark:to-muted py-6 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20 ring-2 ring-primary/20">
        <AvatarImage src={employee.avatar || "/placeholder.svg"} alt={employee.name} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xl">
          {getInitials(employee.name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-xl font-semibold text-foreground">{employee.name}</h2>
        <p className="text-sm text-muted-foreground">
          {employee.role || "Employee"}  —  {employee.shiftName || "Unassigned"}
        </p>
        <div className="mt-2">
          <Badge variant={getStatusVariant(employee.status)} className={`${getStatusColor(employee.status)} capitalize`}>
            {employee.status}
          </Badge>
        </div>
      </div>
    </div>

    <div className="flex gap-3">
      <Button onClick={() => setIsEditOpen(true)} size="sm" className="shadow-sm">
        <User className="mr-2 h-4 w-4" /> Edit
      </Button>
      <Button
        variant="destructive"
        onClick={() => setIsResignOpen(true)}
        size="sm"
        className="shadow-sm"
      >
        <CalendarX2 className="mr-2 h-4 w-4" /> Resign
      </Button>
    </div>
  </CardHeader>

  {/* BODY */}
  <CardContent className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {/* Basic Info */}
    <div className="rounded-xl bg-muted/40 p-5 border border-border/40 hover:shadow-sm transition">
      <h3 className="font-semibold mb-3 text-foreground/90 flex items-center gap-2">
        🧍 Basic Information
      </h3>
      <ul className="space-y-1 text-sm">
        <li>Gender: <span className="font-medium">{employee.gender || "—"}</span></li>
        <li>Marital Status: <span className="font-medium capitalize">{employee.maritalStatus || "—"}</span></li>
        <li>Birth Date: <span className="font-medium">{employee.birthDate ? new Date(employee.birthDate).toLocaleDateString() : "—"}</span></li>
        <li>Address: <span className="font-medium">{employee.address || "—"}</span></li>
      </ul>
    </div>

    {/* Employment Details */}
    <div className="rounded-xl bg-muted/40 p-5 border border-border/40 hover:shadow-md transition duration-300">
  <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2 text-base">
  Employment Details
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 text-sm">
   
    <div className="flex items-center gap-2 p-2 bg-white rounded-md">
      <span className="text-muted-foreground font-bold"> Contract Type:</span>
      <span className="font-medium capitalize">{employee.contractType || "—"}</span>
    </div>

    <div className="flex items-center gap-2 p-2 bg-white rounded-md">
      <span className="text-muted-foreground font-bold"> Hire Date:</span>
      <span className="font-medium">
        {employee.hireDate
          ? new Date(employee.hireDate).toLocaleDateString()
          : "—"}
      </span>
    </div>
  </div>
</div>

    {/* Emergency Contact */}
    <div className="rounded-xl bg-muted/40 p-5 border border-border/40 hover:shadow-md transition duration-300">
      <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2 text-base">
        Emergency Contact
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 text-sm">
        <div className="flex items-center gap-2 p-2 bg-white rounded-md">
          <span className="text-muted-foreground font-bold">Name:</span>
          <span className="font-medium">{employee.emergencyContactName || "—"}</span>
        </div>

        <div className="flex items-center gap-2 p-2 bg-white rounded-md">
          <span className="text-muted-foreground font-bold">Relation:</span>
          <span className="font-medium">{employee.emergencyContactRelation || "—"}</span>
        </div>

        <div className="flex items-center gap-2 p-2 bg-white rounded-md">
          <span className="text-muted-foreground font-bold">Phone:</span>
          <span className="font-medium">{employee.emergencyContactPhone || "—"}</span>
        </div>
      </div>
    </div>


    {/* Resignation */}
    {employee.status === "resigned" && (
      <div className="rounded-xl bg-destructive/5 p-5 border border-destructive/30 hover:shadow-md transition duration-300 md:col-span-2 lg:col-span-3">
      <h3 className="font-semibold mb-4 text-destructive flex items-center gap-2 text-base">
        Resignation Details
      </h3>
    
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 text-sm">
        <div className="flex items-center gap-2 p-2 bg-white rounded-md">
          <span className="text-destructive font-bold">Date:</span>
          <span className="font-medium">
            {employee.resignationDate
              ? new Date(employee.resignationDate).toLocaleDateString()
              : "—"}
          </span>
        </div>
    
        <div className="flex items-center gap-2 p-2 bg-white rounded-md">
          <span className="text-destructive font-bold">Reason:</span>
          <span className="font-medium">{employee.resignationReason || "—"}</span>
        </div>
    
        <div className="flex items-center gap-2 p-2 bg-white rounded-md">
          <span className="text-destructive font-bold">Notes:</span>
          <span className="font-medium">{employee.resignationNotes || "—"}</span>
        </div>
      </div>
    </div>
    
    )}
  </CardContent>
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
