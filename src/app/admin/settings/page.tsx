import type { Metadata } from "next";
import { Shield, Wrench } from 'lucide-react';

import AdminPageHeader from '@/app/admin/_components/admin-page-header';

export const metadata: Metadata = {
    title: "系统设置 - Zhijian",
};

/*== 后台设置页：匹配博客卡片风格。 ==*/
export default async function AdminSettingsPage() {
    return (
        <>
            <AdminPageHeader
                description='这里集中说明后台登录方式、系统约定和后续扩展方向。'
                eyebrow='Settings'
                tag='System Notes'
                title='系统设置'
            />

            <div className='grid gap-5 md:grid-cols-2'>
                <div className='border border-[var(--primary)] bg-[#fbf9f9] p-6'>
                    <h3 className='flex items-center gap-2 font-serif text-lg font-semibold text-[var(--foreground)] mb-4'>
                        <Shield className='h-5 w-5 text-[var(--primary)]' />
                        登录与权限
                    </h3>
                    <div className='space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]'>
                        <p>后台使用基于 Cookie 的轻量登录态，用户数据存储在 MySQL 数据库中，密码经 bcrypt 哈希加密。</p>
                        <p>管理员通过 <code className='px-1.5 py-0.5 border border-[var(--border)] bg-[#f5f3f3] text-xs'>/admin/users</code> 管理所有用户账号及角色分配。</p>
                        <p className='text-xs text-[var(--muted-foreground)] opacity-70'>
                            Session 签名密钥配置在 <code className='px-1 py-0.5 border border-[var(--border)] bg-[#f5f3f3]'>ADMIN_SESSION_SECRET</code> 环境变量。
                        </p>
                    </div>
                </div>

                <div className='border border-[var(--primary)] bg-[#fbf9f9] p-6'>
                    <h3 className='flex items-center gap-2 font-serif text-lg font-semibold text-[var(--foreground)] mb-4'>
                        <Wrench className='h-5 w-5 text-[var(--primary)]' />
                        项目约定
                    </h3>
                    <div className='space-y-3 text-sm leading-relaxed text-[var(--muted-foreground)]'>
                        <p>前台博客与后台管理台统一视觉风格，使用衬线字体标题和扁平矩形卡片。</p>
                        <p>后续新增模块可继续在 <code className='px-1.5 py-0.5 border border-[var(--border)] bg-[#f5f3f3] text-xs'>/admin</code> 下扩展独立菜单与页面。</p>
                        <p>数据库初始化脚本：<code className='px-1.5 py-0.5 border border-[var(--border)] bg-[#f5f3f3] text-xs'>sql/init.sql</code>，包含 posts 和 users 两张表。</p>
                    </div>
                </div>
            </div>
        </>
    );
}
