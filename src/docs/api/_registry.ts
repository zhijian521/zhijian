/*============================================================================
  api/_registry — 接口索引

  手写登记所有 API route 的路径 / 中文名 / 分组 / 鉴权 / 方法 / 参数 / 响应字段。
  docs:check 校验：登记路径的 route.ts 必须存在 + 磁盘 route.ts 必须登记。
  /admin/docs/api 接口文档页读此 registry 按 group 分组渲染，点开看参数与响应。
============================================================================*/

export interface ApiField {
    /** 字段名或路径 */
    name: string;
    /** 类型 */
    type: string;
    /** 必填标记 */
    required?: boolean;
    /** 中文说明 */
    desc: string;
}

export interface ApiEntry {
    /** 路由路径（不含 /api 前缀），如 admin/posts */
    path: string;
    /** 接口中文名 */
    name: string;
    /** 分组 */
    group: 'posts' | 'admin' | 'nav' | 'auth' | 'ai' | 'collect' | 'util';
    /** 鉴权级别 */
    auth: 'none' | 'user' | 'admin';
    /** HTTP 方法及说明 */
    methods: { method: string; desc: string }[];
    /** 请求参数（query / body / path） */
    params?: ApiField[];
    /** 响应字段（success<T> 的 T 结构） */
    response?: ApiField[];
}

