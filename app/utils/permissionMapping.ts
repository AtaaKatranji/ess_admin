// utils/permissionMapping.ts
import type { Permission } from "@/app/types/rbac";

export function mapCategory(resource: string): string {
  switch (resource) {
    case "institution": return "Institution Management";
    case "employee":    return "User Management";
    case "shift":       return "Shift Management";
    case "manager":     return "Role Management";
    case "system":      return "System Administration";
    case "report":      return "Reports & Analytics";
    default:            return "Other";
  }
}

export function friendlyName(p: Permission): string {
  // مثال بسيط؛ عدّله حسب أسلوبك
  const res = p.resource.charAt(0).toUpperCase() + p.resource.slice(1);
  const act = p.action.charAt(0).toUpperCase() + p.action.slice(1);
  return `${act} ${res}`;
}

// types لواجهة العرض
export type PermissionUI = {
    id: number;
    key: string;
    name: string;
    description?: string;
    category: string;
    enabled: boolean;
  };
  
  // helper: يبني Permissions UI من API + صلاحيات الدور
  export function buildPermissionsUI(
    all: Permission[],
    rolePermissionKeys: string[] // أو IDs حسب الـ backend
  ): PermissionUI[] {
    return all.map(p => ({
      id: p.id,
      key: p.key,
      name: friendlyName(p),
      description: p.description,
      category: mapCategory(p.resource),
      enabled: rolePermissionKeys.includes(p.key),
    }));
  }
  