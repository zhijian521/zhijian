/*============================================================================
  use-auth — 前端鉴权 Hook

  客户端认证状态管理，提供登录/注册/登出/用户信息查询。
  导航页 AuthModal 使用。
============================================================================*/

'use client';

import { useCallback, useEffect, useState } from 'react';

/*== 类型定义 ==*/
export interface AuthUser {
    id: number;
    username: string;
    email: string;
    role: string;
}

/*== useAuth — 返回 user / isLoggedIn / loading / login / register / logout ==*/
export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                setUser(data?.data?.user ?? null);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (username: string, password: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || '登录失败');
        setUser(data.data.user);
        return data.data.user;
    }, []);

    const register = useCallback(async (username: string, email: string, password: string) => {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || '注册失败');
        return data.data.user;
    }, []);

    const logout = useCallback(async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setUser(null);
    }, []);

    return { user, isLoggedIn: !!user, loading, login, register, logout };
}
