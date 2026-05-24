import { Badge } from '@/components/ui/badge';

interface AdminPageHeaderProps {
  action?: React.ReactNode;
  description: string;
  eyebrow: string;
  tag?: string;
  title: string;
}

/**
 * 后台页面统一头部，集中收敛标题、副标题和右侧操作区域的版式。
 */
export default function AdminPageHeader({ action, description, eyebrow, tag, title }: AdminPageHeaderProps) {
  return (
    <div className='admin-panel px-6 py-6 md:px-8'>
      <div className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
        <div className='space-y-3'>
          <p className='admin-kicker'>{eyebrow}</p>
          <div className='space-y-3'>
            <h1 className='admin-title text-3xl md:text-4xl'>{title}</h1>
            <p className='admin-copy max-w-3xl text-sm md:text-base'>{description}</p>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-3'>
          {tag ? (
            <Badge className='rounded-full border-slate-200 bg-slate-100 px-3 py-1 text-sm text-slate-700' variant='secondary'>
              {tag}
            </Badge>
          ) : null}
          {action}
        </div>
      </div>
    </div>
  );
}
