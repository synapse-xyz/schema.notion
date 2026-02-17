import type { Message } from '@/types/chat'

/**
 * Roles used internally across providers.
 * Each provider maps these to its own format.
 */
export type ChatRole = 'user' | 'model'

/**
 * A single message in the provider-agnostic chat history.
 * This is what gets passed between the AI service and providers.
 */
export interface ChatMessage {
  role: ChatRole
  parts: { text: string }[]
}

/**
 * Result of validating whether a user's message is a legitimate
 * database-related request.
 */
export interface ValidationResult {
  isValid: boolean
  message: string
}

/**
 * Result of sending a user message to the main schema-generation model.
 */
export interface SendMessageResult {
  responseText: string
  updatedHistory: ChatMessage[]
}

/**
 * Result of comparing two JSON schemas.
 */
export interface CompareResult {
  summary: string
  newSchema?: object
}

/**
 * The contract every AI provider must implement.
 *
 * Each method maps 1:1 to a capability the app needs.
 * Providers are free to use whatever SDK, API, or local model
 * they want internally -- as long as they return the right shape.
 */
export interface AIProvider {
  /** Human-readable name for logging / debugging */
  readonly name: string

  /**
   * Determine if the user's message is a valid database-related request.
   * Should return { isValid: false, message } for greetings, noise, etc.
   */
  validateUserIntent(userMessage: string): Promise<ValidationResult>

  /**
   * Main schema generation. Sends the full conversation history
   * plus a new user message, returns the AI's JSON schema response
   * and the updated history.
   */
  sendUserMessage(
    history: ChatMessage[],
    userMessage: string,
  ): Promise<SendMessageResult>

  /**
   * Convert the app's internal Message[] format into the
   * provider-agnostic ChatMessage[] format for history replay.
   */
  normalizeChat(messages: Message[]): Promise<ChatMessage[]>

  /**
   * Compare two schema versions and produce a human-readable summary
   * of what changed.
   */
  compareJsonSchemas(oldJson: string, newJson: string): Promise<CompareResult>

  /**
   * Generate an executable database script (SQL DDL or MongoDB Shell)
   * from a JSON diagram.
   */
  generateDatabaseScriptFromDiagram(
    diagram: string,
    databaseType: 'sql' | 'mongo',
  ): Promise<string>
}