export const API_REGISTRY: ApiEntry[] = [
    // =========================================================================
    // posts — 公开接口
    // =========================================================================
    {
        path: 'posts',
        name: '公开文章列表',
        group: 'posts',
        auth: 'none',
        methods: [{ method: 'GET', desc: '返回全部已发布文章' }],
        response: [
            { name: 'id', type: 'number', desc: '文章 ID' },
            { name: 'title', type: 'string', desc: '文章标题' },
            { name: 'slug', type: 'string', desc: 'URL 友好标识' },
            { name: 'summary', type: 'string', desc: '摘要' },
            { name: 'content', type: 'string', desc: 'Markdown 正文' },
            { name: 'cover', type: 'string', desc: '封面图 URL' },
            { name: 'status', type: 'string', desc: '文章状态（published/draft）' },
            { name: 'category_id', type: 'number', desc: '所属分类 ID' },
            { name: 'category_name', type: 'string', desc: '所属分类名称' },
            { name: 'tags', type: 'Tag[]', desc: '标签列表' },
            { name: 'created_at', type: 'string', desc: '创建时间（ISO 8601）' },
            { name: 'updated_at', type: 'string', desc: '更新时间（ISO 8601）' },
        ],
    },

    // =========================================================================
    // admin — 后台管理接口（需 admin）
    // =========================================================================
    {
        path: 'admin/posts',
        name: '文章管理（列表/创建）',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'GET', desc: '获取全部文章（含草稿）' },
            { method: 'POST', desc: '创建草稿' },
        ],
        params: [
            { name: 'title', type: 'string', required: false, desc: '文章标题（POST 创建草稿，默认"无标题草稿"）' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '文章 ID' },
            { name: 'title', type: 'string', desc: '文章标题' },
            { name: 'slug', type: 'string', desc: 'URL 友好标识' },
            { name: 'summary', type: 'string', desc: '摘要' },
            { name: 'content', type: 'string', desc: 'Markdown 正文' },
            { name: 'cover', type: 'string', desc: '封面图 URL' },
            { name: 'status', type: 'string', desc: '文章状态' },
            { name: 'category_id', type: 'number', desc: '所属分类 ID' },
            { name: 'created_at', type: 'string', desc: '创建时间（ISO 8601）' },
            { name: 'updated_at', type: 'string', desc: '更新时间（ISO 8601）' },
        ],
    },
    {
        path: 'admin/posts/[id]',
        name: '文章编辑/删除',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'PATCH', desc: '更新文章字段' },
            { method: 'DELETE', desc: '删除文章' },
        ],
        params: [
            { name: 'id', type: 'number', required: true, desc: '文章 ID（路径参数）' },
            { name: 'title', type: 'string', required: false, desc: '标题' },
            { name: 'slug', type: 'string', required: false, desc: 'URL 标识' },
            { name: 'summary', type: 'string', required: false, desc: '摘要' },
            { name: 'content', type: 'string', required: false, desc: '正文' },
            { name: 'cover', type: 'string', required: false, desc: '封面图' },
            { name: 'status', type: 'string', required: false, desc: '状态' },
            { name: 'category_id', type: 'number', required: false, desc: '分类 ID' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '文章 ID' },
            { name: 'title', type: 'string', desc: '文章标题' },
            { name: 'slug', type: 'string', desc: 'URL 友好标识' },
            { name: 'content', type: 'string', desc: 'Markdown 正文' },
            { name: 'status', type: 'string', desc: '文章状态' },
        ],
    },
    {
        path: 'admin/posts/export',
        name: '文章导出',
        group: 'admin',
        auth: 'admin',
        methods: [{ method: 'GET', desc: '导出文章与图片为 ZIP（支持 ?id= 单篇）' }],
        params: [{ name: 'id', type: 'number', required: false, desc: '文章 ID（Query 参数，不传则导出全部）' }],
        response: [{ name: '(二进制)', type: 'application/zip', desc: 'ZIP 文件流，含文章 md 与引用图片' }],
    },
    {
        path: 'admin/categories',
        name: '分类管理（列表/创建）',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'GET', desc: '分类列表' },
            { method: 'POST', desc: '创建分类' },
        ],
        params: [
            { name: 'name', type: 'string', required: true, desc: '分类名称（POST 创建）' },
            { name: 'slug', type: 'string', required: false, desc: 'URL 标识（POST 创建，不传自动生成）' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '分类 ID' },
            { name: 'name', type: 'string', desc: '分类名称' },
            { name: 'slug', type: 'string', desc: 'URL 标识' },
            { name: 'post_count', type: 'number', desc: '该分类下文章数' },
        ],
    },
    {
        path: 'admin/categories/[id]',
        name: '分类编辑/删除',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'PUT', desc: '更新分类' },
            { method: 'DELETE', desc: '删除分类' },
        ],
        params: [
            { name: 'id', type: 'number', required: true, desc: '分类 ID（路径参数）' },
            { name: 'name', type: 'string', required: false, desc: '分类名称（PUT 更新）' },
            { name: 'slug', type: 'string', required: false, desc: 'URL 标识（PUT 更新）' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '分类 ID' },
            { name: 'name', type: 'string', desc: '分类名称' },
            { name: 'slug', type: 'string', desc: 'URL 标识' },
        ],
    },
    {
        path: 'admin/tags',
        name: '标签管理（列表/创建）',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'GET', desc: '标签列表' },
            { method: 'POST', desc: '创建标签' },
        ],
        params: [
            { name: 'name', type: 'string', required: true, desc: '标签名称（POST 创建）' },
            { name: 'slug', type: 'string', required: false, desc: 'URL 标识（POST 创建，不传自动生成）' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '标签 ID' },
            { name: 'name', type: 'string', desc: '标签名称' },
            { name: 'slug', type: 'string', desc: 'URL 标识' },
            { name: 'post_count', type: 'number', desc: '该标签关联文章数' },
        ],
    },
    {
        path: 'admin/tags/[id]',
        name: '标签编辑/删除',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'PUT', desc: '更新标签' },
            { method: 'DELETE', desc: '删除标签' },
        ],
        params: [
            { name: 'id', type: 'number', required: true, desc: '标签 ID（路径参数）' },
            { name: 'name', type: 'string', required: false, desc: '标签名称（PUT 更新）' },
            { name: 'slug', type: 'string', required: false, desc: 'URL 标识（PUT 更新）' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '标签 ID' },
            { name: 'name', type: 'string', desc: '标签名称' },
            { name: 'slug', type: 'string', desc: 'URL 标识' },
        ],
    },
    {
        path: 'admin/upload',
        name: '图片上传',
        group: 'admin',
        auth: 'admin',
        methods: [{ method: 'POST', desc: '上传图片（multipart/form-data）' }],
        params: [{ name: 'file', type: 'File', required: true, desc: '图片文件（multipart/form-data）' }],
        response: [
            { name: 'id', type: 'number', desc: '图片记录 ID' },
            { name: 'filename', type: 'string', desc: '存储文件名' },
            { name: 'original_name', type: 'string', desc: '原始文件名' },
            { name: 'url', type: 'string', desc: '图片访问路径' },
            { name: 'size', type: 'number', desc: '文件大小（字节）' },
        ],
    },
    {
        path: 'admin/uploads',
        name: '图片列表',
        group: 'admin',
        auth: 'admin',
        methods: [{ method: 'GET', desc: '图片列表（分页）' }],
        params: [
            { name: 'page', type: 'number', required: false, desc: '页码（Query，默认 1）' },
            { name: 'pageSize', type: 'number', required: false, desc: '每页条数（Query，默认 20）' },
        ],
        response: [
            { name: 'data', type: 'Upload[]', desc: '图片列表' },
            { name: 'total', type: 'number', desc: '总数' },
        ],
    },
    {
        path: 'admin/uploads/[id]',
        name: '图片编辑/删除',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'PATCH', desc: '更新图片信息' },
            { method: 'DELETE', desc: '删除图片' },
        ],
        params: [
            { name: 'id', type: 'number', required: true, desc: '图片 ID（路径参数）' },
            { name: 'filename', type: 'string', required: false, desc: '新文件名（PATCH）' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '图片 ID' },
            { name: 'filename', type: 'string', desc: '存储文件名' },
            { name: 'original_name', type: 'string', desc: '原始文件名' },
            { name: 'url', type: 'string', desc: '访问路径' },
        ],
    },
    {
        path: 'admin/uploads/sync',
        name: '图片同步检查',
        group: 'admin',
        auth: 'admin',
        methods: [{ method: 'GET', desc: '对比远程与本地图片差异' }],
        response: [{ name: 'missing', type: 'string[]', desc: '远程存在但本地缺失的文件列表' }],
    },
    {
        path: 'admin/users',
        name: '用户管理（列表/创建）',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'GET', desc: '用户列表（分页+搜索）' },
            { method: 'POST', desc: '创建用户' },
        ],
        params: [
            { name: 'search', type: 'string', required: false, desc: '搜索关键词（Query，匹配用户名/邮箱）' },
            { name: 'page', type: 'number', required: false, desc: '页码（Query，默认 1）' },
            { name: 'pageSize', type: 'number', required: false, desc: '每页条数（Query，默认 20）' },
            { name: 'username', type: 'string', required: true, desc: '用户名（POST 创建）' },
            { name: 'email', type: 'string', required: false, desc: '邮箱（POST 创建）' },
            { name: 'password', type: 'string', required: true, desc: '密码（POST 创建）' },
            { name: 'role', type: 'string', required: false, desc: '角色（admin/user，默认 user）' },
        ],
        response: [
            { name: 'data', type: 'User[]', desc: '用户列表' },
            { name: 'total', type: 'number', desc: '总数' },
            { name: '(单条)', type: 'User', desc: 'id / username / email / role / status / created_at' },
        ],
    },
    {
        path: 'admin/users/[id]',
        name: '用户编辑/删除',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'GET', desc: '获取用户详情' },
            { method: 'PUT', desc: '更新用户信息' },
            { method: 'DELETE', desc: '删除用户' },
        ],
        params: [
            { name: 'id', type: 'number', required: true, desc: '用户 ID（路径参数）' },
            { name: 'username', type: 'string', required: false, desc: '用户名（PUT）' },
            { name: 'email', type: 'string', required: false, desc: '邮箱（PUT）' },
            { name: 'password', type: 'string', required: false, desc: '新密码（PUT）' },
            { name: 'role', type: 'string', required: false, desc: '角色（PUT）' },
            { name: 'status', type: 'string', required: false, desc: '状态（active/disabled，PUT）' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '用户 ID' },
            { name: 'username', type: 'string', desc: '用户名' },
            { name: 'email', type: 'string', desc: '邮箱' },
            { name: 'role', type: 'string', desc: '角色' },
            { name: 'status', type: 'string', desc: '状态' },
            { name: 'created_at', type: 'string', desc: '注册时间' },
        ],
    },
    {
        path: 'admin/analytics/overview',
        name: '统计概览',
        group: 'admin',
        auth: 'admin',
        methods: [{ method: 'GET', desc: '综合统计数据（趋势/排名/来源/设备/语言/地域等）' }],
        params: [
            { name: 'siteId', type: 'number', required: true, desc: '站点 ID（Query）' },
            { name: 'range', type: 'string', required: false, desc: '时间范围（7d/30d/90d，默认 7d）' },
        ],
        response: [
            { name: 'trend', type: 'object', desc: 'PV/UV 趋势数据' },
            { name: 'pageRank', type: 'object[]', desc: '页面排行' },
            { name: 'sources', type: 'object[]', desc: '来源统计' },
            { name: 'devices', type: 'object[]', desc: '设备分布' },
            { name: 'browsers', type: 'object[]', desc: '浏览器分布' },
            { name: 'countries', type: 'object[]', desc: '国家分布' },
        ],
    },
    {
        path: 'admin/analytics/data',
        name: '统计原始数据',
        group: 'admin',
        auth: 'admin',
        methods: [{ method: 'DELETE', desc: '清除指定站点统计数据' }],
        params: [{ name: 'siteId', type: 'number', required: true, desc: '站点 ID（Query）' }],
        response: [{ name: '(空)', type: 'null', desc: '成功返回 code:0, data:null' }],
    },
    {
        path: 'admin/analytics/sites',
        name: '统计站点管理',
        group: 'admin',
        auth: 'admin',
        methods: [
            { method: 'GET', desc: '站点列表' },
            { method: 'POST', desc: '创建站点' },
            { method: 'PUT', desc: '更新站点' },
            { method: 'DELETE', desc: '删除站点' },
        ],
        params: [
            { name: 'name', type: 'string', required: true, desc: '站点名称（POST 创建）' },
            { name: 'domain', type: 'string', required: true, desc: '站点域名（POST 创建/PUT 更新）' },
        ],
        response: [
            { name: 'id', type: 'number', desc: '站点 ID' },
            { name: 'name', type: 'string', desc: '站点名称' },
            { name: 'domain', type: 'string', desc: '站点域名' },
            { name: 'script_id', type: 'string', desc: '接入脚本标识' },
            { name: 'created_at', type: 'string', desc: '创建时间' },
        ],
    },
    {
        path: 'admin/analytics/visits',
        name: '访问明细',
        group: 'admin',
        auth: 'admin',
        methods: [{ method: 'GET', desc: '分页查询访问记录' }],
        params: [
            { name: 'siteId', type: 'number', required: false, desc: '站点 ID（Query）' },
            { name: 'page', type: 'number', required: false, desc: '页码（Query）' },
            { name: 'pageSize', type: 'number', required: false, desc: '每页条数（Query）' },
        ],
        response: [
            { name: 'data', type: 'Visit[]', desc: '访问记录列表' },
            { name: 'total', type: 'number', desc: '总数' },
            { name: '(Visit)', type: 'object', desc: 'page / ip / ua / country / region / created_at' },
        ],
    },
    {
        path: 'admin/seo/submit',
        name: 'SEO URL 推送',
        group: 'admin',
        auth: 'admin',
        methods: [{ method: 'POST', desc: '将已发布文章 URL 推送到搜索引擎' }],
        params: [
            { name: 'urls', type: 'string[]', required: false, desc: '指定 URL 列表（不传则自动取全部已发布文章）' },
        ],
        response: [{ name: '(空)', type: 'null', desc: '成功返回 code:0, data:null' }],
    },

    // =========================================================================
    // nav — 导航站接口（需 user）
    // =========================================================================
    {
        path: 'nav/data',
        name: '导航站全量数据',
        group: 'nav',
        auth: 'user',
        methods: [{ method: 'GET', desc: '获取当前用户所有导航数据（书签/todo/笔记/聊天）' }],
        response: [
            { name: 'bookmarks', type: 'BookmarkItem[]', desc: '书签列表（含 title/url/icon/folder）' },
            { name: 'todos', type: 'TodoItem[]', desc: '待办列表（含 text/done）' },
            { name: 'notes', type: 'NoteItem[]', desc: '笔记列表（含 content/updatedAt）' },
            { name: 'chat', type: 'ChatMessage[]', desc: '聊天记录（含 role/content）' },
        ],
    },
    {
        path: 'nav/sync',
        name: '导航站数据同步',
        group: 'nav',
        auth: 'user',
        methods: [{ method: 'POST', desc: '批量覆盖同步导航数据（从 localStorage 到服务端）' }],
        params: [
            { name: 'bookmarks', type: 'BookmarkItem[]', required: false, desc: '书签数据' },
            { name: 'todos', type: 'TodoItem[]', required: false, desc: '待办数据' },
            { name: 'notes', type: 'NoteItem[]', required: false, desc: '笔记数据' },
            { name: 'chat', type: 'ChatMessage[]', required: false, desc: '聊天数据' },
        ],
        response: [{ name: '(空)', type: 'null', desc: '成功返回 code:0, data:null' }],
    },
    {
        path: 'nav/bookmarks',
        name: '书签保存',
        group: 'nav',
        auth: 'user',
        methods: [{ method: 'PUT', desc: '保存当前用户书签数据' }],
        params: [{ name: 'data', type: 'BookmarkItem[]', required: true, desc: '书签数据' }],
        response: [{ name: '(空)', type: 'null', desc: '成功返回 code:0, data:null' }],
    },
    {
        path: 'nav/todos',
        name: '待办保存',
        group: 'nav',
        auth: 'user',
        methods: [{ method: 'PUT', desc: '保存当前用户待办数据' }],
        params: [{ name: 'data', type: 'TodoItem[]', required: true, desc: '待办数据' }],
        response: [{ name: '(空)', type: 'null', desc: '成功返回 code:0, data:null' }],
    },
    {
        path: 'nav/notes',
        name: '笔记保存',
        group: 'nav',
        auth: 'user',
        methods: [{ method: 'PUT', desc: '保存当前用户笔记数据' }],
        params: [{ name: 'data', type: 'NoteItem[]', required: true, desc: '笔记数据' }],
        response: [{ name: '(空)', type: 'null', desc: '成功返回 code:0, data:null' }],
    },
    {
        path: 'nav/chat',
        name: '聊天记录',
        group: 'nav',
        auth: 'user',
        methods: [
            { method: 'GET', desc: '获取聊天历史' },
            { method: 'PUT', desc: '保存聊天记录' },
        ],
        params: [{ name: 'data', type: 'ChatMessage[]', required: true, desc: '聊天记录（PUT 保存）' }],
        response: [{ name: 'messages', type: 'ChatMessage[]', desc: '聊天记录列表' }],
    },

    // =========================================================================
    // auth — 认证接口
    // =========================================================================
    {
        path: 'auth/login',
        name: '用户登录',
        group: 'auth',
        auth: 'none',
        methods: [{ method: 'POST', desc: '用户名/密码登录，返回 session cookie' }],
        params: [
            { name: 'username', type: 'string', required: true, desc: '用户名' },
            { name: 'password', type: 'string', required: true, desc: '密码' },
        ],
        response: [
            { name: 'user.id', type: 'number', desc: '用户 ID' },
            { name: 'user.username', type: 'string', desc: '用户名' },
            { name: 'user.email', type: 'string', desc: '邮箱' },
            { name: 'user.role', type: 'string', desc: '角色（admin/user）' },
        ],
    },
    {
        path: 'auth/logout',
        name: '用户登出',
        group: 'auth',
        auth: 'none',
        methods: [{ method: 'POST', desc: '清除 session cookie' }],
        response: [{ name: '(空)', type: 'null', desc: '清除 session cookie，返回 code:0' }],
    },
    {
        path: 'auth/me',
        name: '当前用户信息',
        group: 'auth',
        auth: 'none',
        methods: [{ method: 'GET', desc: '返回当前登录用户信息（从 cookie 解析）' }],
        response: [
            { name: 'id', type: 'number', desc: '用户 ID' },
            { name: 'username', type: 'string', desc: '用户名' },
            { name: 'email', type: 'string', desc: '邮箱' },
            { name: 'role', type: 'string', desc: '角色' },
            { name: 'status', type: 'string', desc: '状态' },
            { name: 'created_at', type: 'string', desc: '注册时间' },
        ],
    },
    {
        path: 'auth/register',
        name: '用户注册',
        group: 'auth',
        auth: 'none',
        methods: [{ method: 'POST', desc: '注册新用户（默认 user 角色）' }],
        params: [
            { name: 'username', type: 'string', required: true, desc: '用户名' },
            { name: 'email', type: 'string', required: false, desc: '邮箱' },
            { name: 'password', type: 'string', required: true, desc: '密码' },
        ],
        response: [
            { name: 'user.id', type: 'number', desc: '用户 ID' },
            { name: 'user.username', type: 'string', desc: '用户名' },
            { name: 'user.email', type: 'string', desc: '邮箱' },
            { name: 'user.role', type: 'string', desc: '角色（默认 user）' },
        ],
    },

    // =========================================================================
    // ai — AI 对话接口（需 user）
    // =========================================================================
    {
        path: 'ai/chat',
        name: 'AI 对话',
        group: 'ai',
        auth: 'user',
        methods: [{ method: 'POST', desc: '发送消息到 AI，流式返回（SSE）' }],
        params: [
            {
                name: 'messages',
                type: 'Message[]',
                required: true,
                desc: '消息数组（含 role: user/assistant/system, content）',
            },
            { name: 'model', type: 'string', required: false, desc: '模型名称' },
        ],
        response: [
            {
                name: '(SSE)',
                type: 'text/event-stream',
                desc: '流式返回，每条 data: {content:"..."}，结束 data: [DONE]',
            },
        ],
    },
    {
        path: 'ai/models',
        name: 'AI 模型列表',
        group: 'ai',
        auth: 'user',
        methods: [{ method: 'GET', desc: '返回可用 AI 模型配置' }],
        response: [
            { name: 'id', type: 'string', desc: '模型标识' },
            { name: 'name', type: 'string', desc: '模型显示名称' },
        ],
    },

    // =========================================================================
    // collect — 数据采集接口（无鉴权）
    // =========================================================================
    {
        path: 'collect',
        name: '统计数据采集',
        group: 'collect',
        auth: 'none',
        methods: [{ method: 'POST', desc: '接收前端埋点数据（PV/UV/事件等）' }],
        params: [
            { name: 'siteId', type: 'string', required: true, desc: '站点标识（由接入脚本自动发送）' },
            { name: 'visitorId', type: 'string', required: false, desc: '访客标识' },
            { name: 'sessionId', type: 'string', required: false, desc: '会话标识' },
            { name: 'events', type: 'Event[]', required: false, desc: '事件数组' },
        ],
        response: [{ name: '(空)', type: 'null', desc: '返回 code:0, data:null' }],
    },

    // =========================================================================
    // util — 工具类接口
    // =========================================================================
    {
        path: 'favicon',
        name: 'Favicon 代理',
        group: 'util',
        auth: 'none',
        methods: [{ method: 'GET', desc: '自建 favicon 获取服务，代理抓取站点图标' }],
        params: [{ name: 'domain', type: 'string', required: true, desc: '目标站点域名（Query，如 github.com）' }],
        response: [{ name: '(二进制)', type: 'image/*', desc: '图标图片或 302 重定向' }],
    },
];
