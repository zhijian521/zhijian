import { NextRequest, NextResponse } from 'next/server';

import { isAdminRequestAuthenticated } from '@/lib/auth';
import { createPost, getAllPosts } from '@/lib/posts';

/**
 * 后台文章列表接口：
 * - `GET` 返回全部文章
 * - `POST` 创建新的草稿文章
 */
export async function GET(request: NextRequest) {
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

  const posts = await getAllPosts();

  return NextResponse.json({
    data: posts,
  });
}

export async function POST(request: NextRequest) {
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

  let body: { title?: string };

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

  // 未输入标题时自动生成一个带时间戳的草稿标题，方便直接进入编辑页。
  const title =
    body.title?.trim() ||
    `新文章 ${new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())}`;

  const post = await createPost({
    title,
    slug: `draft-post-${Date.now()}`,
    summary: '请在这里补充文章摘要。',
    content: '请在这里开始写正文。',
  });

  if (!post) {
    return NextResponse.json(
      {
        message: '新建文章失败，请确认数据库已连接。',
      },
      {
        status: 400,
      },
    );
  }

  return NextResponse.json({
    data: post,
    message: '新建文章成功。',
  });
}
