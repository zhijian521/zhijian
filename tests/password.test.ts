import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hashPassword, MAX_PASSWORD_BYTES, verifyPassword } from "../src/lib/core/password.ts";

describe("密码哈希", () => {
    it("可以验证正确密码并拒绝错误密码", async () => {
        const passwordHash = await hashPassword("correct-password");

        assert.notEqual(passwordHash, "correct-password");
        assert.match(passwordHash, /^\$2[aby]\$12\$/);
        assert.equal(await verifyPassword("correct-password", passwordHash), true);
        assert.equal(await verifyPassword("wrong-password", passwordHash), false);
    });

    it("无效哈希按校验失败处理", async () => {
        assert.equal(await verifyPassword("any-password", "invalid-hash"), false);
    });

    it("拒绝超过 bcrypt 安全输入长度的密码", async () => {
        const password = "a".repeat(MAX_PASSWORD_BYTES + 1);

        await assert.rejects(hashPassword(password), RangeError);
        assert.equal(await verifyPassword(password, "invalid-hash"), false);
    });
});
