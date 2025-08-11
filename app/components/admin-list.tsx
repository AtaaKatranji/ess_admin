"use client"

import { useState, useEffect } from "react"
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

interface Admin {
  id: number
  name: string
  phoneNumber: string
  status: string
  globalRole: string
}

interface AdminLink {
  adminId: number
  institutionId: number
  role: string
  linkedAt: string
  admin: Admin
}

interface AdminListProps {
  institutionId: number
}

const ROLE_COLORS = {
  owner: "destructive",
  manager: "default",
  viewer: "secondary",
} as const

const VALID_ROLES = ["owner", "manager", "viewer"]

export function AdminList({ institutionId }: AdminListProps) {
  const [admins, setAdmins] = useState<AdminLink[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const  baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const fetchAdmins = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${baseUrl}/api/v1/institutions/${institutionId}/admins`,{
        method: 'GET',
        credentials: 'include', 
        headers: { 'Accept': 'application/json' },
        // Wrap in an object
      });
      if (!response.ok) throw new Error("Failed to fetch admins")
      const data = await response.json()
      setAdmins(data)
      console.log("data list admins", data)
    } catch {
      toast({
        title: "Error",
        description: "Failed to load administrators",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (adminId: number, newRole: string) => {
    try {
      const response = await fetch(`${baseUrl}/api/institutions/${institutionId}/admins/${adminId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to change role")
      }

      toast({
        title: "Success",
        description: "Admin role updated successfully",
      })
      fetchAdmins()
    } catch (error) {
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
      fetchAdmins()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove admin",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [institutionId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading administrators...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Institution Administrators</CardTitle>
        <CardDescription>Manage roles and permissions for this institution</CardDescription>
      </CardHeader>
      <CardContent>
        {admins.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No administrators found for this institution</div>
        ) : (
          <div className="space-y-4">
            {admins.map((link) => (
              <div key={link.adminId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{link.admin.name}</h3>
                    <Badge variant={ROLE_COLORS[link.role as keyof typeof ROLE_COLORS]}>{link.role}</Badge>
                    <Badge variant="outline">{link.admin.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {link.admin.phoneNumber}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Linked: {new Date(link.linkedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={link.role} onValueChange={(newRole) => changeRole(link.adminId, newRole)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
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
}
