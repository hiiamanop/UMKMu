import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { LanguageModel } from 'ai'

export function getAIModel(): LanguageModel {
  const provider = process.env.AI_PROVIDER ?? 'ollama'

  if (provider === 'ollama') {
    const ollama = createOpenAICompatible({
      name: 'ollama',
      baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
    })
    return ollama(process.env.OLLAMA_MODEL ?? 'gemma4:12b')
  }

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
  return anthropic(process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6')
}
