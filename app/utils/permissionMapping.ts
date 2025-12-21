// utils/permissionMapping.ts
import type { Permission } from "@/app/types/rbac";

// export function mapCategory(resource: string): string {
//   switch (resource) {
//     case "institution":  return "Institution Management";
//     case "employee":     return "User Management";
//     case "attendance":     return "User Management";
//     case "shift":        return "Shift Management";
//     case "manager":      return "Role Management";
//     case "break_type":   return "Break Management";
//     case "leave":        return "Leave Management";
//     case "annual_leave": return "Leave Management";
//     case "public_holiday":      return "Holiday Management";
//     case "rbac":       return "System Administration";
//     case "report":       return "Reports & Analytics";
//     case "employee_break": return "Hours Break Management";
//     case "extra_hours_adjustment": return "Bouns Hours Management";
//     case "notification": return "Notifications Management";
//     default:             return "Other";
//   }
// }
export function mapCategory(resource: string): string {
  switch (resource) {
    // 🔹 Organization
    case "institution":        return "Institution Management";

    // 🔹 Users & Roles
    case "employee":           
    case "attendance":         return "User Management";
    case "manager":            return "Role Management";
    case "rbac":               return "System Administration";

    // 🔹 Time & Shifts
    case "shift":              return "Shift Management";
    case "employee_break":     return "Break & Hours Management";
    case "break_type":         return "Break Management";
    case "extra_hours_adjustment": return "Bonus Hours Management";

    // 🔹 Leaves & Holidays
    case "leave":
    case "annual_leave":       return "Leave Management";
    case "public_holiday":     return "Holiday Management";

    // 🔹 Insights & Communication
    case "report":             return "Reports & Analytics";
    case "edit_logs":          return "Reports & Analytics";
    case "notification":       return "Notifications Management";

    // 🔹 Default
    default:                   return "Other";
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
  