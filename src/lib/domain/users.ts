/*============================================================================
  users - 用户领域数据

  只负责用户表的数据读取与基础写入；密码哈希、Session 和权限守卫分别由认证单元处理。
============================================================================*/

import "server-only";

import type { ResultSetHeader, RowDataPacket } from "mysql2";

import { getDb } from "@/lib/core/db";
import { ServiceUnavailableError } from "@/lib/core/errors";
import type {
    User,
    UserCredentials,
    UserListPage,
    UserListQuery,
    UserRole,
    UserRoleCounts,
    UserStatus,
} from "@/types/user";

const DEFAULT_USER_PAGE_SIZE = 20;
const MAX_USER_PAGE = 1_000;
const MAX_USER_PAGE_SIZE = 100;
const MAX_USER_SEARCH_LENGTH = 255;

export class UserConflictError extends Error {
    constructor(cause?: unknown) {
        super("用户名或邮箱已被占用。", { cause });
        this.name = "UserConflictError";
    }
}

interface UserRow extends RowDataPacket {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}

interface UserCredentialsRow extends UserRow {
    password_hash: string;
}

interface UserCountRow extends RowDataPacket {
    total: number;
}

interface UserRoleCountRow extends RowDataPacket {
    role: UserRole;
    count: number;
}

export async function getUserByUsername(username: string): Promise<UserCredentials | null> {
    const db = getRequiredDb();

    try {
        const [rows] = await db.execute<UserCredentialsRow[]>(
            `
                SELECT
                    id,
                    username,
                    email,
                    password_hash,
                    role,
                    status,
                    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
                    DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
                FROM zhijian_users
                WHERE username = ?
                LIMIT 1
            `,
            [username],
        );

        return rows[0] ? toUserCredentials(rows[0]) : null;
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

export async function getUserById(id: number): Promise<User | null> {
    const db = getRequiredDb();

    try {
        const [rows] = await db.execute<UserRow[]>(
            `
                SELECT
                    id,
                    username,
                    email,
                    role,
                    status,
                    DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
                    DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
                FROM zhijian_users
                WHERE id = ?
                LIMIT 1
            `,
            [id],
        );

        return rows[0] ? toUser(rows[0]) : null;
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

export async function createUser(params: {
    username: string;
    email: string;
    passwordHash: string;
    role?: UserRole;
}): Promise<User> {
    const db = getRequiredDb();

    try {
        const [result] = await db.execute<ResultSetHeader>(
            `
                INSERT INTO zhijian_users (username, email, password_hash, role)
                VALUES (?, ?, ?, ?)
            `,
            [params.username, params.email, params.passwordHash, params.role ?? "user"],
        );

        const user = await getUserById(result.insertId);
        if (!user) {
            throw new ServiceUnavailableError();
        }

        return user;
    } catch (error) {
        throw toUserWriteError(error);
    }
}

export async function updateUser(
    id: number,
    fields: {
        username?: string;
        email?: string;
        passwordHash?: string;
        role?: UserRole;
        status?: UserStatus;
    },
): Promise<User | null> {
    const db = getRequiredDb();
    const updates: Array<[string, string | UserRole | UserStatus]> = [];

    if (fields.username !== undefined) updates.push(["username", fields.username]);
    if (fields.email !== undefined) updates.push(["email", fields.email]);
    if (fields.passwordHash !== undefined) updates.push(["password_hash", fields.passwordHash]);
    if (fields.role !== undefined) updates.push(["role", fields.role]);
    if (fields.status !== undefined) updates.push(["status", fields.status]);

    if (updates.length === 0) {
        return getUserById(id);
    }

    try {
        await db.execute(
            `UPDATE zhijian_users SET ${updates.map(([column]) => `${column} = ?`).join(", ")} WHERE id = ?`,
            [...updates.map(([, value]) => value), id],
        );
        return getUserById(id);
    } catch (error) {
        throw toUserWriteError(error);
    }
}

export async function deleteUser(id: number): Promise<boolean> {
    const db = getRequiredDb();

    try {
        const [result] = await db.execute<ResultSetHeader>(
            "DELETE FROM zhijian_users WHERE id = ?",
            [id],
        );
        return result.affectedRows > 0;
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

export async function listUsers(query: UserListQuery = {}): Promise<UserListPage> {
    const db = getRequiredDb();
    const page = normalizePositiveInteger(query.page, 1, MAX_USER_PAGE);
    const pageSize = normalizePositiveInteger(query.pageSize, DEFAULT_USER_PAGE_SIZE, MAX_USER_PAGE_SIZE);
    const search = query.search?.trim().slice(0, MAX_USER_SEARCH_LENGTH) ?? "";
    const where = search ? "WHERE username LIKE ? OR email LIKE ?" : "";
    const searchValues = search ? [`%${search}%`, `%${search}%`] : [];
    const offset = (page - 1) * pageSize;

    try {
        const [[countRows], [rows]] = await Promise.all([
            db.execute<UserCountRow[]>(`SELECT COUNT(*) AS total FROM zhijian_users ${where}`, searchValues),
            db.execute<UserRow[]>(
                `
                    SELECT
                        id,
                        username,
                        email,
                        role,
                        status,
                        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') AS created_at,
                        DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at
                    FROM zhijian_users
                    ${where}
                    ORDER BY created_at DESC, id DESC
                    LIMIT ? OFFSET ?
                `,
                [...searchValues, pageSize, offset],
            ),
        ]);

        const total = Number(countRows[0]?.total ?? 0);

        return {
            users: rows.map(toUser),
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        };
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

export async function countUsersByRole(): Promise<UserRoleCounts> {
    const db = getRequiredDb();

    try {
        const [rows] = await db.execute<UserRoleCountRow[]>(
            "SELECT role, COUNT(*) AS count FROM zhijian_users WHERE status = ? GROUP BY role",
            ["active"],
        );
        const counts = { admin: 0, user: 0 };

        for (const row of rows) {
            counts[row.role] = Number(row.count);
        }

        return counts;
    } catch (error) {
        throw new ServiceUnavailableError(error);
    }
}

function getRequiredDb() {
    const db = getDb();

    if (!db) {
        throw new ServiceUnavailableError();
    }

    return db;
}

/*== 唯一索引冲突属于可预期业务结果，保留给认证和后台接口映射为 409。 ==*/
function toUserWriteError(error: unknown): ServiceUnavailableError | UserConflictError {
    if (error instanceof ServiceUnavailableError || error instanceof UserConflictError) {
        return error;
    }

    if (isDuplicateEntryError(error)) {
        return new UserConflictError(error);
    }

    return new ServiceUnavailableError(error);
}

function isDuplicateEntryError(error: unknown): boolean {
    return Boolean(error && typeof error === "object" && "code" in error && error.code === "ER_DUP_ENTRY");
}

function normalizePositiveInteger(value: number | undefined, fallback: number, maximum: number): number {
    if (value === undefined || !Number.isFinite(value)) {
        return fallback;
    }

    return Math.min(maximum, Math.max(1, Math.floor(value)));
}

function toUser(row: UserRow): User {
    return {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function toUserCredentials(row: UserCredentialsRow): UserCredentials {
    return {
        ...toUser(row),
        passwordHash: row.password_hash,
    };
}
