"use client"

import { useState } from "react"
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
import { useRoles } from "@/hooks/useRoles";
import type { Role } from "@/app/types/rbac";
import { usePermissions } from "@/hooks/usePermission"
import { buildPermissionsUI } from "../utils/permissionMapping"


const PERMISSION_CATEGORIES = [
  "Institution Management",
  "User Management",
  "Role Management",
  "System Administration",
  "Reports & Analytics",
]



export function RoleManagement() {
    type Scope = "global" | "institution";
    const SCOPE_THRESHOLD = 70;
    
    const priorityToScope = (p: number): Scope => (p >= SCOPE_THRESHOLD ? "global" : "institution");
    const scopeToDefaultPriority = (s: Scope): number => (s === "global" ? 80 : 50); // قيَم افتراضية
    

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: 50,
    permissions:  [] as ReturnType<typeof buildPermissionsUI>,
  })
  const { roles, isLoading: rolesLoading, isError: rolesError, mutateRoles  } = useRoles();
  const { permissions, isLoading: permissionsLoading, isError: permissionsError } = usePermissions();

  const payload = {
    name: formData.name,
    description: formData.description,
    priority: formData.priority,
    permissionKeys: formData.permissions.filter(p => p.enabled).map(p => p.key),
  };
  const handleCreateRole = async () => {
        if (!formData.name.trim()) {
        toast.error("Role name is required");
        return;
        }
    
        try {
        // call API
        await fetch("/rbac/roles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
      });
  
      // refresh list
      await mutateRoles();
  
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success("Role created successfully");
    } catch {
      toast.error("Failed to create role");
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole || !formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }
    
    try {
      await fetch(`/rbac/roles/${selectedRole.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      await mutateRoles(); // re-fetch updated roles
  
      setIsEditDialogOpen(false);
      setSelectedRole(null);
      resetForm();
      toast.success("Role updated successfully");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      toast.error("Cannot delete system roles");
      return;
    }
    if (role && role.userCount > 0) {
      toast.error("Cannot delete role with assigned users");
      return;
    }
  
    try {
      await fetch(`/rbac/roles/${roleId}`, { method: "DELETE" });
      await mutateRoles();
      toast.success("Role deleted successfully");
    } catch {
      toast.error("Failed to delete role");
    }
  };
  
  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    const roleKeys = role.permissions?.map(p => p.key) ?? [];
    setFormData({
      name: role.name,
      description: role.description ?? "",
      priority: role.priority ?? 50,
      permissions: buildPermissionsUI(permissions, roleKeys),
    });
    setIsEditDialogOpen(true);
  };
  

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      priority: 50,
      permissions: buildPermissionsUI(permissions, []),
    });
  };

  const updatePermission = (permissionId: number, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.map(p =>
        p.id === permissionId ? { ...p, enabled } : p
      ),
    }));
  };
  

  const getRoleLevelBadge = (priority: number) => {
    return priority >= SCOPE_THRESHOLD ? (
        <Badge variant="default" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Global
        </Badge>
      ) : (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          Institution
        </Badge>
      );
    };

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    )
  }
  if (rolesError || permissionsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-red-500 font-medium">Failed to load roles.</p>
          <Button onClick={() => mutateRoles()}>Retry</Button>
        </div>
      </div>
    );
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
                    value={priorityToScope(formData.priority)}
                    onValueChange={(value: Scope) =>
                      setFormData(prev => ({ ...prev, priority: scopeToDefaultPriority(value) }))
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
                                <Label htmlFor={`perm-${permission.id}`} className="text-sm font-medium">
                                  {permission.name}
                                </Label>
                              </div>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                            <Switch
                               id={`perm-${permission.id}`}
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
                      {/* {role.isSystem && (
                        <Badge variant="outline" className="text-xs">
                          System
                        </Badge>
                      )} */}
                    </div>
                  </TableCell>
                  <TableCell>{getRoleLevelBadge(role.priority)}</TableCell>
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
                    value={priorityToScope(formData.priority)}
                    onValueChange={(value: Scope) =>
                        setFormData(prev => ({ ...prev, priority: scopeToDefaultPriority(value) }))
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
