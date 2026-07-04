import AdminPageHeader from '@/app/admin/_components/admin-page-header';
import { API_REGISTRY } from '@/docs/api/_registry';
import { ApiList } from './api-list';

export const metadata = { title: '接口文档 - 知简' };

const GROUP_LABEL: Record<string, string> = {
    posts: '公开接口',
    admin: '后台管理',
    nav: '导航站',
    auth: '认证',
    ai: 'AI',
    collect: '数据采集',
    util: '工具',
};

/*== 接口文档页：按 group 分组列出所有 API 接口，点击展开看参数与响应。 ==*/
export default function ApiDocsPage() {
    const byGroup = API_REGISTRY.reduce<Record<string, typeof API_REGISTRY>>((acc, entry) => {
        (acc[entry.group] ??= []).push(entry);
        return acc;
    }, {});

    return (
        <div>
            <AdminPageHeader
                eyebrow="API"
                title="接口文档"
                description="所有 API Route 的路径、鉴权、参数与响应。点击接口展开详情。新增接口需在 src/docs/api/_registry.ts 登记。"
                tag={`${API_REGISTRY.length} 个接口`}
            />

            <ApiList groups={byGroup} groupLabels={GROUP_LABEL} />
        </div>
    );
}
