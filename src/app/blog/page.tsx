import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPostDate } from '@/lib/post-shared';
import { getPublishedPosts } from '@/lib/posts';

export default async function BlogListPage() {
  const posts = await getPublishedPosts();
  const featuredPost = posts[0] ?? null;
  const secondaryPosts = posts.slice(1, 3);
  const concludingPost = posts[2] ?? posts[0] ?? null;

  return (
    <main className='mx-auto w-full max-w-7xl px-4 pb-16 pt-10 md:px-12 md:pt-16'>
      <header className='mb-12 flex flex-col gap-3'>
        <div className='mb-1 h-1 w-12 bg-[var(--primary)]' />
        <h1 className='font-serif text-4xl text-[var(--foreground)] md:text-6xl'>文章与感悟</h1>
        <p className='max-w-2xl text-base leading-8 text-[var(--muted-foreground)] md:text-lg'>
          在繁杂中寻找秩序，于微末处体悟哲思。探索极简设计、哲学思辨与自然生活的美学交汇。
        </p>
      </header>

      <div className='grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16'>
        <section className='flex flex-col gap-10 lg:col-span-8'>
          {featuredPost ? (
            <article className='group relative overflow-hidden rounded-xl border border-[var(--border)] bg-white transition-colors hover:border-[var(--primary)] md:flex md:h-[400px]'>
              <div className='relative h-64 overflow-hidden bg-[linear-gradient(135deg,#ede8df_0%,#f8f5f1_55%,#d8d6d3_100%)] md:h-full md:w-1/2'>
                <div className='absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.75)_22%,transparent_23%,transparent_100%)]' />
                <div className='absolute bottom-0 left-[38%] h-[44%] w-[1px] bg-[var(--primary)] opacity-70' />
                <div className='absolute bottom-[18%] left-[34%] h-12 w-12 rounded-full bg-[rgba(158,0,39,0.85)] opacity-80 blur-[1px]' />
              </div>
              <div className='flex flex-col justify-center bg-white p-8 md:w-1/2 md:p-10'>
                <div className='mb-3 flex items-center gap-3 text-xs text-[var(--muted-foreground)]'>
                  <span className='uppercase tracking-[0.2em] text-[var(--primary)]'>设计思考</span>
                  <span className='border-l border-[var(--border)] pl-3'>{formatPostDate(featuredPost.publishedAt)}</span>
                </div>
                <h2 className='font-serif text-3xl leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]'>
                  留白的力量：在界面设计中寻找呼吸感
                </h2>
                <p className='mt-4 text-sm leading-7 text-[var(--muted-foreground)]'>
                  探讨如何在现代数字产品中运用中国传统水墨画中的留白哲学，通过减少视觉噪音来增强用户的专注力与内心的平静。
                </p>
                <Link className='mt-6 inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline' href={`/blog/${featuredPost.slug}`}>
                  阅读全文
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>
            </article>
          ) : null}

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
            {secondaryPosts.map((post, index) => (
              <article className='group flex flex-col gap-3' key={post.id}>
                <div
                  className={
                    index === 0
                      ? 'relative aspect-[4/3] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#e5e7e6_0%,#f8f8f6_45%,#d9d6d0_100%)]'
                      : 'relative aspect-[4/3] overflow-hidden rounded-lg bg-[linear-gradient(135deg,#ebe8e1_0%,#f9f7f2_40%,#d2c8bf_100%)]'
                  }
                >
                  {index === 0 ? <div className='absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.95)_12%,transparent_13%,transparent_44%,rgba(255,255,255,0.85)_45%,transparent_46%),linear-gradient(180deg,transparent_0%,transparent_72%,rgba(158,0,39,0.85)_72%,rgba(158,0,39,0.85)_100%)]' /> : null}
                  {index === 1 ? <div className='absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_70%,rgba(158,0,39,0.14)_70%,rgba(158,0,39,0.14)_73%,transparent_73%)]' /> : null}
                </div>
                <div className='flex items-center gap-3 text-xs text-[var(--muted-foreground)]'>
                  <span className='font-medium text-[var(--primary)]'>{index === 0 ? '极简主义' : '哲学'}</span>
                  <span>{formatPostDate(post.publishedAt)}</span>
                </div>
                <h3 className='font-serif text-2xl text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]'>
                  {index === 0 ? '物质的减法与精神的加法' : '无用之用：庄子思想在现代生活中的映射'}
                </h3>
                <p className='text-sm leading-7 text-[var(--muted-foreground)]'>{post.summary}</p>
              </article>
            ))}

            {concludingPost ? (
              <article className='rounded-lg border border-[var(--border)] bg-[var(--background)] p-8 md:col-span-2'>
                <div className='flex items-center gap-3 text-xs text-[var(--muted-foreground)]'>
                  <span className='font-medium text-[var(--primary)]'>自然</span>
                  <span>{formatPostDate(concludingPost.publishedAt)}</span>
                </div>
                <h3 className='mt-3 font-serif text-3xl text-[var(--foreground)]'>四季的韵律：观察一棵树的生长历程</h3>
                <p className='mt-4 max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]'>
                  自然界从不匆忙，却能完成一切。通过长达一年的定点观察，记录一棵银杏树从抽芽、繁茂、金黄到落叶的全过程，体悟时间的流转与生命的韧性。
                </p>
              </article>
            ) : null}
          </div>

          <div className='flex justify-center border-t border-[var(--border)] pt-8'>
            <Button
              className='rounded-sm border border-[var(--outline)] bg-transparent px-6 text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
              type='button'
              variant='outline'
            >
              加载更多
              <ChevronDown className='h-4 w-4' />
            </Button>
          </div>
        </section>

        <aside className='space-y-6 lg:col-span-4'>
          <div className='rounded-xl border border-[var(--border)] bg-white p-6'>
            <h3 className='mb-5 flex items-center gap-2 font-serif text-2xl text-[var(--foreground)]'>
              <span className='inline-block h-4 w-1 bg-[var(--primary)]' />
              话题
            </h3>
            <ul className='flex flex-col'>
              {[
                ['极简主义', '12'],
                ['哲学', '8'],
                ['设计思考', '24'],
                ['自然', '15'],
              ].map(([label, count]) => (
                <li className='border-b border-[var(--accent)] last:border-0' key={label}>
                  <Link className='group flex items-center justify-between py-3' href='/blog'>
                    <span className='text-base text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]'>{label}</span>
                    <span className='rounded-sm bg-[var(--muted)] px-2 py-1 text-xs text-[var(--muted-foreground)] transition-colors group-hover:bg-[var(--primary-container)] group-hover:text-[var(--primary)]'>
                      {count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className='rounded-xl border border-[var(--border)] bg-white p-6'>
            <h3 className='mb-5 flex items-center gap-2 font-serif text-2xl text-[var(--foreground)]'>
              <span className='inline-block h-4 w-1 bg-[var(--primary)]' />
              标签
            </h3>
            <div className='flex flex-wrap gap-3'>
              {['茶道', '生活美学', '冥想', '哲思', '自然观察', 'UI/UX'].map((tag) => (
                <span className='rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs text-[var(--muted-foreground)]' key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
