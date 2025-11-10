export interface PermissionSet {
  creator: boolean;
  viewer: boolean;
  editor: boolean;
  remover: boolean;
}

export interface AdminUserPermission {
  masterCategory: PermissionSet;
  masterData: PermissionSet;
  news: PermissionSet;
  platform: PermissionSet;
  donationMaster: PermissionSet;
}

export interface AdminPayload {
  userType: string;
  firstName: string;
  lastName: string;
  phone: number;
  email: string;
  password: string;
  adminUserPermission: AdminUserPermission;
}
