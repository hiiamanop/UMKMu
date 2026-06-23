import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getAIModel, validateAIProvider } from '../../src/services/ai-model'

// Mock AI SDK modules
vi.mock('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: vi.fn((config) => {
    return vi.fn((model: string) => ({
      _type: 'openai-compatible',
      name: 'ollama',
      model,
      config,
    }))
  }),
}))

vi.mock('@ai-sdk/anthropic', () => ({
  createAnthropic: vi.fn((config) => {
    return vi.fn((model: string) => ({
      _type: 'anthropic',
      name: 'anthropic',
      model,
      config,
    }))
  }),
}))

describe('AI Model Provider Service', () => {
  beforeEach(() => {
    // Reset all environment variables before each test
    delete process.env.AI_PROVIDER
    delete process.env.OLLAMA_BASE_URL
    delete process.env.OLLAMA_MODEL
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_MODEL

    // Clear all mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.AI_PROVIDER
    delete process.env.OLLAMA_BASE_URL
    delete process.env.OLLAMA_MODEL
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.ANTHROPIC_MODEL
  })

  describe('getAIModel - Ollama Provider', () => {
    it('should return Ollama model instance when AI_PROVIDER is "ollama"', () => {
      process.env.AI_PROVIDER = 'ollama'
      process.env.OLLAMA_BASE_URL = 'http://localhost:11434/v1'
      process.env.OLLAMA_MODEL = 'gemma4:12b'

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model._type).toBe('openai-compatible')
      expect(model.model).toBe('gemma4:12b')
    })

    it('should use default Ollama base URL when not provided', () => {
      process.env.AI_PROVIDER = 'ollama'
      // OLLAMA_BASE_URL not set
      process.env.OLLAMA_MODEL = 'gemma4:12b'

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model._type).toBe('openai-compatible')
      expect(model.config.baseURL).toBe('http://localhost:11434/v1')
    })

    it('should use default Ollama model when not provided', () => {
      process.env.AI_PROVIDER = 'ollama'
      process.env.OLLAMA_BASE_URL = 'http://localhost:11434/v1'
      // OLLAMA_MODEL not set

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model._type).toBe('openai-compatible')
      expect(model.model).toBe('gemma4:12b')
    })

    it('should use custom Ollama base URL and model from env', () => {
      process.env.AI_PROVIDER = 'ollama'
      process.env.OLLAMA_BASE_URL = 'http://custom-host:8080/v1'
      process.env.OLLAMA_MODEL = 'llama2:7b'

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model.config.baseURL).toBe('http://custom-host:8080/v1')
      expect(model.model).toBe('llama2:7b')
    })

    it('should set provider name to "ollama" in createOpenAICompatible config', () => {
      process.env.AI_PROVIDER = 'ollama'

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model.config.name).toBe('ollama')
    })
  })

  describe('getAIModel - Anthropic Provider', () => {
    it('should return Anthropic model instance when AI_PROVIDER is "anthropic"', () => {
      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = 'test-api-key-12345'
      process.env.ANTHROPIC_MODEL = 'claude-sonnet-4-6'

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model._type).toBe('anthropic')
      expect(model.model).toBe('claude-sonnet-4-6')
    })

    it('should use default Anthropic model when not provided', () => {
      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = 'test-api-key'
      // ANTHROPIC_MODEL not set

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model._type).toBe('anthropic')
      expect(model.model).toBe('claude-sonnet-4-6')
    })

    it('should use custom Anthropic model from env', () => {
      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = 'test-api-key'
      process.env.ANTHROPIC_MODEL = 'claude-opus-4'

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model.model).toBe('claude-opus-4')
    })

    it('should pass API key to createAnthropic', () => {
      const apiKey = 'test-api-key-xyz'
      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = apiKey

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model.config.apiKey).toBe(apiKey)
    })
  })

  describe('getAIModel - Default Behavior', () => {
    it('should default to Ollama provider when AI_PROVIDER is not set', () => {
      // AI_PROVIDER not set
      process.env.OLLAMA_BASE_URL = 'http://localhost:11434/v1'
      process.env.OLLAMA_MODEL = 'gemma4:12b'

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model._type).toBe('openai-compatible')
    })

    it('should use all default values when no env variables are set', () => {
      // No AI_PROVIDER, OLLAMA_BASE_URL, or OLLAMA_MODEL set

      const model = getAIModel()

      expect(model).toBeDefined()
      expect(model._type).toBe('openai-compatible')
      expect(model.config.baseURL).toBe('http://localhost:11434/v1')
      expect(model.model).toBe('gemma4:12b')
    })
  })

  describe('getAIModel - Error Handling', () => {
    it('should throw error for unsupported provider', () => {
      process.env.AI_PROVIDER = 'unsupported-provider'

      expect(() => {
        getAIModel()
      }).toThrow('Unsupported AI_PROVIDER: unsupported-provider')
    })

    it('should throw error with clear message for invalid provider name', () => {
      process.env.AI_PROVIDER = 'openai'

      expect(() => {
        getAIModel()
      }).toThrow('Unsupported AI_PROVIDER: openai')
    })
  })

  describe('validateAIProvider', () => {
    it('should return true when Ollama provider is valid', async () => {
      process.env.AI_PROVIDER = 'ollama'
      process.env.OLLAMA_BASE_URL = 'http://localhost:11434/v1'

      const result = await validateAIProvider()

      expect(result).toBe(true)
    })

    it('should return true when Anthropic provider is valid', async () => {
      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = 'test-key'

      const result = await validateAIProvider()

      expect(result).toBe(true)
    })

    it('should return false when provider validation fails', async () => {
      process.env.AI_PROVIDER = 'invalid-provider'

      const result = await validateAIProvider()

      expect(result).toBe(false)
    })

    it('should handle errors gracefully without throwing', async () => {
      process.env.AI_PROVIDER = 'invalid-provider'

      expect(async () => {
        await validateAIProvider()
      }).not.toThrow()
    })
  })

  describe('Provider Switching', () => {
    it('should switch from Ollama to Anthropic correctly', () => {
      // First use Ollama
      process.env.AI_PROVIDER = 'ollama'
      const ollamaModel = getAIModel()
      expect(ollamaModel._type).toBe('openai-compatible')

      // Switch to Anthropic
      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = 'test-key'
      const anthropicModel = getAIModel()
      expect(anthropicModel._type).toBe('anthropic')
    })

    it('should return different model instances for different providers', () => {
      process.env.AI_PROVIDER = 'ollama'
      const model1 = getAIModel()

      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = 'test-key'
      const model2 = getAIModel()

      expect(model1._type).not.toBe(model2._type)
    })
  })

  describe('Environment Variable Isolation', () => {
    it('should not leak Ollama settings to Anthropic provider', () => {
      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = 'test-key'
      process.env.OLLAMA_BASE_URL = 'http://localhost:11434/v1'

      const model = getAIModel()

      expect(model._type).toBe('anthropic')
      expect(model.config.apiKey).toBe('test-key')
    })

    it('should not leak Anthropic settings to Ollama provider', () => {
      process.env.AI_PROVIDER = 'ollama'
      process.env.ANTHROPIC_API_KEY = 'test-key'

      const model = getAIModel()

      expect(model._type).toBe('openai-compatible')
      expect(model.config.apiKey).toBeUndefined()
    })
  })

  describe('Model Configuration', () => {
    it('should correctly pass model name through the provider chain', () => {
      process.env.AI_PROVIDER = 'ollama'
      process.env.OLLAMA_MODEL = 'gemma3:9b'

      const model = getAIModel()

      expect(model.model).toBe('gemma3:9b')
    })

    it('should support various model names', () => {
      const testModels = ['gemma4:12b', 'llama2:7b', 'mistral:latest']

      testModels.forEach((modelName) => {
        process.env.AI_PROVIDER = 'ollama'
        process.env.OLLAMA_MODEL = modelName

        const model = getAIModel()

        expect(model.model).toBe(modelName)
      })
    })

    it('should support various Anthropic models', () => {
      const testModels = [
        'claude-sonnet-4-6',
        'claude-opus-4',
        'claude-haiku-3-5',
      ]

      testModels.forEach((modelName) => {
        process.env.AI_PROVIDER = 'anthropic'
        process.env.ANTHROPIC_API_KEY = 'test-key'
        process.env.ANTHROPIC_MODEL = modelName

        const model = getAIModel()

        expect(model.model).toBe(modelName)
      })
    })
  })

  describe('Console Logging', () => {
    it('should log provider selection for Ollama', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      process.env.AI_PROVIDER = 'ollama'

      getAIModel()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using Ollama provider')
      )

      consoleSpy.mockRestore()
    })

    it('should log model name for Ollama', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      process.env.AI_PROVIDER = 'ollama'
      process.env.OLLAMA_MODEL = 'gemma4:12b'

      getAIModel()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('gemma4:12b')
      )

      consoleSpy.mockRestore()
    })

    it('should log provider selection for Anthropic', () => {
      const consoleSpy = vi.spyOn(console, 'log')
      process.env.AI_PROVIDER = 'anthropic'
      process.env.ANTHROPIC_API_KEY = 'test-key'

      getAIModel()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Using Anthropic provider')
      )

      consoleSpy.mockRestore()
    })

    it('should log error when validation fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error')
      process.env.AI_PROVIDER = 'invalid'

      await validateAIProvider()

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed'),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })
})
