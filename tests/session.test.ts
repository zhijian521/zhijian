import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
    createSessionToken,
    getSessionCookieOptions,
    parseSessionToken,
    SESSION_MAX_AGE_SECONDS,
} from "../src/lib/core/session.ts";

const SESSION_SECRET = "test-session-secret-with-at-least-32-bytes";
const NOW = 1_800_000_000_000;

process.env.SESSION_SECRET = SESSION_SECRET;

describe("Session token", () => {
    it("生成并解析带有效期的签名 token", () => {
        const token = createSessionToken({ userId: 1, username: "admin", role: "admin" }, NOW);
        const payload = parseSessionToken(token, NOW + 1);

        assert.deepEqual(payload, {
            userId: 1,
            username: "admin",
            role: "admin",
            issuedAt: NOW,
            expiresAt: NOW + SESSION_MAX_AGE_SECONDS * 1000,
        });
    });

    it("拒绝被篡改、过期或格式错误的 token", () => {
        const token = createSessionToken({ userId: 2, username: "writer", role: "user" }, NOW);
        const [version, payload, signature] = token.split(".");
        const tamperedSignature = `${signature.slice(0, -1)}${signature.endsWith("A") ? "B" : "A"}`;

        assert.equal(parseSessionToken(`${version}.${payload}.${tamperedSignature}`, NOW), null);
        assert.equal(parseSessionToken(token, NOW + SESSION_MAX_AGE_SECONDS * 1000), null);
        assert.equal(parseSessionToken("v1.invalid.invalid", NOW), null);
    });

    it("提供安全的会话 Cookie 默认配置", () => {
        const options = getSessionCookieOptions();

        assert.equal(options.httpOnly, true);
        assert.equal(options.sameSite, "lax");
        assert.equal(options.path, "/");
        assert.equal(options.maxAge, SESSION_MAX_AGE_SECONDS);
    });
});
