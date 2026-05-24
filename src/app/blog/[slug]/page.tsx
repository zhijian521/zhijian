import { notFound } from 'next/navigation';

import { formatPostDateTime, splitPostContent } from '@/lib/post-shared';
import { getPostBySlug, getPublishedPosts } from '@/lib/posts';

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = splitPostContent(post.content);

  return (
    <main className='w-full pb-16'>
      <article className='mx-auto max-w-4xl px-4 pt-16 md:px-12'>
        <header className='mb-10 text-center md:text-left'>
          <div className='mb-6 flex items-center justify-center gap-3 text-xs text-[var(--muted-foreground)] md:justify-start'>
            <span className='rounded-full bg-[var(--accent)] px-3 py-1'>生活哲学</span>
            <span>•</span>
            <span>10 分钟阅读</span>
          </div>
          <h1 className='font-serif text-4xl leading-tight text-[var(--foreground)] md:text-6xl'>动中求静：在喧嚣世界中寻找宁静</h1>
          <p className='mt-6 text-base leading-8 text-[var(--muted-foreground)] md:w-4/5 md:text-lg'>
            在这个快节奏的现代生活中，如何保持内心的平和与专注？探讨中国传统哲学在现代社会中的应用与实践。
          </p>
          <div className='mt-6 flex items-center justify-center gap-3 border-t border-[var(--border)] pt-6 md:justify-start'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[linear-gradient(135deg,#2a3138_0%,#7a838f_100%)] text-xs font-semibold text-white'>
              LW
            </div>
            <div className='text-left'>
              <div className='text-sm font-medium text-[var(--foreground)]'>Lin Wei</div>
              <div className='text-xs text-[var(--muted-foreground)]'>{formatPostDateTime(post.publishedAt)}</div>
            </div>
          </div>
        </header>

        <div className='group relative mb-16 h-64 overflow-hidden rounded-lg bg-[radial-gradient(circle_at_center,#22282e_0%,#111418_58%,#08090b_100%)] md:h-[500px]'>
          <div className='absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[linear-gradient(180deg,#6f757c_0%,#12161c_100%)] shadow-[0_0_0_8px_rgba(255,255,255,0.03)] transition-transform duration-700 group-hover:scale-105' />
          <div className='absolute left-1/2 top-1/2 h-1 w-24 -translate-x-1/2 translate-y-10 bg-[rgba(158,0,39,0.9)] blur-sm' />
          <div className='absolute left-1/2 top-1/2 h-[74%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.06)]' />
          <div className='absolute left-1/2 top-1/2 h-[54%] w-[54%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.08)]' />
          <div className='absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,255,255,0.1)]' />
        </div>

        <div className='mx-auto max-w-3xl'>
          <div className='prose prose-stone prose-lg max-w-none'>
            <p className='float-left mr-3 font-serif text-5xl text-[var(--primary)]'>现</p>
            <p className='text-base leading-8 text-[var(--foreground)]'>
              代生活就像是一场永无休止的马拉松。我们被各种通知、邮件、社交媒体和无尽的待办事项所包围。在这种持续的外部刺激下，保持内心的宁静似乎成了一种奢侈。
            </p>

            <h2 className='mt-12 border-l-4 border-[var(--primary)] pl-6 font-serif text-3xl text-[var(--foreground)]'>重新定义“静”</h2>
            <p className='mt-6 text-base leading-8 text-[var(--foreground)]'>
              在传统的东方哲学中，“静”并非指物理上的绝对无声，而是一种精神状态。它是一种在纷繁复杂中保持清晰觉知的能力。正如古语所言：
            </p>

            <blockquote className='my-10 border-l-2 border-[var(--primary)] bg-[var(--muted)] px-8 py-6 font-serif text-xl italic leading-9 text-[var(--muted-foreground)]'>
              “结庐在人境，而无车马喧。问君何能尔？心远地自偏。” —— 陶渊明
            </blockquote>

            <p className='text-base leading-8 text-[var(--foreground)]'>
              这启示我们，真正的宁静不需要逃离都市，而是要在内心建立一个不受外界干扰的避风港。
            </p>

            <h3 className='mt-12 font-serif text-3xl text-[var(--foreground)]'>实践路径</h3>
            <p className='mt-4 text-base leading-8 text-[var(--foreground)]'>要在日常生活中实践这种理念，我们可以从以下几个微小的习惯开始：</p>
            <ul className='my-8 space-y-4 border-y border-[var(--border)] py-6'>
              {[
                ['微观冥想：', '在等待咖啡或电梯的碎片时间里，将注意力集中在呼吸上，哪怕只有30秒。'],
                ['数字断舍离：', '设定每天特定时间段关闭非紧急通知，创造一段完全属于自己的“静默期”。'],
                ['专注单任务：', '摒弃多任务处理的迷思，一次只做一件事，全身心投入当前的过程。'],
              ].map(([title, text]) => (
                <li className='flex items-start gap-3' key={title}>
                  <span className='mt-1 text-[var(--primary)]'>●</span>
                  <div>
                    <strong className='text-[var(--foreground)]'>{title}</strong>
                    <span className='text-[var(--muted-foreground)]'> {text}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className='my-12 grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='h-72 rounded-sm border border-[var(--border)] bg-[linear-gradient(135deg,#503932_0%,#d4c4ae_40%,#f2eee7_100%)]' />
              <div className='rounded-sm border border-[var(--border)] bg-[var(--muted)] p-6'>
                <h4 className='font-serif text-xl text-[var(--foreground)]'>茶道中的觉知</h4>
                <p className='mt-4 text-sm leading-7 text-[var(--muted-foreground)]'>
                  泡茶的过程本身就是一种动中求静的绝佳练习。从温杯、投茶到注水，每一个动作都需要专注，这一过程自然地将人带入当下的宁静之中。
                </p>
              </div>
            </div>

            {paragraphs.map((paragraph) => (
              <p className='text-base leading-8 text-[var(--foreground)]' key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className='mt-12 flex flex-col items-center justify-between gap-6 border-t border-[var(--border)] pt-8 md:flex-row'>
            <div className='flex flex-wrap gap-3'>
              {['#生活哲学', '#正念', '#极简主义'].map((tag) => (
                <span className='cursor-pointer rounded-sm border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)]' key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className='flex items-center gap-6 text-sm text-[var(--muted-foreground)]'>
              <button className='transition-colors hover:text-[var(--primary)]' type='button'>
                喜欢 (128)
              </button>
              <button className='transition-colors hover:text-[var(--primary)]' type='button'>
                分享
              </button>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
