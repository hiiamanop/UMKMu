import { describe, it, expect, vi } from 'vitest'

describe('AI Provider', () => {
  it('uses ollama when AI_PROVIDER is ollama', async () => {
    vi.stubEnv('AI_PROVIDER', 'ollama')
    const { getAIModel } = await import('@/lib/ai/provider')
    const model = getAIModel()
    expect(model).toBeDefined()
    vi.unstubAllEnvs()
  })
})
