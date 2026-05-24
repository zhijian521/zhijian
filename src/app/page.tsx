import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatPostDate } from '@/lib/post-shared';
import { getPublishedPosts } from '@/lib/posts';

export default async function HomePage() {
  const posts = await getPublishedPosts();
  const featuredPost = posts[0] ?? null;
  const secondaryPosts = posts.slice(1, 5);

  return (
    <main className='mx-auto w-full max-w-7xl px-4 pb-16 pt-10 md:px-12 md:pt-10'>
      <section className='mb-16'>
        <div className='relative flex min-h-[400px] w-full items-center overflow-hidden rounded-lg border border-[var(--border)] md:h-[614px]'>
          <div className='absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#f6f3f1_30%,#eef1f0_55%,#dfe5e4_70%,#2d3439_100%)]' />
          <div className='absolute inset-x-0 bottom-0 h-[48%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.75),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(196,205,206,0.5)_30%,rgba(78,91,99,0.85)_100%)]' />
          <div className='absolute left-[26%] top-[10%] h-[42%] w-[30%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(176,185,188,0.9),rgba(226,231,232,0.15)_65%,transparent_70%)] blur-[1px]' />
          <div className='absolute bottom-0 left-0 right-0 h-[35%] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(186,193,194,0.18)_20%,rgba(96,109,116,0.82)_100%)] [clip-path:polygon(0_80%,12%_55%,24%_70%,36%_45%,48%_75%,58%_50%,70%_68%,82%_38%,100%_72%,100%_100%,0_100%)]' />
          <div className='absolute right-0 top-0 h-full w-[34%] overflow-hidden'>
            <div className='absolute right-[6%] top-[6%] h-[36%] w-[1px] bg-[rgba(158,0,39,0.55)]' />
            {[
              { top: '10%', right: '12%', size: '36px' },
              { top: '16%', right: '4%', size: '30px' },
              { top: '18%', right: '18%', size: '24px' },
              { top: '24%', right: '10%', size: '26px' },
              { top: '28%', right: '20%', size: '18px' },
              { top: '31%', right: '3%', size: '22px' },
            ].map((flower, index) => (
              <span
                className='absolute rounded-full bg-[var(--primary)] opacity-90 shadow-[0_0_0_6px_rgba(255,179,180,0.18)]'
                key={index}
                style={{ top: flower.top, right: flower.right, width: flower.size, height: flower.size }}
              />
            ))}
          </div>

          <div className='relative z-10 max-w-2xl p-8 md:p-16'>
            <div className='mb-3 inline-flex items-center gap-2'>
              <span className='h-px w-8 bg-[var(--primary)]' />
              <span className='text-sm uppercase tracking-[0.2em] text-[var(--primary)]'>静水流深</span>
            </div>
            <h1 className='max-w-xl font-serif text-4xl leading-tight text-[var(--foreground)] md:text-6xl'>
              在字里行间
              <br />
              寻找内心的宁静
            </h1>
            <p className='mt-6 max-w-md text-base leading-8 text-[var(--muted-foreground)] md:text-lg'>
              探索简约生活的美学，记录关于设计、文化与个人成长的点滴思考。以文字为舟，渡至宁静之岸。
            </p>
            <Button
              asChild
              className='mt-8 rounded-sm border border-[var(--primary)] bg-transparent px-6 text-[var(--primary)] hover:bg-[rgba(158,0,39,0.05)]'
              variant='outline'
            >
              <Link href={featuredPost ? `/blog/${featuredPost.slug}` : '/blog'}>开始阅读</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 gap-8 md:grid-cols-12'>
        <div className='md:col-span-8 lg:col-span-9'>
          <div className='mb-10 flex items-center justify-between border-b border-[var(--border)] pb-3'>
            <h2 className='font-serif text-3xl text-[var(--foreground)]'>近期感悟</h2>
            <Link className='inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline' href='/blog'>
              查看全部
              <ArrowRight className='h-4 w-4' />
            </Link>
          </div>

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
            {secondaryPosts.map((post, index) => {
              const imageClassName =
                index === 0
                  ? 'bg-[linear-gradient(135deg,#2f1e18_0%,#7e4d3c_45%,#d37b60_100%)]'
                  : index === 1
                    ? 'bg-[linear-gradient(135deg,#d6d8d7_0%,#f1f1ef_40%,#221c1c_100%)]'
                    : index === 2
                      ? 'bg-[linear-gradient(135deg,#f4f1eb_0%,#d7d0c5_55%,#b99f96_100%)]'
                      : 'bg-[linear-gradient(135deg,#f8f5f1_0%,#f0ebe4_55%,#e4d7cd_100%)]';

              const cardClassName =
                index === 3 ? 'sm:col-span-2 border border-[var(--border)] rounded-lg p-8 bg-[var(--background)]' : 'group flex flex-col gap-3';

              return (
                <article className={cardClassName} key={post.id}>
                  {index !== 3 ? (
                    <>
                      <div className={`relative aspect-[4/3] overflow-hidden rounded-lg ${imageClassName}`}>
                        {index === 0 ? <div className='absolute inset-0 bg-[radial-gradient(circle_at_35%_48%,rgba(255,255,255,0.22),transparent_22%),linear-gradient(135deg,transparent_0%,transparent_65%,rgba(158,0,39,0.18)_65%,rgba(158,0,39,0.18)_67%,transparent_67%)]' /> : null}
                        {index === 1 ? <div className='absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.95)_10%,transparent_11%,transparent_42%,rgba(255,255,255,0.85)_43%,transparent_44%),linear-gradient(180deg,transparent_0%,transparent_72%,rgba(158,0,39,0.85)_72%,rgba(158,0,39,0.85)_100%)]' /> : null}
                        {index === 2 ? <div className='absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(158,0,39,0.75),rgba(158,0,39,0.75)_8px,transparent_9px)]' /> : null}
                      </div>

                      <div className='flex items-center gap-3 text-xs text-[var(--muted-foreground)]'>
                        <span className='font-medium text-[var(--primary)]'>{resolveHomeCategory(index)}</span>
                        <span>{formatPostDate(post.publishedAt)}</span>
                      </div>
                      <h3 className='font-serif text-2xl text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]'>
                        {resolveHomeTitle(post.title, index)}
                      </h3>
                      <p className='text-sm leading-7 text-[var(--muted-foreground)]'>{post.summary}</p>
                      <Link className='inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline' href={`/blog/${post.slug}`}>
                        阅读更多
                        <ArrowRight className='h-4 w-4' />
                      </Link>
                    </>
                  ) : (
                    <>
                      <div className='flex items-center gap-3 text-xs text-[var(--muted-foreground)]'>
                        <span className='font-medium text-[var(--primary)]'>自然</span>
                        <span>{formatPostDate(post.publishedAt)}</span>
                      </div>
                      <h3 className='font-serif text-3xl text-[var(--foreground)]'>四季的韵律：观察一棵树的生长历程</h3>
                      <p className='max-w-3xl text-sm leading-7 text-[var(--muted-foreground)]'>
                        自然界从不匆忙，却能完成一切。通过长达一年的定点观察，记录一棵银杏树从抽芽、繁茂、金黄到落叶的全过程，体悟时间的流转与生命的韧性。
                      </p>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </div>

        <aside className='space-y-6 md:col-span-4 lg:col-span-3'>
          <div className='overflow-hidden rounded-xl border border-[var(--border)] bg-white'>
            <div className='h-28 bg-[linear-gradient(135deg,#f3f0eb_0%,#ffffff_60%,#ded9d2_100%)]' />
            <div className='px-6 pb-6'>
              <div className='-mt-10 mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[linear-gradient(135deg,#1d2430_0%,#677080_100%)] text-lg font-semibold text-white shadow-sm'>
                LZ
              </div>
              <div className='mt-4 text-center'>
                <h3 className='font-serif text-2xl text-[var(--foreground)]'>Lin Zhi</h3>
                <p className='mt-1 text-xs text-[var(--muted-foreground)]'>无界感知者</p>
              </div>
              <p className='mt-4 text-sm leading-7 text-[var(--muted-foreground)]'>
                在无形的边界中探索，致力于通过细腻的感悟去寻找内在的秩序与精神的归宿。
              </p>
              <Button className='mt-5 w-full rounded-sm text-sm font-medium' type='button'>
                关注
              </Button>
            </div>
          </div>

          <div className='rounded-xl border border-[var(--border)] bg-white p-6'>
            <h3 className='mb-4 font-serif text-xl text-[var(--foreground)]'>推荐阅读</h3>
            <div className='space-y-4 text-sm leading-7 text-[var(--muted-foreground)]'>
              <p>格局思考，对话某个“未来艺术家”发生在清晨的对谈。</p>
              <p className='text-[var(--primary)]'>Lin静视界</p>
            </div>
            <Button className='mt-5 w-full rounded-sm text-sm font-medium' type='button'>
              立即阅读
            </Button>
          </div>
        </aside>
      </section>
    </main>
  );
}

function resolveHomeCategory(index: number): string {
  return ['生活美学', '空间美感', '汉字笔记', '自然观察'][index] || '阅读札记';
}

function resolveHomeTitle(title: string, index: number): string {
  const titles = ['茶道与留白的学', '秩序之美：间隙条纹的力量', '《中庸》与现代工艺精神', title];
  return titles[index] || title;
}
