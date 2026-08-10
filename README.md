# projects

A full-stack application project built on [Next.js 16](https://nextjs.org) + [shadcn/ui](https://ui.shadcn.com), created with the Coze programming CLI.

## Quick Start

### Start the Development Server

```bash
coze dev
```

After starting, open [http://localhost:5000](http://localhost:5000) in your browser to view the app.

The development server supports hot reload; pages refresh automatically after you modify code.

### Build for Production

```bash
coze build
```

### Start the Production Server

```bash
coze start
```

## Project Structure

```
src/
├── app/                      # Next.js App Router directory
│   ├── layout.tsx           # Root layout component
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles (includes shadcn theme variables)
│   └── [route]/             # Other route pages
├── components/              # React components directory
│   └── ui/                  # shadcn/ui base components (preferred)
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/                     # Utility functions
│   └── utils.ts            # Utility functions such as cn()
└── hooks/                   # Custom React Hooks (optional)

server/
├── index.ts                 # Custom server entry point
├── tsconfig.json           # Server TypeScript configuration
└── dist/                    # Compiled output directory (auto-generated)
```

## Core Development Guidelines

### 1. Component Development

**Prefer shadcn/ui base components**

This project comes with a full shadcn/ui component library pre-installed in the `src/components/ui/` directory. During development, you should prefer these components as the foundation:

```tsx
// ✅ Recommended: use shadcn base components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function MyComponent() {
  return (
    <Card>
      <CardHeader>Title</CardHeader>
      <CardContent>
        <Input placeholder="Enter content" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

**Available shadcn components**

- Forms: `button`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `switch`, `slider`
- Layout: `card`, `separator`, `tabs`, `accordion`, `collapsible`, `scroll-area`
- Feedback: `alert`, `alert-dialog`, `dialog`, `toast`, `sonner`, `progress`
- Navigation: `dropdown-menu`, `menubar`, `navigation-menu`, `context-menu`
- Data display: `table`, `avatar`, `badge`, `hover-card`, `tooltip`, `popover`
- Others: `calendar`, `command`, `carousel`, `resizable`, `sidebar`

See the specific component implementations in the `src/components/ui/` directory.

### 2. Routing

Next.js uses file-system routing; create folders under `src/app/` to add routes:

```bash
# Create a new route /about
src/app/about/page.tsx

# Create a dynamic route /posts/[id]
src/app/posts/[id]/page.tsx

# Create a route group (does not affect the URL)
src/app/(marketing)/about/page.tsx

# Create an API route
src/app/api/users/route.ts
```

**Page component example**

```tsx
// src/app/about/page.tsx
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About Us',
  description: 'About page description',
};

export default function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <Button>Learn More</Button>
    </div>
  );
}
```

**Dynamic route example**

```tsx
// src/app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <div>Post ID: {id}</div>;
}
```

**API route example**

```tsx
// src/app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true });
}
```

### 3. Dependency Management

**You must use pnpm for dependency management**

```bash
# ✅ Install dependencies
pnpm install

# ✅ Add a new dependency
pnpm add package-name

# ✅ Add a dev dependency
pnpm add -D package-name

# ❌ npm and yarn are not allowed
# npm install  # wrong!
# yarn add     # wrong!
```

The project includes a `preinstall` script; using any other package manager will cause an error.

### 4. Styling

**Use Tailwind CSS v4**

This project uses Tailwind CSS v4 for styling and comes with shadcn theme variables pre-configured.

```tsx
// Use Tailwind class names
<div className="flex items-center gap-4 p-4 rounded-lg bg-background">
  <Button className="bg-primary text-primary-foreground">
    Primary Button
  </Button>
</div>

// Use the cn() utility function to merge class names
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  condition && "conditional-class",
  className
)}>
  Content
</div>
```

**Theme variables**

Theme variables are defined in `src/app/globals.css` and support light/dark mode:

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`

### 5. Forms

Use `react-hook-form` + `zod` for form development:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', email: '' },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('username')} />
      <Input {...form.register('email')} />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### 6. Data Fetching

**Server components (recommended)**

```tsx
// src/app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    cache: 'no-store', // or 'force-cache'
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.title}</div>
      ))}
    </div>
  );
}
```

**Client components**

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

## Common Development Scenarios

### Add a New Page

1. Create a folder and `page.tsx` under `src/app/`
2. Build the UI with shadcn components
3. Add `layout.tsx` and `loading.tsx` as needed

### Create Business Components

1. Create component files under `src/components/` (non-UI components)
2. Prefer composing the base components from `src/components/ui/`
3. Define prop types with TypeScript

### Add Global State

Use React Context or Zustand:

```tsx
// src/lib/store.ts
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### Integrate a Database

Use Prisma or Drizzle ORM, configured in `src/lib/db.ts`.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **UI components**: shadcn/ui (based on Radix UI)
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Package manager**: pnpm 9+
- **TypeScript**: 5.x

## References

- [Next.js documentation](https://nextjs.org/docs)
- [shadcn/ui component documentation](https://ui.shadcn.com)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com)

## Important Notes

1. **You must use pnpm** as the package manager
2. **Prefer shadcn/ui components** rather than building base components from scratch
3. **Follow Next.js App Router conventions** and correctly distinguish server/client components
4. **Use TypeScript** for type-safe development
5. **Use the `@/` path alias** for imports (already configured)
