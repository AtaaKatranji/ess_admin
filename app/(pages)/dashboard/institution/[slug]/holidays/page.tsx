// app/(admin)/public-holidays/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

type Holiday = {
  id: string;
  name: string;
  date: string;
  description?: string;
};

const mockData: Holiday[] = [
  { id: "1", name: "New Year", date: "2025-01-01", description: "Start of the year" },
  { id: "2", name: "Eid al-Fitr", date: "2025-04-21", description: "End of Ramadan" },
];

export default function PublicHolidaysPage() {
  const [holidays] = useState<Holiday[]>(mockData);
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Public Holidays</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 w-4 h-4" /> Add Holiday</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Holiday</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <Input placeholder="Holiday name" />
              <Input type="date" />
              <Textarea placeholder="Description (optional)" />
              <Button type="submit" className="w-full">Save</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
          {holidays.map((holiday) => (
            <TableRow key={holiday.id}>
              <TableCell>{holiday.name}</TableCell>
              <TableCell>{format(new Date(holiday.date), "yyyy-MM-dd")}</TableCell>
              <TableCell>{holiday.description}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon"><Pencil className="w-4 h-4" /></Button>
                <Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
