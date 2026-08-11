# AGENTS.md

## Project Overview
BookClub 2000 — a Windows 2000-styled asynchronous co-reading club. Create reading rooms, upload chapters, annotate passages, run discussion threads, and export notes. Also serves as the developer's personal reading log (`/reading-log`).

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI**: Custom Windows 2000/XP style (win-* classes, not shadcn/ui)
- **Styling**: Tailwind CSS 4 + custom CSS
- **Package manager**: pnpm

## Build & Run
```bash
pnpm install          # install dependencies
pnpm run dev          # development
pnpm run build        # build
pnpm run start        # production start
```

## Directory Structure
```
src/
├── app/
│   ├── page.tsx                    # Home - room list/create/join
│   ├── reading-log/page.tsx        # Personal reading log
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Windows 2000 global styles
│   ├── api/
│   │   ├── rooms/route.ts          # GET room list, POST create room
│   │   ├── rooms/[id]/route.ts     # GET room detail
│   │   ├── rooms/[id]/join/route.ts # POST join room
│   │   ├── rooms/[id]/chapters/route.ts # GET/POST chapters
│   │   ├── chapters/[id]/route.ts  # GET chapter detail
│   │   ├── chapters/[id]/annotations/route.ts # GET/POST annotations
│   │   ├── chapters/[id]/discussions/route.ts # GET/POST discussions
│   │   └── export/[roomId]/route.ts # GET export notes
│   └── room/
│       └── [id]/
│           ├── page.tsx            # Room detail page
│           └── chapter/[chapterId]/page.tsx  # Chapter reading + annotation + discussion
├── components/ui/                  # shadcn/ui components (unused, kept)
├── lib/
│   ├── bookclub-demo.ts            # localStorage demo data layer
│   ├── reading-log.ts              # Generated reading log data
│   └── bookclub-demo.test.ts       # Demo store tests
└── storage/database/
    ├── supabase-client.ts          # Supabase client
    └── shared/schema.ts            # Drizzle table definitions
```

## Data Model
- `reading_rooms` - reading rooms (with invite code)
- `room_members` - room members (nickname and color)
- `chapters` - chapters (with text content)
- `annotations` - annotations (selected text + comment, linked to member and chapter)
- `discussions` - discussion threads (parent_id supports nested replies)

## Design Style
Millennium-era Windows 2000/XP desktop app aesthetic. See DESIGN.md.
Key traits: grey window frames, blue gradient title bars, 3D outset/inset borders, Tahoma font, no rounded corners/shadows/animations.

## Code Conventions
- All page components use the `'use client'` directive where interactive
- Use `Link` from `next/link` for page navigation
- Supabase operations must check `{ data, error }` and throw on error
- Field names use snake_case
- All user-facing strings are English
