# 知简 · zhijian

统一仓库地址：[zhijian521/zhijian](https://github.com/zhijian521/zhijian)。

当前未部署公开网站，不登记线上访问地址。

个人站点的重构项目，统一保存新版工程、旧版参考源码和两边的原始 Git 历史。

## 目录

- `src/`、`public/`、`tests/`：新版工程，使用 Next.js 16、React 19、TypeScript 和 MySQL。
- `docs/00-迁移审查总表.md`：渐进迁移的进度、边界和人工审查记录。
- [`legacy/zhijian/`](legacy/zhijian/README.md)：旧站完整源码，用于后续功能迁移和行为参考。

新版仍在迁移中，不能视为已经覆盖旧站的全部功能。功能迁移继续按[迁移审查总表](docs/00-迁移审查总表.md)逐项进行，旧代码不直接进入新版运行入口。

## 本地开发

使用 Node.js 24 和项目登记的 npm 版本，在仓库根目录操作：

```bash
npm ci
npm run dev
```

环境变量参照根目录 `.env.example`。旧版源码已从根目录 TypeScript 与 ESLint 扫描范围中排除，保留各自的配置与依赖清单。

## 历史归档

本次整理保留原始提交 SHA、作者和日期，不使用 squash 或历史重写。两边历史均连接到默认分支，原来的其他分支和标签也保留：

| 原仓库 / 分支 | 当前分支或标签 |
| --- | --- |
| `zhijian/master` | `archive/zhijian-master` |
| `zhijian/20260524` | `archive/zhijian-20260524` |
| `zhijian/gh-pages` | `archive/zhijian-gh-pages` |
| `zhijian-home/master` 合并前 | `archive/zhijian-home-before-merge` |
| `zhijian-home/backup/pre-refactor-v1` | `backup/pre-refactor-v1` |
| `zhijian-home` 标签 | `v1.0-pre-refactor` |

原仓库 `zhijian` 的 Issues、Pull Requests、Release 和部署设置不属于 Git 提交历史，不会随 Git 合并自动迁移。GitHub 贡献统计由 GitHub 按作者邮箱、仓库及分支等规则重新计算，可能存在更新延迟。
