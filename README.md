# BookClub 2000 📚

A **Windows 2000-styled** asynchronous co-reading platform — and my personal **reading log**.

> Read the same book together: create a room, add chapters, highlight passages, annotate and discuss.
> The site also hosts a curated log of everything I've read (exported from Douban).

**Live demo:** <https://book-club-2000.vercel.app>

![tech](https://img.shields.io/badge/Next.js-16-black) ![ts](https://img.shields.io/badge/TypeScript-5-blue) ![ui](https://img.shields.io/badge/UI-Windows_2000-0A246A)

---

## ✨ Features

### Co-reading platform
- **Reading rooms** — create a room for a book, invite friends with a 6-letter invite code
- **Chapters** — paste book content in, chapter by chapter
- **Annotations** — select any passage and leave a highlighted note (yellow highlighter style)
- **Discussions** — threaded discussion per chapter, with replies
- **Export** — download the whole club's annotations & discussions as Markdown
- **Demo mode** — runs entirely in the browser (localStorage), zero database required; a Supabase API layer is included for when you want a real backend

### Reading log
- `/reading-log` — a full list of **86 books** I've logged, with ratings (★), dates read and notes
- Data exported from [my Douban profile](https://www.douban.com/people/227017213/), updated 2026-08-11
- Sorted by date read, newest first — 59 rated, average 4.3/5

## 🖥️ The Windows 2000 aesthetic

Every control follows the 2001 CRT-era design language: grey `#C0C0C0` chrome, navy gradient title bars (`#0A246A → #3A6EA5`), Tahoma 11px, outset/inset 3D borders. No rounded corners, no glassmorphism, no emoji icons (see `DESIGN.md`).

## 🛠️ Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS v4 + custom `win-*` classes |
| UI | shadcn/ui (Radix) |
| Data (demo) | localStorage via `src/lib/bookclub-demo.ts` |
| Data (optional backend) | Supabase + Drizzle ORM (API routes included) |

## 🚀 Getting started

```bash
# pnpm is required (enforced by preinstall)
pnpm install
pnpm dev        # or: bash ./scripts/dev.sh
pnpm build      # production build
pnpm start      # production server
```

Deploy anywhere Next.js runs — the demo needs no environment variables.

## 📂 Project structure

```
src/
├── app/
│   ├── page.tsx                      # Home — room list & dialogs
│   ├── reading-log/page.tsx          # Personal reading log (86 books)
│   ├── room/[id]/page.tsx            # Room view — chapters & members
│   ├── room/[id]/chapter/[chapterId]/page.tsx  # Reading view — annotations & discussion
│   └── api/                          # Supabase REST routes (optional backend)
├── lib/
│   ├── bookclub-demo.ts              # localStorage demo data layer
│   ├── reading-log.ts                # Generated reading log data
└── storage/database/                 # Drizzle schema + Supabase client
```

## 📖 Reading log data

`src/lib/reading-log.ts` is generated from my Douban export. To refresh it:

1. Export your books from Douban (CSV)
2. Run the parsing script and regenerate `src/lib/reading-log.ts`
3. Open a PR or commit — the site updates on deploy

## ©️

Built by [NoahIsARider](https://github.com/NoahIsARider). Personal project — no license, all rights reserved.
