"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';

// Props
 type Props = {
  institutionId: number;
  onDone?: () => void; // Call to refresh the list after create/link
};

// Validation schemas
const createAdminSchema = z.object({
  name: z.string().min(3).max(50),
  phoneNumber: z.string().min(5).max(20),
  password: z.string().min(8),
  globalRole: z.enum(["superAdmin", "regular"]).optional().default("regular"),
  institutionRole: z.enum(["owner", "manager", "viewer"]),
});

 type CreateAdminForm = z.infer<typeof createAdminSchema>;

const linkExistingSchema = z.object({
  phoneNumber: z.string().min(5).max(20),
  institutionRole: z.enum(["owner", "manager", "viewer"]),
});

 type LinkExistingForm = z.infer<typeof linkExistingSchema>;

export default function AddAdminDialog({ institutionId, onDone }: Props) {
  const [open, setOpen] = React.useState(false);

  const {
    register: regCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isSubmittingCreate },
    setValue: setCreateValue,
    watch: watchCreate,
  } = useForm<CreateAdminForm>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      password: "",
      globalRole: "regular",
      institutionRole: "manager",
    },
  });

  const {
    register: regLink,
    handleSubmit: handleLinkSubmit,
    reset: resetLink,
    formState: { errors: linkErrors, isSubmitting: isSubmittingLink },
    setValue: setLinkValue,
  } = useForm<LinkExistingForm>({
    resolver: zodResolver(linkExistingSchema),
    defaultValues: {
      phoneNumber: "",
      institutionRole: "manager",
    },
  });

  const cleanupAndClose = () => {
    resetCreate();
    resetLink();
    setOpen(false);
  };

  // API helpers
  async function apiCreateAdmin(payload: CreateAdminForm) {
    // Matches your createAdmin controller
    const res = await fetch(`/api/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: payload.name,
        phoneNumber: payload.phoneNumber,
        password: payload.password,
        globalRole: payload.globalRole ?? "regular",
      }),
    });
    if (!res.ok) {
      const j = await safeJson(res);
      throw new Error(j?.message || "Failed to create admin");
    }
    const data = await res.json();
    return data?.data?.admin as { id: number; phoneNumber: string; name: string; globalRole: string };
  }

  async function apiFindAdminByPhone(phoneNumber: string) {
    // Provide a simple search endpoint or adapt to yours
    // Example: /api/admins?phone=+963...
    const res = await fetch(`/api/admins?phone=${encodeURIComponent(phoneNumber)}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      const j = await safeJson(res);
      throw new Error(j?.message || "Failed to find admin");
    }
    const data = await res.json();
    // Return first match
    return data?.data?.admin ?? data?.data?.admins?.[0];
  }

  async function apiLinkAdminToInstitution(adminId: number, institutionRole: "owner" | "manager" | "viewer") {
    // Provide this endpoint in your server:
    // POST /api/institutions/:institutionId/admins  body: { adminId, role }
    const res = await fetch(`/api/institutions/${institutionId}/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ adminId, role: institutionRole }),
    });
    if (!res.ok) {
      const j = await safeJson(res);
      throw new Error(j?.message || "Failed to link admin");
    }
    return res.json();
  }

  const onSubmitCreate = async (values: CreateAdminForm) => {
    try {
      // 1) Create admin
      const admin = await apiCreateAdmin(values);
      // 2) Link to institution
      await apiLinkAdminToInstitution(admin.id, values.institutionRole);
      toast.success(`Admin created & linked: ${admin.name} was added successfully.`);
      onDone?.();
      cleanupAndClose();
    } catch (e: unknown) {
      toast.error(e?.message || "Error: something went wrong while creating the admin.");
    }
  };

  const onSubmitLink = async (values: LinkExistingForm) => {
    try {
      // 1) Find admin by phone
      const admin = await apiFindAdminByPhone(values.phoneNumber);
      if (!admin?.id) throw new Error("No admin found with this phone number");
      // 2) Link to institution
      await apiLinkAdminToInstitution(admin.id, values.institutionRole);
      toast.success(`Admin linked: ${admin.name} was linked successfully.`);
      onDone?.();
      cleanupAndClose();
    } catch (e: unknown) {
      toast.error(e?.message || "Linking failed.");
    }
  };

  // Helper to safely parse json
  async function safeJson(res: Response) {
    try { return await res.json(); } catch { return null; }
  }

  // Sanitize phone number spaces (matches your model setter)
  React.useEffect(() => {
    const sub = watchCreate((v, { name }) => {
      if (name === "phoneNumber" && typeof v.phoneNumber === "string") {
        setCreateValue("phoneNumber", v.phoneNumber.replace(/\s+/g, ""), { shouldDirty: true });
      }
    });
    return () => sub.unsubscribe();
  }, [watchCreate, setCreateValue]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <ToastContainer />
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Manager
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Add Administrator to Institution</DialogTitle>
          <DialogDescription>Create a new admin or link an existing one, and set their role within the institution.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create new admin</TabsTrigger>
            <TabsTrigger value="link">Link existing admin</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="e.g., Ahmad" {...regCreate("name")} />
              {createErrors.name && <p className="text-sm text-red-600">{createErrors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Phone number</Label>
              <Input placeholder="+963900000000" {...regCreate("phoneNumber")} />
              {createErrors.phoneNumber && <p className="text-sm text-red-600">{createErrors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" {...regCreate("password")} />
              {createErrors.password && <p className="text-sm text-red-600">{createErrors.password.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Global Role</Label>
                <Select
                  onValueChange={(v) => setCreateValue("globalRole", v as "superAdmin" | "regular")}
                  defaultValue="regular"
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">regular</SelectItem>
                    <SelectItem value="superAdmin">superAdmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Institution Role</Label>
                <Select
                  onValueChange={(v) => setCreateValue("institutionRole", v as "owner" | "manager" | "viewer")}
                  defaultValue="manager"
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">owner</SelectItem>
                    <SelectItem value="manager">manager</SelectItem>
                    <SelectItem value="viewer">viewer</SelectItem>
                  </SelectContent>
                </Select>
                {createErrors.institutionRole && <p className="text-sm text-red-600">{createErrors.institutionRole.message}</p>}
              </div>
            </div>

            <Button
              disabled={isSubmittingCreate}
              onClick={handleCreateSubmit(onSubmitCreate)}
              className="w-full"
            >
              {isSubmittingCreate && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Link
            </Button>
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Admin phone number</Label>
              <Input placeholder="+963900000000" {...regLink("phoneNumber")} onChange={(e) => {
                const v = e.target.value.replace(/\s+/g, "");
                setLinkValue("phoneNumber", v, { shouldDirty: true });
              }} />
              {linkErrors.phoneNumber && <p className="text-sm text-red-600">{linkErrors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Institution Role</Label>
              <Select
                onValueChange={(v) => setLinkValue("institutionRole", v as "owner" | "manager" | "viewer")}
                defaultValue="manager"
              >
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">owner</SelectItem>
                  <SelectItem value="manager">manager</SelectItem>
                  <SelectItem value="viewer">viewer</SelectItem>
                </SelectContent>
              </Select>
              {linkErrors.institutionRole && <p className="text-sm text-red-600">{linkErrors.institutionRole.message}</p>}
            </div>

            <Button
              disabled={isSubmittingLink}
              onClick={handleLinkSubmit(onSubmitLink)}
              className="w-full"
              variant="secondary"
            >
              {isSubmittingLink && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Link existing admin
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
