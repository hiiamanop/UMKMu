import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createAnthropic } from '@ai-sdk/anthropic'

/**
 * Get AI model based on environment configuration
 * Supports both Ollama (development) and Anthropic Claude (production)
 *
 * Environment Variables:
 * - AI_PROVIDER: 'ollama' (default) or 'anthropic'
 * - OLLAMA_BASE_URL: Default 'http://localhost:11434/v1'
 * - OLLAMA_MODEL: Default 'gemma4:12b'
 * - ANTHROPIC_API_KEY: Required for anthropic provider
 * - ANTHROPIC_MODEL: Default 'claude-sonnet-4-6'
 *
 * @returns Language model instance configured for selected provider
 * @throws Error if provider is unsupported
 */
export function getAIModel(): any {
  const provider = process.env.AI_PROVIDER ?? 'ollama'

  if (provider === 'ollama') {
    console.log('[AI Model] Using Ollama provider')
    const ollama = createOpenAICompatible({
      name: 'ollama',
      baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
    })
    const model = process.env.OLLAMA_MODEL ?? 'gemma4:12b'
    console.log(`[AI Model] Model: ${model}`)
    return ollama(model)
  }

  if (provider === 'anthropic') {
    console.log('[AI Model] Using Anthropic provider')
    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
    const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'
    console.log(`[AI Model] Model: ${model}`)
    return anthropic(model)
  }

  throw new Error(`Unsupported AI_PROVIDER: ${provider}`)
}

/**
 * Validate that AI provider is properly configured
 * Attempts to instantiate the model and returns success/failure status
 *
 * @returns Promise<boolean> true if provider is valid, false otherwise
 */
export async function validateAIProvider(): Promise<boolean> {
  try {
    const model = getAIModel()
    console.log('[AI Model] Provider validated successfully')
    return true
  } catch (error) {
    console.error('[AI Model] Validation failed:', error)
    return false
  }
}
