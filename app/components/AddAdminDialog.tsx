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

type Props = {
  institutionId: number;
  onDone?: () => void; // استدعِ لإعادة تحميل القائمة بعد الإضافة/الربط
};

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

  // POST helpers
  async function apiCreateAdmin(payload: CreateAdminForm) {
    // مطابق لكونترولر createAdmin عندك
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
    // وفّر إندبوينت بسيط للبحث (أو استبدله بما عندك)
    // مثال: /api/admins?phone=+963...
    const res = await fetch(`/api/admins?phone=${encodeURIComponent(phoneNumber)}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      const j = await safeJson(res);
      throw new Error(j?.message || "Failed to find admin");
    }
    const data = await res.json();
    // رجّع أول نتيجة
    return data?.data?.admin ?? data?.data?.admins?.[0];
  }

  async function apiLinkAdminToInstitution(adminId: number, institutionRole: "owner" | "manager" | "viewer") {
    // وفّر هذا الإندبوينت في السيرفر:
    // POST /api/institutions/:institutionId/admins
    // body: { adminId, role: "manager" }
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
      // 1) أنشئ مدير
      const admin = await apiCreateAdmin(values);
      // 2) اربطه بالمؤسسة
      await apiLinkAdminToInstitution(admin.id, values.institutionRole);
      toast.success(  `تم إنشاء وربط المدير: ${admin.name} تمت إضافته بنجاح.` );
      onDone?.();
      cleanupAndClose();
    } catch {
      toast(`خطأ,   حدث خطأ أثناء الإنشاء`);
    }
  };

  const onSubmitLink = async (values: LinkExistingForm) => {
    try {
      // 1) ابحث عن مدير بالهاتف
      const admin = await apiFindAdminByPhone(values.phoneNumber);
      if (!admin?.id) throw new Error("لم يتم العثور على مدير بهذا الرقم");
      // 2) اربطه بالمؤسسة
      await apiLinkAdminToInstitution(admin.id, values.institutionRole);
      toast(`  ربط  المدير بالمؤسسة: ${admin.name} تمت إضافته بنجاح.`);
      onDone?.();
      cleanupAndClose();
    } catch  {
      toast("فشل الربط");
    }
  };

  // Helper to safely parse json
  async function safeJson(res: Response) {
    try { return await res.json(); } catch { return null; }
  }

  // تنظيف فراغات رقم الهاتف (يتوافق مع setter بالموديل)
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
          <DialogTitle>إضافة مشرف للمؤسسة</DialogTitle>
          <DialogDescription>أنشئ مدير جديد أو اربط مدير موجود، وحدّد دوره داخل المؤسسة.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">إنشاء مدير جديد</TabsTrigger>
            <TabsTrigger value="link">ربط مدير موجود</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>الاسم</Label>
              <Input placeholder="مثال: Ahmad" {...regCreate("name")} />
              {createErrors.name && <p className="text-sm text-red-600">{createErrors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input placeholder="+963933001245" {...regCreate("phoneNumber")} />
              {createErrors.phoneNumber && <p className="text-sm text-red-600">{createErrors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>كلمة المرور</Label>
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
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">regular</SelectItem>
                    <SelectItem value="superAdmin">superAdmin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role داخل المؤسسة</Label>
                <Select
                  onValueChange={(v) => setCreateValue("institutionRole", v as "owner" | "manager" | "viewer")}
                  defaultValue="manager"
                >
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
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
              إنشاء وربط
            </Button>
          </TabsContent>

          <TabsContent value="link" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>رقم هاتف المدير</Label>
              <Input placeholder="+963933001245" {...regLink("phoneNumber")} onChange={(e) => {
                const v = e.target.value.replace(/\s+/g, "");
                setLinkValue("phoneNumber", v, { shouldDirty: true });
              }} />
              {linkErrors.phoneNumber && <p className="text-sm text-red-600">{linkErrors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Role داخل المؤسسة</Label>
              <Select
                onValueChange={(v) => setLinkValue("institutionRole", v as "owner" | "manager" | "viewer")}
                defaultValue="manager"
              >
                <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
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
              ربط مدير موجود
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
