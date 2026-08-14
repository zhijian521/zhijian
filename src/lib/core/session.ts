/*============================================================================
  session - 签名会话 token

  token 只证明内容由当前服务端密钥签发；用户是否仍可用由后续鉴权层回查数据库。
============================================================================*/

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import type { SessionClaims, SessionPayload } from "@/types/session";

export const SESSION_COOKIE_NAME = "zhijian_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const SESSION_TOKEN_VERSION = "v1";
const SESSION_SECRET_MIN_BYTES = 32;
const MAX_SESSION_TOKEN_LENGTH = 768;
const MAX_SESSION_PAYLOAD_LENGTH = 512;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

export function createSessionToken(claims: SessionClaims, now = Date.now()): string {
    validateSessionClaims(claims);

    const payload: SessionPayload = {
        ...claims,
        issuedAt: now,
        expiresAt: now + SESSION_MAX_AGE_SECONDS * 1000,
    };
    const encodedPayload = encodePayload(payload);
    const signature = signPayload(encodedPayload);

    return `${SESSION_TOKEN_VERSION}.${encodedPayload}.${signature}`;
}

export function parseSessionToken(token: string | undefined, now = Date.now()): SessionPayload | null {
    if (!token || token.length > MAX_SESSION_TOKEN_LENGTH) {
        return null;
    }

    const [version, encodedPayload, encodedSignature, ...extraParts] = token.split(".");

    if (
        extraParts.length > 0 ||
        version !== SESSION_TOKEN_VERSION ||
        !isBase64Url(encodedPayload, MAX_SESSION_PAYLOAD_LENGTH) ||
        !isBase64Url(encodedSignature, 64)
    ) {
        return null;
    }

    const expectedSignature = signPayload(encodedPayload);
    if (!safeEqual(encodedSignature, expectedSignature)) {
        return null;
    }

    const payload = decodePayload(encodedPayload);
    if (!payload || payload.expiresAt <= now) {
        return null;
    }

    return payload;
}

export function getSessionCookieOptions() {
    return {
        httpOnly: true,
        maxAge: SESSION_MAX_AGE_SECONDS,
        path: "/" as const,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
    };
}

function encodePayload(payload: SessionPayload): string {
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodePayload(encodedPayload: string): SessionPayload | null {
    try {
        const value: unknown = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

        if (!isSessionPayload(value)) {
            return null;
        }

        return value;
    } catch {
        return null;
    }
}

function signPayload(encodedPayload: string): string {
    return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left, "base64url");
    const rightBuffer = Buffer.from(right, "base64url");

    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
}

function getSessionSecret(): string {
    const secret = process.env.SESSION_SECRET;

    if (!secret || Buffer.byteLength(secret, "utf8") < SESSION_SECRET_MIN_BYTES) {
        throw new Error("SESSION_SECRET 必须配置至少 32 字节的随机密钥。");
    }

    return secret;
}

function validateSessionClaims(claims: SessionClaims): void {
    if (!Number.isSafeInteger(claims.userId) || claims.userId < 1) {
        throw new TypeError("Session userId 必须是正整数。");
    }

    if (!claims.username || claims.username.length > 50 || !isSessionRole(claims.role)) {
        throw new TypeError("Session claims 无效。");
    }
}

function isSessionPayload(value: unknown): value is SessionPayload {
    if (!value || typeof value !== "object") {
        return false;
    }

    const payload = value as Partial<SessionPayload>;
    const { userId, username, role, issuedAt, expiresAt } = payload;

    return (
        typeof userId === "number" &&
        Number.isSafeInteger(userId) &&
        userId > 0 &&
        typeof username === "string" &&
        username.length > 0 &&
        username.length <= 50 &&
        isSessionRole(role) &&
        typeof issuedAt === "number" &&
        Number.isSafeInteger(issuedAt) &&
        typeof expiresAt === "number" &&
        Number.isSafeInteger(expiresAt) &&
        expiresAt > issuedAt
    );
}

function isSessionRole(value: unknown): value is SessionClaims["role"] {
    return value === "admin" || value === "user";
}

function isBase64Url(value: string | undefined, maximumLength: number): value is string {
    return Boolean(value && value.length <= maximumLength && BASE64URL_PATTERN.test(value));
}
