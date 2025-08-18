"use client"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Phone, Calendar } from "lucide-react"


import { useRoles } from "@/hooks/useRoles";
import { useAdmins } from "@/hooks/useAdmins"
import { Role } from "../types/rbac"


interface AdminListProps {
  institutionId: number
}

const ROLE_COLORS = {
  owner: "destructive",
  manager: "default",
  viewer: "secondary",
} as const

// const VALID_ROLES = ["owner", "manager", "viewer"]

export default function AdminList({ institutionId }: AdminListProps) {
  ///const [admins, setAdmins] = useState<AdminLink[]>([])

  const { toast } = useToast()
  const  baseUrl = process.env.NEXT_PUBLIC_API_URL;

// بدي استخدم SWR لتحميل المدخلات والتحديث عند تغيير الانترنت
const { admins, isLoading: adminsLoading, mutateAdmins } = useAdmins(institutionId);
const { roles, isLoading: rolesLoading, isError: rolesError } = useRoles();




  // const fetchAdmins = async () => {
  //   try {
  //     setLoading(true)
      
  //     const response = await fetch(`${baseUrl}/rbac/admins/${institutionId}`,{
  //       method: 'GET',
  //       credentials: 'include', 
  //       headers: { 'Accept': 'application/json' },
  //       // Wrap in an object
  //     });
  //     if (!response.ok) throw new Error("Failed to fetch admins")
  //     const data = await response.json()
  //     setAdmins(data)
  //     console.log("data list admins", data)
  //   } catch {
  //     toast({
  //       title: "Error",
  //       description: "Failed to load administrators",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const changeRole = async (adminId: number, newRoleId: number) => {

    const newRole: Role | undefined = roles.find((r) => r.id === newRoleId);
    // Optional: optimistic update (only if your admins list comes from SWR)
    await mutateAdmins(
      (prev) =>
        (prev ?? []).map((link) =>
          link.adminId === adminId
            ? {
                ...link,
                role: newRole ?? link.role, // if roles not loaded yet, keep old
              }
            : link
        ),
      { revalidate: false, populateCache: true }
    );
    try {
      const response = await fetch(`${baseUrl}/api/institutions/${institutionId}/admins/${adminId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ role: newRoleId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to change role")
      }
      await mutateAdmins();
      toast({
        title: "Success",
        description: "Admin role updated successfully",
      })

    } catch (error) {
      await mutateAdmins();
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change role",
        variant: "destructive",
      })
    }
  }

  const removeAdmin = async (adminId: number) => {
    try {
      const response = await fetch(`${baseUrl}/api/institutions/${institutionId}/admins/${adminId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to remove admin")
      }

      toast({
        title: "Success",
        description: "Admin removed successfully",
      })
      mutateAdmins();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove admin",
        variant: "destructive",
      })
    }
  }


  
  if (adminsLoading) {
    return (
      <Card className="rounded-2xl my-3 sm:my-8">
        <CardContent className="p-6">
          <div className="text-center">Loading administrators...</div>
        </CardContent>
      </Card>
    )
  }
  if (rolesError) {
    // Optional: show a subtle warning somewhere in your UI
    console.warn("Failed to load roles");
  }
  return (
    <Card className="rounded-2xl my-3 sm:my-8">
      <CardHeader>
        <CardTitle className="text-gray-800">Institution Administrators</CardTitle>
        <CardDescription>Manage roles and permissions for this institution</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {admins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No administrators found for this institution</div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {admins.map((link) => (
              <div key={link.adminId}  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 border rounded-lg">
                <div className="flex-1  min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="font-semibold truncate">{link.admin.name}</h3>
                    <Badge variant={ROLE_COLORS[link.role.name as keyof typeof ROLE_COLORS]}>
  {link.role.name}
</Badge>
                    <Badge variant="outline">{link.admin.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span className="truncate">{link.admin.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Linked: {new Date(link.linkedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto shrink-0 w-full sm:w-auto">
                  <Select  value={link.role?.id.toString()} onValueChange={(newRole) => changeRole(link.adminId, Number(newRole))} disabled={rolesLoading}>
                    <SelectTrigger className="w-full sm:w-44">
                      <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"}>
                        {/* If you prefer a custom display, you can show the current role name here */}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {rolesLoading && (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      )}
                      {!rolesLoading &&
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm"  className="w-full sm:w-auto">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Administrator</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove {link.admin.name} from this institution? This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeAdmin(link.adminId)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
};
AdminList.displayName = "AdminList";