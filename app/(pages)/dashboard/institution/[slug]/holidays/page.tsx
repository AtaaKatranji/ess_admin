"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pencil, Loader2, Lock } from "lucide-react";
import { useI18n } from "@/app/context/I18nContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { useInstitution } from "@/app/context/InstitutionContext";
import { toast } from "react-toastify";

const BaseUrl = process.env.NEXT_PUBLIC_API_URL;

type Holiday = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  institutionId: number;
};

export default function InstitutionHolidaysPage() {
  const { t } = useI18n();
  const { slug } = useInstitution();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [hasReadAccess, setHasReadAccess] = useState(true);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const safeJson = async (res: Response) => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  const fetchHolidays = async () => {
    if (slug) return;
    setLoading(true);
    try {
      const res = await fetch(`${BaseUrl}/institutions/${slug}/holidays/`, {
        credentials: "include",
      });

      if (res.status === 401) {
        setHasReadAccess(false);
        setHolidays([]);
        toast.error(t("holidays.toast.sessionExpired") || "Session expired");
        return;
      }
      if (res.status === 403) {
        setHasReadAccess(false);
        setHolidays([]);
        const body = await safeJson(res);
        toast.error(body?.message ?? (t("holidays.noPermission") || "No permission"));
        return;
      }
      if (!res.ok) {
        const body = await safeJson(res);
        throw new Error(body?.message ?? `Failed to load holidays (HTTP ${res.status})`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Unexpected response format.");
      }
      setHasReadAccess(true);
      setHolidays(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't load holidays.");
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [slug]);

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
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 403) {
        const body = await safeJson(res);
        toast.error(body?.message ?? t(isEditing ? "holidays.dialog.editTitle" : "holidays.dialog.addTitle"));
        return;
      }
      if (!res.ok) {
        const body = await safeJson(res);
        throw new Error(body?.message ?? "Something went wrong.");
      }

      toast.success(t(isEditing ? "holidays.toast.updateSuccess" : "holidays.toast.createSuccess"));
      setIsDialogOpen(false);
      setEditingHoliday(null);
      fetchHolidays();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm(t("holidays.confirmDelete"));
    if (!confirmed) return;

    try {
      const res = await fetch(`${BaseUrl}/institutions/${slug}/holidays/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 403) {
        const body = await safeJson(res);
        toast.error(body?.message ?? "You don't have permission to delete holidays.");
        return;
      }
      if (!res.ok) {
        const body = await safeJson(res);
        throw new Error(body?.message ?? "Delete failed.");
      }

      toast.success(t("holidays.toast.deleteSuccess"));
      fetchHolidays();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <div className="container mx-auto p-4 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t("holidays.title")}</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-gray-800">
              <Plus className="mr-2 w-4 h-4" /> {t("holidays.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? t("holidays.dialog.editTitle") : t("holidays.dialog.addTitle")}</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("holidays.dialog.name")}
                required
              />
              <div className="flex gap-4">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("holidays.dialog.description")}
              />
              <Button type="submit" className="w-full">
                {isEditing ? t("holidays.dialog.update") : t("holidays.dialog.create")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-lg overflow-hidden border">
        <CardContent className="p-5">
          {!hasReadAccess ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-10">
              <div className="p-4 bg-muted rounded-full">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t("holidays.noPermission")}</p>
            </div>
          ) : loading ? (
            <div className="py-10 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("holidays.table.name")}</TableHead>
                  <TableHead>{t("holidays.table.date")}</TableHead>
                  <TableHead>{t("holidays.table.description")}</TableHead>
                  <TableHead className="text-right">{t("holidays.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      {t("holidays.empty")}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
