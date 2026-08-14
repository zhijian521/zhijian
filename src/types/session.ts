/*============================================================================
  session - 会话类型

  只描述已签名 token 携带的最小身份信息；用户状态仍需由服务端数据层确认。
============================================================================*/

import type { UserRole } from "@/types/user";

export interface SessionClaims {
    userId: number;
    username: string;
    role: UserRole;
}

export interface SessionPayload extends SessionClaims {
    issuedAt: number;
    expiresAt: number;
}
