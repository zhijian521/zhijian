'use client';

/*============================================================================
  create-post — 新建文章共享逻辑

  侧边栏「撰写文章」与文章管理列表「新建文章」共用的创建流程：
  调用创建接口生成草稿，成功后在新标签页打开编辑器。
============================================================================*/

/*== 组件导入 ==*/
import { toast } from '@/components/ui/toast';

/*== 数据与配置 ==*/
import { api } from '@/lib/core/http-client';
import { APP_ROUTES } from '@/lib/core/site';

/*-- 新建草稿文章并在新标签页打开编辑器；失败时 toast 提示并返回 false，成功返回 true --*/
export async function createPostAndOpenEditor(): Promise<boolean> {
    try {
        const res = await api.post<{ id: number }>('/admin/posts', {});
        if (res.code === 0 && res.data) {
            window.open(`${APP_ROUTES.adminPosts}/${res.data.id}`);
            return true;
        }
        toast.error(res.message || '新建文章失败');
    } catch {
        toast.error('新建文章失败');
    }
    return false;
}
