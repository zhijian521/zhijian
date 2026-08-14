/*============================================================================
  user - 用户领域类型

  认证、后台和导航数据层共用的用户基础契约；密码哈希不属于公开用户模型。
============================================================================*/

export type UserRole = "admin" | "user";
export type UserStatus = "active" | "disabled";

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UserCredentials extends User {
    passwordHash: string;
}

export interface UserListQuery {
    page?: number;
    pageSize?: number;
    search?: string;
}

export interface UserListPage {
    users: User[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export interface UserRoleCounts {
    admin: number;
    user: number;
}
