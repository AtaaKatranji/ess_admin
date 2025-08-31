// app/(admin)/public-holidays/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Card } from "@mui/material";
import { CardContent } from "@/components/ui/card";
import { useInstitution } from "@/app/context/InstitutionContext";

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;
type Holiday = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  institutionId: number;
};

export default function PublicHolidaysPage() {
  const { slug } = useInstitution();
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
useEffect(() => {
  fetchHolidays();
}, []);
const fetchHolidays = async () => {
  const res = await fetch(`${BaseUrl}/institutions/${slug}/holidays/`); // replace with dynamic ID
  const data = await res.json();
  setHolidays(data);
};
const openAddDialog = () => {
  setIsEditing(false);
  setName("");
  setStartDate("");
  setEndDate("");
  setDescription("");
  setIsDialogOpen(true);
};

const handleEditClick = (holiday: Holiday) => {
  setIsEditing(true);
  setEditingHoliday(holiday);
  setName(holiday.name);
  setStartDate(holiday.startDate);
  setEndDate(holiday.endDate);
  setDescription(holiday.description || "");
  setIsDialogOpen(true);
};
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = { name, startDate, endDate, description };

  const url = isEditing
    ? `${BaseUrl}/institutions/${slug}/holidays/${editingHoliday?.id}`
    : `${BaseUrl}/institutions/${slug}/holidays`;

  const method = isEditing ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    fetchHolidays();
    setIsDialogOpen(false);
    setEditingHoliday(null);
  } else {
    alert("Something went wrong");
  }
};

const handleDelete = async (id: number) => {
  const confirmed = confirm("Are you sure you want to delete this holiday?");
  if (!confirmed) return;

  const res = await fetch(`http://localhost:5000/api/holidays/${id}`, {
    method: "DELETE",
  });

  if (res.ok) fetchHolidays();
};
  return (
    <div className="container mx-auto p-4 w-full ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold  text-gray-800">Public Holidays</h2>
        {/* <h2 className="text-2xl font-bold">${institutionKey}</h2> */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-gray-800" ><Plus className="mr-2 w-4 h-4" /> Add Holiday</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Holiday" : "Add New Holiday"}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Holiday name" required />
              <div className="flex gap-4">
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" />
              <Button type="submit" className="w-full">
                {isEditing ? "Update Holiday" : "Create Holiday"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

      </div>
      <Card  className="rounded-lg overflow-hidden">
        <CardContent className="p-5"> 
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No holidays found for this institution.
                  </TableCell>
                </TableRow>
              ) : (
                holidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell>{holiday.name}</TableCell>
                    <TableCell>
                      {format(new Date(holiday.startDate), "yyyy-MM-dd")} to {format(new Date(holiday.endDate), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>{holiday.description}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(holiday)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(holiday.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
    </div>
  );
}


