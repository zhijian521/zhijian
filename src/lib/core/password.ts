/*============================================================================
  password - 密码哈希

  使用 bcryptjs 兼容旧项目已写入数据库的 bcrypt 哈希；仅服务端认证流程调用。
============================================================================*/

import "server-only";

import bcrypt from "bcryptjs";

/*== 保持与旧项目一致；后续只在认证单元中集中调整成本。 ==*/
export const PASSWORD_HASH_ROUNDS = 12;
export const MAX_PASSWORD_BYTES = 72;

export async function hashPassword(password: string): Promise<string> {
    assertPasswordLength(password);
    return bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    if (!isPasswordLengthValid(password)) {
        return false;
    }

    try {
        return await bcrypt.compare(password, passwordHash);
    } catch {
        /*== 数据库中的损坏或非 bcrypt 哈希按校验失败处理，不向登录入口泄露细节。 ==*/
        return false;
    }
}

function assertPasswordLength(password: string): void {
    if (!isPasswordLengthValid(password)) {
        throw new RangeError(`密码不能超过 ${MAX_PASSWORD_BYTES} 字节。`);
    }
}

function isPasswordLengthValid(password: string): boolean {
    return Buffer.byteLength(password, "utf8") <= MAX_PASSWORD_BYTES;
}
