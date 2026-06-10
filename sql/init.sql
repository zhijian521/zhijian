-- ============================================================================
--  Zhijian 数据库初始化脚本
-- ============================================================================
--  用途：首次部署时一键建库。
--  用法：mysql -u <用户名> -p <数据库名> < sql/init.sql
--  说明：所有表均使用 IF NOT EXISTS，可重复执行不会丢失数据。
--  表名规范：zhijian_<模块>_<实体>，如 zhijian_blog_posts、zhijian_users
-- ============================================================================

SET NAMES utf8mb4;

-- --------------------------------------------------------------------------
--  用户表（通用模块）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zhijian_users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  username      VARCHAR(50)     NOT NULL                COMMENT '用户名，唯一',
  email         VARCHAR(255)    NOT NULL                COMMENT '邮箱，唯一',
  password_hash VARCHAR(255)    NOT NULL                COMMENT 'bcrypt 密码哈希',
  role          ENUM('admin', 'user') NOT NULL DEFAULT 'user' COMMENT '角色：admin=管理员, user=普通用户',
  status        ENUM('active', 'disabled') NOT NULL DEFAULT 'active' COMMENT '状态',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_zhijian_users_username (username),
  UNIQUE KEY uniq_zhijian_users_email (email),
  KEY idx_zhijian_users_role (role),
  KEY idx_zhijian_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
--  博客模块 - 文章表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zhijian_blog_posts (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug        VARCHAR(120)    NOT NULL                COMMENT 'URL 友好标识，唯一',
  title       VARCHAR(200)    NOT NULL                COMMENT '文章标题',
  summary     VARCHAR(500)    NOT NULL                COMMENT '文章摘要',
  content     MEDIUMTEXT      NOT NULL                COMMENT '文章正文（Markdown）',
  status      ENUM('draft', 'published') NOT NULL DEFAULT 'draft' COMMENT '发布状态',
  published_at DATETIME       NULL                    COMMENT '发布时间',
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_zhijian_blog_posts_slug (slug),
  KEY idx_zhijian_blog_posts_status_published_at (status, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
--  博客模块 - 分类表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zhijian_blog_categories (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)    NOT NULL                COMMENT '分类名',
  slug        VARCHAR(120)    NOT NULL                COMMENT 'URL 标识，唯一',
  sort_order  INT             NOT NULL DEFAULT 0      COMMENT '排序号，越小越靠前',
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_zhijian_blog_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
--  博客模块 - 标签表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zhijian_blog_tags (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)    NOT NULL                COMMENT '标签名',
  slug        VARCHAR(120)    NOT NULL                COMMENT 'URL 标识，唯一',
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_zhijian_blog_tags_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
--  站点监控模块 - 站点注册表
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zhijian_track_sites (
  id          VARCHAR(32)     NOT NULL                COMMENT '站点ID（8位随机字符）',
  name        VARCHAR(200)    NOT NULL                COMMENT '站点名称',
  domain      VARCHAR(255)    NOT NULL                COMMENT '站点域名',
  status      ENUM('active', 'paused', 'deleted') NOT NULL DEFAULT 'active' COMMENT '状态',
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_zhijian_track_sites_domain (domain)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
--  站点监控模块 - 原始事件表（写入密集，保留 90 天）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zhijian_track_events (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id     VARCHAR(32)     NOT NULL                COMMENT '站点ID',
  type        ENUM('pageview', 'heartbeat', 'leave') NOT NULL DEFAULT 'pageview' COMMENT '事件类型',
  path        VARCHAR(500)    NOT NULL                COMMENT '页面路径',
  referrer    VARCHAR(500)    DEFAULT NULL            COMMENT '来源 URL',
  title       VARCHAR(500)    DEFAULT NULL            COMMENT '页面标题',
  duration    INT UNSIGNED    DEFAULT NULL            COMMENT '停留秒数（leave 事件）',
  screen      VARCHAR(20)     DEFAULT NULL            COMMENT '屏幕尺寸，如 1920x1080',
  lang        VARCHAR(10)     DEFAULT NULL            COMMENT '浏览器语言',
  is_new      TINYINT(1)      DEFAULT 0               COMMENT '新访客标识',
  is_session  TINYINT(1)      DEFAULT 0               COMMENT '会话首页标识',
  visitor_id  VARCHAR(64)     DEFAULT NULL            COMMENT '访客匿名ID（随机 cookie）',
  session_id  VARCHAR(64)     DEFAULT NULL            COMMENT '会话ID',
  ip          VARCHAR(45)     DEFAULT NULL            COMMENT '遮蔽 IP（192.168.1.xxx）',
  country     VARCHAR(50)     DEFAULT NULL            COMMENT '国家（中文名）',
  region      VARCHAR(50)     DEFAULT NULL            COMMENT '省份/州（中文名）',
  city        VARCHAR(100)    DEFAULT NULL            COMMENT '城市',
  ua          VARCHAR(500)    DEFAULT NULL            COMMENT 'User-Agent 原始字符串',
  browser     VARCHAR(50)     DEFAULT NULL            COMMENT '浏览器名（如 Chrome）',
  os          VARCHAR(50)     DEFAULT NULL            COMMENT '操作系统名（如 Windows）',
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_zhijian_track_events_site_created (site_id, created_at),
  KEY idx_zhijian_track_events_site_type_created (site_id, type, created_at),
  KEY idx_zhijian_track_events_site_session_type (site_id, session_id, type),
  KEY idx_zhijian_track_events_site_path (site_id, path(191)),
  KEY idx_zhijian_track_events_site_country (site_id, country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
--  站点监控模块 - 日聚合统计表（查询仪表盘时读此表）
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zhijian_track_daily (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  site_id      VARCHAR(32)     NOT NULL                COMMENT '站点ID',
  date         DATE            NOT NULL                COMMENT '统计日期',
  path         VARCHAR(500)    NOT NULL DEFAULT ''     COMMENT '页面路径（空=整站汇总）',
  pv           INT UNSIGNED    NOT NULL DEFAULT 0       COMMENT '页面浏览量',
  uv           INT UNSIGNED    NOT NULL DEFAULT 0       COMMENT '独立访客数',
  bounce       INT UNSIGNED    NOT NULL DEFAULT 0       COMMENT '跳出次数',
  avg_duration INT UNSIGNED    NOT NULL DEFAULT 0       COMMENT '平均停留秒数',
  created_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_zhijian_track_daily_site_date_path (site_id, date, path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------------
--  种子数据
-- --------------------------------------------------------------------------

INSERT IGNORE INTO zhijian_blog_categories (id, name, slug, sort_order) VALUES
  (1, '技术笔记', 'tech', 1),
  (2, '生活随想', 'life', 2),
  (3, '项目实战', 'project', 3),
  (4, '读书笔记', 'reading', 4);

INSERT IGNORE INTO zhijian_blog_tags (id, name, slug) VALUES
  (1, 'React', 'react'),
  (2, 'Next.js', 'nextjs'),
  (3, 'CSS', 'css'),
  (4, 'TypeScript', 'typescript'),
  (5, '设计', 'design'),
  (6, 'Node.js', 'nodejs');

-- --------------------------------------------------------------------------
--  增量索引（已部署环境手动执行）
-- --------------------------------------------------------------------------
-- ALTER TABLE zhijian_track_events
--   ADD KEY idx_zhijian_track_events_site_type_created (site_id, type, created_at),
--   ADD KEY idx_zhijian_track_events_site_session_type (site_id, session_id, type);
