# AGENTS.md - AI Coding Agent Guidelines

Guidelines for AI coding agents working in this codebase.

## Project Overview

**schema.ai** - Next.js 15 app for AI-powered database schema design using Google Gemini. Users describe database needs in natural language, and the app generates visual diagrams and SQL/MongoDB schemas.

**Tech Stack:** Next.js 15.3 (App Router, React 19, Turbopack), TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui, Clerk auth, MongoDB/Mongoose, Google Gemini AI (@google/genai), Zustand, React Flow (@xyflow/react), pnpm

## Build, Lint, and Test Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server with Turbopack
pnpm build            # Production build (runs type checking)
pnpm start            # Start production server
pnpm lint             # Run Biome linter (biome lint ./src)
pnpm lint:fix         # Auto-fix linting issues (biome lint --write ./src)
```

**Testing:** No test framework configured. When added, use `pnpm test` / `pnpm test <file>`.

## Code Style Guidelines

### Formatting (Biome - see biome.json)
- **Quotes:** Single quotes
- **Semicolons:** As needed (omit when possible)
- **Trailing commas:** Always
- **Indentation:** 2 spaces

### Naming Conventions
| Category | Convention | Example |
|----------|------------|---------|
| Files (components/utils) | kebab-case | `chat-input.tsx` |
| Models | PascalCase | `Thread.ts` |
| Components | PascalCase | `ChatInput` |
| Functions/Variables | camelCase | `handleSendMessage` |
| Types/Interfaces | PascalCase | `Message` |
| Mongoose interfaces | `I` prefix | `IThread` |
| Constants | SCREAMING_SNAKE | `GEMINI_API_KEY` |

### Imports
```typescript
// External first, then internal with @/ alias
import { currentUser } from '@clerk/nextjs/server'
import type { Message } from '@/types/chat'
import { useChatStore } from '@/stores/chat'
```
- Always use `@/` path alias (maps to `./src/*`)
- Use `import type { ... }` for type-only imports
- Biome auto-organizes imports with `pnpm lint:fix`

### TypeScript Patterns
```typescript
// Use `type` for unions, `interface` for object shapes
export type Roles = 'user' | 'model'

export interface Message {
  id: string
  role: Roles
}

// Mongoose documents: prefix with `I`
export interface IThread extends Document {
  chat_id: string
}

// Next.js 15 page props (params is a Promise)
type PageProps = { params: Promise<{ id: string }> }
```

### React Components
```typescript
// Server Component (default - no directive)
export default async function Schema({ params }: PageProps) {
  const { id } = await params  // Next.js 15: await params
  return <PageContent />
}

// Client Component - 'use client' at top
'use client'
export function ChatInput() { const [input, setInput] = useState('') }

// Server Action - 'use server' at top
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
  return fallbackValue  // Always return a fallback
}
```

### Styling
```typescript
import { cn } from '@/lib/utils'
<div className={cn('base-classes', isActive && 'active-classes')} />
```
- Tailwind CSS utilities; shadcn/ui in `src/components/ui/`

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
│   ├── layout.tsx          # Root layout (ClerkProvider)
│   ├── schema/[id]/        # Dynamic schema editor
│   └── schemas/            # Schema list page
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── chat/               # Chat interface
│   └── reactflow/          # Diagram components
├── lib/                    # Utilities (gemini.ts, prompts.ts, thread.ts)
├── models/                 # Mongoose schemas (Thread.ts, User.ts)
├── stores/                 # Zustand stores (chat.ts, config.ts)
├── types/                  # TypeScript types
└── middleware.ts           # Clerk auth middleware
```

## Environment Variables

Required in `.env.local`:
```bash
GEMINI_API_KEY=           # Google Gemini API key
CLERK_SECRET_KEY=         # Clerk secret key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
MONGODB_URI=              # MongoDB connection string
```

## Key Patterns

1. **AI interactions:** All Gemini calls go through `src/lib/gemini.ts` (server actions)
2. **Server vs Client:** Prefer server components; `'use client'` only when needed
3. **Diagrams:** React Flow (@xyflow/react) with custom nodes/edges
4. **Auth:** Clerk handles auth; middleware protects routes
5. **Language:** Codebase contains Spanish comments/UI (bilingual)
