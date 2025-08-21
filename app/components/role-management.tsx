"use client"

import { useState, useEffect } from "react"
import { Shield, Users, Plus, Edit, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"

interface Role {
  id: string
  name: string
  description: string
  level: "global" | "institution"
  permissions: Permission[]
  userCount: number
  createdAt: string
  isSystem: boolean
}

interface Permission {
  id: string
  name: string
  description: string
  category: string
  enabled: boolean
}

const PERMISSION_CATEGORIES = [
  "Institution Management",
  "User Management",
  "Role Management",
  "System Administration",
  "Reports & Analytics",
]

const DEFAULT_PERMISSIONS: Permission[] = [
  {
    id: "view_institutions",
    name: "View Institutions",
    description: "Can view institution details",
    category: "Institution Management",
    enabled: false,
  },
  {
    id: "create_institutions",
    name: "Create Institutions",
    description: "Can create new institutions",
    category: "Institution Management",
    enabled: false,
  },
  {
    id: "edit_institutions",
    name: "Edit Institutions",
    description: "Can modify institution details",
    category: "Institution Management",
    enabled: false,
  },
  {
    id: "delete_institutions",
    name: "Delete Institutions",
    description: "Can delete institutions",
    category: "Institution Management",
    enabled: false,
  },
  {
    id: "view_users",
    name: "View Users",
    description: "Can view user profiles",
    category: "User Management",
    enabled: false,
  },
  {
    id: "create_users",
    name: "Create Users",
    description: "Can create new users",
    category: "User Management",
    enabled: false,
  },
  {
    id: "edit_users",
    name: "Edit Users",
    description: "Can modify user details",
    category: "User Management",
    enabled: false,
  },
  {
    id: "delete_users",
    name: "Delete Users",
    description: "Can delete users",
    category: "User Management",
    enabled: false,
  },
  {
    id: "assign_roles",
    name: "Assign Roles",
    description: "Can assign roles to users",
    category: "Role Management",
    enabled: false,
  },
  {
    id: "view_roles",
    name: "View Roles",
    description: "Can view role details",
    category: "Role Management",
    enabled: false,
  },
  {
    id: "create_roles",
    name: "Create Roles",
    description: "Can create new roles",
    category: "Role Management",
    enabled: false,
  },
  {
    id: "edit_roles",
    name: "Edit Roles",
    description: "Can modify role permissions",
    category: "Role Management",
    enabled: false,
  },
  {
    id: "delete_roles",
    name: "Delete Roles",
    description: "Can delete custom roles",
    category: "Role Management",
    enabled: false,
  },
  {
    id: "system_settings",
    name: "System Settings",
    description: "Can modify system configuration",
    category: "System Administration",
    enabled: false,
  },
  {
    id: "view_reports",
    name: "View Reports",
    description: "Can access reports and analytics",
    category: "Reports & Analytics",
    enabled: false,
  },
]

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: "institution" as "global" | "institution",
    permissions: DEFAULT_PERMISSIONS.map((p) => ({ ...p })),
  })

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockRoles: Role[] = [
      {
        id: "1",
        name: "Super Admin",
        description: "Full system access with all permissions",
        level: "global",
        permissions: DEFAULT_PERMISSIONS.map((p) => ({ ...p, enabled: true })),
        userCount: 2,
        createdAt: "2024-01-01",
        isSystem: true,
      },
      {
        id: "2",
        name: "Institution Owner",
        description: "Full control over assigned institutions",
        level: "institution",
        permissions: DEFAULT_PERMISSIONS.map((p) => ({
          ...p,
          enabled: !["system_settings", "create_institutions", "delete_institutions"].includes(p.id),
        })),
        userCount: 15,
        createdAt: "2024-01-01",
        isSystem: true,
      },
      {
        id: "3",
        name: "Manager",
        description: "Limited management access to institutions",
        level: "institution",
        permissions: DEFAULT_PERMISSIONS.map((p) => ({
          ...p,
          enabled: ["view_institutions", "view_users", "view_reports"].includes(p.id),
        })),
        userCount: 45,
        createdAt: "2024-01-01",
        isSystem: true,
      },
      {
        id: "4",
        name: "Custom Manager",
        description: "Custom role with specific permissions",
        level: "institution",
        permissions: DEFAULT_PERMISSIONS.map((p) => ({
          ...p,
          enabled: ["view_institutions", "edit_institutions", "view_users", "create_users"].includes(p.id),
        })),
        userCount: 8,
        createdAt: "2024-02-15",
        isSystem: false,
      },
    ]

    setTimeout(() => {
      setRoles(mockRoles)
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreateRole = () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required")
      return
    }

    const newRole: Role = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description,
      level: formData.level,
      permissions: formData.permissions,
      userCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      isSystem: false,
    }

    setRoles((prev) => [...prev, newRole])
    setIsCreateDialogOpen(false)
    resetForm()
    toast.success("Role created successfully")
  }

  const handleEditRole = () => {
    if (!selectedRole || !formData.name.trim()) {
      toast.error("Role name is required")
      return
    }

    setRoles((prev) =>
      prev.map((role) =>
        role.id === selectedRole.id
          ? { ...role, name: formData.name, description: formData.description, permissions: formData.permissions }
          : role,
      ),
    )
    setIsEditDialogOpen(false)
    setSelectedRole(null)
    resetForm()
    toast.success("Role updated successfully")
  }

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId)
    if (role?.isSystem) {
      toast.error("Cannot delete system roles")
      return
    }
    if (role!.userCount > 0) {
      toast.error("Cannot delete role with assigned users")
      return
    }

    setRoles((prev) => prev.filter((r) => r.id !== roleId))
    toast.success("Role deleted successfully")
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      level: role.level,
      permissions: role.permissions.map((p) => ({ ...p })),
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      level: "institution",
      permissions: DEFAULT_PERMISSIONS.map((p) => ({ ...p })),
    })
  }

  const updatePermission = (permissionId: string, enabled: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) => (p.id === permissionId ? { ...p, enabled } : p)),
    }))
  }

  const getRoleLevelBadge = (level: string) => {
    return level === "global" ? (
      <Badge variant="default" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Global
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        Institution
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">Manage user roles and permissions across the system</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role with specific permissions for your organization</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Role Level</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: "global" | "institution") =>
                      setFormData((prev) => ({ ...prev, level: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="institution">Institution Level</SelectItem>
                      <SelectItem value="global">Global Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this role's purpose and responsibilities"
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium">Permissions</h4>
                {PERMISSION_CATEGORIES.map((category) => {
                  const categoryPermissions = formData.permissions.filter((p) => p.category === category)
                  return (
                    <div key={category} className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground">{category}</h5>
                      <div className="grid grid-cols-1 gap-2 pl-4">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between space-x-2">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Label htmlFor={permission.id} className="text-sm font-medium">
                                  {permission.name}
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                            <Switch
                              id={permission.id}
                              checked={permission.enabled}
                              onCheckedChange={(checked) => updatePermission(permission.id, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole}>Create Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Roles
          </CardTitle>
          <CardDescription>Manage roles and their permissions. System roles cannot be deleted.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.name}
                      {role.isSystem && (
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleLevelBadge(role.level)}</TableCell>
                  <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{role.userCount} users</Badge>
                  </TableCell>
                  <TableCell>{role.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(role)} disabled={role.isSystem}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.isSystem || role.userCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Modify role permissions and details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">Role Level</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value: "global" | "institution") =>
                    setFormData((prev) => ({ ...prev, level: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institution">Institution Level</SelectItem>
                    <SelectItem value="global">Global Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this role's purpose and responsibilities"
              />
            </div>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium">Permissions</h4>
              {PERMISSION_CATEGORIES.map((category) => {
                const categoryPermissions = formData.permissions.filter((p) => p.category === category)
                return (
                  <div key={category} className="space-y-2">
                    <h5 className="text-sm font-medium text-muted-foreground">{category}</h5>
                    <div className="grid grid-cols-1 gap-2 pl-4">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between space-x-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`edit-${permission.id}`} className="text-sm font-medium">
                                {permission.name}
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                          </div>
                          <Switch
                            id={`edit-${permission.id}`}
                            checked={permission.enabled}
                            onCheckedChange={(checked) => updatePermission(permission.id, checked)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditRole}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
