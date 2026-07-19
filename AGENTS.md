# AGENTS.md

## 项目概览
BookClub 2000 - 电子书/长文共读俱乐部。异步共读协作平台，支持创建读书房间、上传章节、段落批注、讨论线程和导出纪要。

## 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: 自定义 Windows 2000/XP 风格（非 shadcn/ui）
- **Styling**: Tailwind CSS 4 + 自定义 CSS
- **Database**: Supabase (PostgreSQL)
- **包管理**: pnpm

## 构建与运行
```bash
pnpm install          # 安装依赖
pnpm run dev          # 开发环境
pnpm run build        # 构建
pnpm run start        # 生产启动
```

## 目录结构
```
src/
├── app/
│   ├── page.tsx                    # 首页 - 房间列表/创建/加入
│   ├── layout.tsx                  # 根布局
│   ├── globals.css                 # Windows 2000 风格全局样式
│   ├── api/
│   │   ├── rooms/route.ts          # GET 房间列表, POST 创建房间
│   │   ├── rooms/[id]/route.ts     # GET 房间详情
│   │   ├── rooms/[id]/join/route.ts # POST 加入房间
│   │   ├── rooms/[id]/chapters/route.ts # GET/POST 章节
│   │   ├── chapters/[id]/route.ts  # GET 章节详情
│   │   ├── chapters/[id]/annotations/route.ts # GET/POST 批注
│   │   ├── chapters/[id]/discussions/route.ts # GET/POST 讨论
│   │   └── export/[roomId]/route.ts # GET 导出纪要
│   └── room/
│       └── [id]/
│           ├── page.tsx            # 房间详情页
│           └── chapter/[chapterId]/
│               └── page.tsx        # 章节阅读+批注+讨论页
├── components/ui/                  # shadcn/ui 组件（未使用，保留）
├── storage/database/
│   ├── supabase-client.ts          # Supabase 客户端
│   └── shared/schema.ts            # Drizzle 表定义
```

## 数据模型
- `reading_rooms` - 读书房间（含邀请码）
- `room_members` - 房间成员（含昵称和颜色标识）
- `chapters` - 章节（含文本内容）
- `annotations` - 批注（选中文本+评论，关联成员和章节）
- `discussions` - 讨论线程（支持 parent_id 实现回复嵌套）

## 设计风格
千禧年 Windows 2000/XP 桌面应用风格。详见 DESIGN.md。
核心特征：灰色窗口框架、蓝色渐变标题栏、3D 凹凸边框、Tahoma 字体、无圆角/阴影/动画。

## 代码规范
- 所有页面组件使用 `'use client'` 指令
- 使用 `Link` from `next/link` 进行页面导航
- Supabase 操作必须检查 `{ data, error }` 并 throw
- 字段名使用 snake_case
