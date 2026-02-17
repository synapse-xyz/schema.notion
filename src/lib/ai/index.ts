'use server'

import type { Message } from '@/types/chat'
import { createGeminiProvider } from './providers/gemini'
import { createOllamaProvider } from './providers/ollama'
import type {
  AIProvider,
  ChatMessage,
  CompareResult,
  SendMessageResult,
  ValidationResult,
} from './types'

/**
 * Supported provider identifiers.
 * Set via AI_PROVIDER env var.
 */
type ProviderName = 'gemini' | 'ollama'

const DEFAULT_PROVIDER: ProviderName = 'ollama'

/**
 * Singleton cache so we don't re-create the provider on every call.
 */
let cachedProvider: AIProvider | null = null

function getProvider() {
  if (cachedProvider) return cachedProvider

  const providerName =
    (process.env.AI_PROVIDER as ProviderName) || DEFAULT_PROVIDER

  switch (providerName) {
    case 'gemini':
      cachedProvider = createGeminiProvider()
      break
    case 'ollama':
      cachedProvider = createOllamaProvider()
      break
    default:
      throw new Error(
        `Unknown AI provider: "${providerName}". Supported: gemini, ollama`,
      )
  }

  console.log(`[AI] Using provider: ${cachedProvider.name}`)
  return cachedProvider
}

// ─── Public server actions ────────────────────────────────────────
// These are the functions the rest of the app should import.
// They delegate to whichever provider is configured.

export async function validateUserIntent(
  userMessage: string,
): Promise<ValidationResult> {
  return getProvider().validateUserIntent(userMessage)
}

export async function sendUserMessage(
  history: ChatMessage[],
  userMessage: string,
): Promise<SendMessageResult> {
  return getProvider().sendUserMessage(history, userMessage)
}

export async function normalizeChat(
  messages: Message[],
): Promise<ChatMessage[]> {
  return getProvider().normalizeChat(messages)
}

export async function compareJsonSchemas(
  oldJson: string,
  newJson: string,
): Promise<CompareResult> {
  return getProvider().compareJsonSchemas(oldJson, newJson)
}

export async function generateDatabaseScriptFromDiagram(
  diagram: string,
  databaseType: 'sql' | 'mongo',
): Promise<string> {
  return getProvider().generateDatabaseScriptFromDiagram(diagram, databaseType)
}
