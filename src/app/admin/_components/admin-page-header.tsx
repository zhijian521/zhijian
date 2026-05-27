import { Badge } from '@/components/ui/badge';

interface AdminPageHeaderProps {
    action?: React.ReactNode;
    description: string;
    eyebrow?: string;
    tag?: string;
    title: string;
}

/*== 后台页面统一头部，匹配博客衬线标题风格。 ==*/
export default function AdminPageHeader({ action, description, eyebrow, tag, title }: AdminPageHeaderProps) {
    return (
        <header className='mb-8'>
            {eyebrow ? <p className='admin-kicker mb-2'>{eyebrow}</p> : null}
            <h1 className='admin-title'>{title}</h1>
            <p className='admin-copy mt-1.5 max-w-2xl'>{description}</p>

            {(tag || action) ? (
                <div className='flex flex-wrap items-center gap-3 mt-4'>
                    {tag ? (
                        <Badge
                            className='rounded-none border border-[var(--primary)] bg-[rgba(158,0,39,0.06)] px-3 py-1 text-xs font-medium text-[var(--primary)]'
                            variant='secondary'
                        >
                            {tag}
                        </Badge>
                    ) : null}
                    {action}
                </div>
            ) : null}
        </header>
    );
}
