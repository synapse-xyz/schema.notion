import {
  descriptionToJsonDatabasePrompt,
  fromJsonToMongoPrompt,
  fromJsonToSqlPrompt,
  summarizeChangesPrompt,
  validateUserIntentPrompt,
} from '@/lib/prompts'
import type { Message } from '@/types/chat'
import type {
  AIProvider,
  ChatMessage,
  CompareResult,
  SendMessageResult,
  ValidationResult,
} from '../types'

/**
 * Ollama message format (OpenAI-compatible).
 */
interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OllamaChatResponse {
  message: {
    role: string
    content: string
  }
}

/**
 * Map our internal roles to Ollama's OpenAI-compatible roles.
 */
function toOllamaRole(role: 'user' | 'model'): 'user' | 'assistant' {
  return role === 'model' ? 'assistant' : 'user'
}

function fromOllamaRole(role: string): 'user' | 'model' {
  return role === 'user' ? 'user' : 'model'
}

export function createOllamaProvider(): AIProvider {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  const model = process.env.OLLAMA_MODEL || 'llama3.1'

  async function chat(
    systemPrompt: string,
    messages: OllamaMessage[],
    jsonMode = false,
  ): Promise<string> {
    const allMessages: OllamaMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ]

    const body: Record<string, unknown> = {
      model,
      messages: allMessages,
      stream: false,
    }

    if (jsonMode) {
      body.format = 'json'
    }

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Ollama request failed (${response.status}): ${errorText}`,
      )
    }

    const data = (await response.json()) as OllamaChatResponse
    return data.message.content
  }

  /**
   * Helper: convert ChatMessage[] history to OllamaMessage[].
   */
  function historyToOllama(history: ChatMessage[]): OllamaMessage[] {
    return history.map((msg) => ({
      role: toOllamaRole(msg.role),
      content: msg.parts.map((p) => p.text).join('\n'),
    }))
  }

  return {
    name: 'ollama',

    async validateUserIntent(userMessage: string): Promise<ValidationResult> {
      try {
        const text = await chat(
          validateUserIntentPrompt,
          [{ role: 'user', content: userMessage }],
          true,
        )

        const result = JSON.parse(text) as ValidationResult
        return result
      } catch (error) {
        console.error('Ollama validation error:', error)
        return {
          isValid: false,
          message: 'Error al procesar la validación de la solicitud.',
        }
      }
    },

    async sendUserMessage(
      history: ChatMessage[],
      userMessage: string,
    ): Promise<SendMessageResult> {
      const ollamaHistory = historyToOllama(history)
      ollamaHistory.push({ role: 'user', content: userMessage })

      const responseText = await chat(
        descriptionToJsonDatabasePrompt,
        ollamaHistory,
        true,
      )

      // Rebuild updated history with the assistant's response
      const updatedHistory: ChatMessage[] = [
        ...history,
        { role: 'user', parts: [{ text: userMessage }] },
        { role: 'model', parts: [{ text: responseText }] },
      ]

      return { responseText, updatedHistory }
    },

    async normalizeChat(messages: Message[]): Promise<ChatMessage[]> {
      return messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.diagram }],
      }))
    },

    async compareJsonSchemas(
      oldJson: string,
      newJson: string,
    ): Promise<CompareResult> {
      const userContent = `Esquema anterior:\n${oldJson}\n\nEsquema nuevo:\n${JSON.stringify(newJson)}`

      const summary = await chat(
        summarizeChangesPrompt,
        [{ role: 'user', content: userContent }],
        false,
      )

      return {
        summary: summary.trim() || 'No se recibió resumen del modelo.',
        newSchema: {},
      }
    },

    async generateDatabaseScriptFromDiagram(
      diagram: string,
      databaseType: 'sql' | 'mongo',
    ): Promise<string> {
      let systemContext: string
      switch (databaseType) {
        case 'sql':
          systemContext = fromJsonToSqlPrompt
          break
        case 'mongo':
          systemContext = fromJsonToMongoPrompt
          break
        default:
          return 'Invalid database type specified.'
      }

      try {
        const text = await chat(
          systemContext,
          [{ role: 'user', content: diagram }],
          true,
        )

        // Try to parse as JSON with { schema: string } first
        try {
          const parsed = JSON.parse(text)
          if (parsed.schema) return parsed.schema
        } catch {
          // If the model returned raw script instead of JSON, use it directly
        }

        return text
      } catch (error) {
        console.error('Error generating database script:', error)
        return 'Error generating database script'
      }
    },
  }
}
