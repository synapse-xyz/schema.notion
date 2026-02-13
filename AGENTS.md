# AGENTS.md - AI Coding Agent Guidelines

This document provides guidelines for AI coding agents working in this codebase.

## Project Overview

**schema.ai** - A Next.js 15 application for AI-powered database schema design using Google Gemini. Users describe their database needs in natural language, and the app generates visual diagrams and SQL/MongoDB schemas.

**Tech Stack:** Next.js 15.3 (App Router, React 19), TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui, Clerk auth, MongoDB/Mongoose, Google Gemini AI, Zustand, pnpm

## Build, Lint, and Test Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run Biome linter (biome lint ./src)
pnpm lint:fix         # Auto-fix linting issues
```

**Testing:** No test framework configured. When added, use `pnpm test` / `pnpm test <file>`.

## Code Style Guidelines

### Formatting (Biome)
- **Quotes:** Single quotes
- **Semicolons:** None (auto-inserted when needed)
- **Trailing commas:** Always
- **Indentation:** 2 spaces

### Naming Conventions
| Category | Convention | Example |
|----------|------------|---------|
| Files (components/utils) | kebab-case | `chat-input.tsx`, `parse-utils.ts` |
| Models | PascalCase | `Thread.ts`, `User.ts` |
| Components | PascalCase | `ChatInput`, `Button` |
| Functions/Variables | camelCase | `handleSendMessage`, `isLoading` |
| Types/Interfaces | PascalCase | `Message`, `ChatStore` |
| Mongoose interfaces | `I` prefix | `IThread`, `IUser` |
| Config constants | SCREAMING_SNAKE | `GEMINI_API_KEY` |

### Imports
```typescript
// External imports first, then internal with @/ alias
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { Message, Roles } from '@/types/chat'
import { useChatStore } from '@/stores/chat'
import { cn } from '@/lib/utils'
```
- Always use `@/` path alias for internal imports
- Use `import type { ... }` for type-only imports

### TypeScript Patterns
```typescript
// Type for unions/simple types
export type Roles = 'user' | 'model'

// Interface for object shapes
export interface Message {
  id: string
  role: Roles
  message: string
}

// Mongoose documents (prefix with I)
export interface IThread extends Document {
  chat_id: string
  user_id: string
}

// Next.js 15 page props (Promise params)
type PageProps = { params: Promise<{ id: string }> }

// React component props
function Button({ className, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>) {}
```

### React Components
```typescript
// Server Component (default, no directive)
export default async function Schema({ params }: PageProps) {
  const { id } = await params
  return <PageContent />
}

// Client Component
'use client'
export function ChatInput() { const [input, setInput] = useState('') }

// Server Action
'use server'
export async function validateUserIntent(msg: string): Promise<ValidationResult> {}
```

### Error Handling
```typescript
try {
  const response = await ai.models.generateContent({ ... })
  return response?.text ? JSON.parse(response.text) : defaultValue
} catch (error) {
  console.error('Error description:', error)
  return fallbackValue
}
```

### Styling
```typescript
import { cn } from '@/lib/utils'
<div className={cn('base-classes', isActive && 'active-classes')} />
```
- Use Tailwind CSS utility classes
- shadcn/ui components in `src/components/ui/`
- CSS variables in `globals.css` for theming

### State Management (Zustand)
```typescript
'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({ chatHistory: null, isLoading: false }),
    { name: 'chat-storage', storage: createJSONStorage(() => sessionStorage) },
  ),
)
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (Clerk provider)
│   ├── globals.css         # Tailwind + CSS variables
│   ├── schema/[id]/        # Dynamic schema editor
│   └── schemas/            # Schema list page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── chat/               # Chat interface
│   └── reactflow/          # Diagram components
├── lib/                    # Core utilities (gemini.ts, prompts.ts, thread.ts)
├── models/                 # Mongoose schemas (Thread.ts, User.ts)
├── stores/                 # Zustand stores
├── types/                  # TypeScript type definitions
└── middleware.ts           # Clerk auth middleware
```

## Environment Variables

Required in `.env.local`:
```
GEMINI_API_KEY=           # Google Gemini API key
CLERK_SECRET_KEY=         # Clerk authentication
NEXT_PUBLIC_CLERK_*=      # Clerk public keys
MONGODB_URI=              # MongoDB connection string
```

## Notes

- Codebase contains Spanish comments (bilingual development)
- Use React Flow (@xyflow/react) for diagram visualization
- Prefer server components; use `'use client'` only when necessary
- All AI interactions go through `src/lib/gemini.ts`
