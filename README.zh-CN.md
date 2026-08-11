# BookClub 2000 📚

一个 **Windows 2000 风格**的异步共读协作平台 —— 同时也是我的**个人读书记录**。

> 一群人读同一本书：创建房间、添加章节、划选批注、发帖讨论。
> 网站同时收录了我读过的全部书单（从豆瓣导出）。

**在线演示：** <https://book-club-2000.vercel.app>

![tech](https://img.shields.io/badge/Next.js-16-black) ![ts](https://img.shields.io/badge/TypeScript-5-blue) ![ui](https://img.shields.io/badge/UI-Windows_2000-0A246A)

---

## ✨ 功能

### 共读平台
- **读书房间** —— 为一本书创建房间，用 6 位邀请码邀请朋友
- **章节** —— 按章节粘贴上传书目内容
- **批注** —— 选中任意段落添加荧光笔式批注
- **讨论** —— 每个章节的楼中楼式讨论，支持回复
- **导出** —— 一键导出全俱乐部批注与讨论为 Markdown
- **演示模式** —— 完全运行在浏览器（localStorage），零数据库；内置 Supabase API 层，需要真实后端时可切换

### 读书记录
- `/reading-log` —— 完整收录我读过的 **86 本书**，含评分（★）、阅读日期与短评
- 数据来自[我的豆瓣主页](https://www.douban.com/people/227017213/)，2026-08-11 更新
- 按阅读日期倒序 —— 59 本有评分，平均 4.3/5

## 🖥️ Windows 2000 视觉

所有控件遵循 2001 年 CRT 机房的设计语言：灰色 `#C0C0C0` 窗体、藏蓝渐变标题栏（`#0A246A → #3A6EA5`）、Tahoma 11px、outset/inset 3D 边框。无圆角、无毛玻璃、无 emoji 图标（见 `DESIGN.md`）。

## 🛠️ 技术栈

| 层 | 选型 |
|-------|-------|
| 框架 | Next.js 16（App Router）+ TypeScript 5 |
| 样式 | Tailwind CSS v4 + 自定义 `win-*` 类 |
| UI | shadcn/ui（Radix） |
| 数据（演示） | localStorage，经由 `src/lib/bookclub-demo.ts` |
| 数据（可选后端） | Supabase + Drizzle ORM（已含 API 路由） |

## 🚀 快速开始

```bash
# 必须使用 pnpm（preinstall 强制）
pnpm install
pnpm dev        # 或: bash ./scripts/dev.sh
pnpm build      # 生产构建
pnpm start      # 生产启动
```

任何支持 Next.js 的平台均可部署 —— 演示模式无需任何环境变量。

## 📂 项目结构

```
src/
├── app/
│   ├── page.tsx                      # 主页 —— 房间列表与对话框
│   ├── reading-log/page.tsx          # 个人读书记录（86 本书）
│   ├── room/[id]/page.tsx            # 房间视图 —— 章节与成员
│   ├── room/[id]/chapter/[chapterId]/page.tsx  # 阅读视图 —— 批注与讨论
│   └── api/                          # Supabase REST 路由（可选后端）
├── lib/
│   ├── bookclub-demo.ts              # localStorage 演示数据层
│   ├── reading-log.ts                # 生成的读书记录数据
└── storage/database/                 # Drizzle 表结构 + Supabase 客户端
```

## 📖 读书记录数据

`src/lib/reading-log.ts` 由豆瓣导出生成。更新方式：

1. 从豆瓣导出书目（CSV）
2. 运行解析脚本重新生成 `src/lib/reading-log.ts`
3. 提交推送 —— 部署后网站自动更新

## ©️

由 [NoahIsARider](https://github.com/NoahIsARider) 构建。个人项目 —— 保留所有权利，无开源许可。
