// types/rbac.ts
export type Permission = {
    id: number
    resource: string
    action: string
    key: string
    description: string
  }
export type Role = {
    id: number;
    name: string;
    priority: number;
    description: string;
    userCount: number;
    createdAt: string;
    isSystem?: boolean;
    permissions?: Permission[];
  };
  
export type AdminUser = {
    id: number
    name: string
    phoneNumber: string
    status: string
    globalRole: string
}

export type AdminLink = {
    adminId: number;
    institutionId: number;
    linkedAt: string;     // ISO string
    note: string | null;
    admin: AdminUser;
    role: Role;
};
  
