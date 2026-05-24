import { NextRequest, NextResponse } from 'next/server';

import { isAdminRequestAuthenticated } from '@/lib/auth';
import type { PostStatus } from '@/lib/post-shared';
import type { UpdatePostInput } from '@/lib/posts';
import { updatePostById } from '@/lib/posts';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 后台文章详情更新接口，只允许已登录管理员修改指定文章。
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json(
      {
        message: '未登录或登录已失效。',
      },
      {
        status: 401,
      },
    );
  }

  const { id } = await context.params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json(
      {
        message: '文章 ID 不合法。',
      },
      {
        status: 400,
      },
    );
  }

  let body: Partial<UpdatePostInput>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: '请求体格式不正确。',
      },
      {
        status: 400,
      },
    );
  }

  const title = body.title?.trim() || '';
  const slug = body.slug?.trim() || '';
  const summary = body.summary?.trim() || '';
  const content = body.content?.trim() || '';
  const status = body.status;
  const publishedAt = body.publishedAt ?? null;

  if (!title || !slug || !summary || !content) {
    return NextResponse.json(
      {
        message: '标题、Slug、摘要和正文都不能为空。',
      },
      {
        status: 400,
      },
    );
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      {
        message: 'Slug 只能使用小写字母、数字和中划线。',
      },
      {
        status: 400,
      },
    );
  }

  if (!isPostStatus(status)) {
    return NextResponse.json(
      {
        message: '发布状态不合法。',
      },
      {
        status: 400,
      },
    );
  }

  if (publishedAt !== null && typeof publishedAt !== 'string') {
    return NextResponse.json(
      {
        message: '发布时间格式不合法。',
      },
      {
        status: 400,
      },
    );
  }

  const updatedPost = await updatePostById(postId, {
    title,
    slug,
    summary,
    content,
    status,
    publishedAt,
  });

  if (!updatedPost) {
    return NextResponse.json(
      {
        message: '文章不存在，或当前环境未连接数据库。',
      },
      {
        status: 404,
      },
    );
  }

  return NextResponse.json({
    data: updatedPost,
    message: '保存成功。',
  });
}

function isPostStatus(value: unknown): value is PostStatus {
  return value === 'draft' || value === 'published';
}
