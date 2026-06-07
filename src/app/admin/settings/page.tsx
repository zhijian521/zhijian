import type { Metadata } from "next";

import { ShieldIcon, WrenchIcon } from '@/components/ui/icons';
import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import styles from './settings.module.css';

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

            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        <ShieldIcon className={styles.cardIcon} />
                        登录与权限
                    </h3>
                    <div className={styles.cardBody}>
                        <p>后台使用基于 Cookie 的轻量登录态，用户数据存储在 MySQL 数据库中，密码经 bcrypt 哈希加密。</p>
                        <p>管理员通过 <code className={styles.code}>/admin/users</code> 管理所有用户账号及角色分配。</p>
                        <p className={styles.hint}>
                            Session 签名密钥配置在 <code className={styles.codeInline}>ADMIN_SESSION_SECRET</code> 环境变量。
                        </p>
                    </div>
                </div>

                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        <WrenchIcon className={styles.cardIcon} />
                        项目约定
                    </h3>
                    <div className={styles.cardBody}>
                        <p>前台博客与后台管理台统一视觉风格，使用衬线字体标题和扁平矩形卡片。</p>
                        <p>后续新增模块可继续在 <code className={styles.code}>/admin</code> 下扩展独立菜单与页面。</p>
                        <p>数据库初始化脚本：<code className={styles.code}>sql/init.sql</code>，包含 posts 和 users 两张表。</p>
                    </div>
                </div>
            </div>
        </>
    );
}