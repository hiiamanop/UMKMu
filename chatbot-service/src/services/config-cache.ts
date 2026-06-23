import { createClient } from '@supabase/supabase-js'

// Type definitions
export interface TenantConfig {
  id: string
  slug: string
  brand_name: string
  tagline?: string
  description?: string
  category: 'skincare' | 'parfum' | 'fashion' | 'fdb'
  primary_color: string
  secondary_color: string
  accent_color: string
  logo_url?: string
  hero_image_url?: string
  whatsapp_number?: string
  instagram_url?: string
  tokopedia_url?: string
  shopee_url?: string
  chatbot_name: string
  chatbot_persona?: string
  is_active: boolean
  owner_email?: string
}

export interface Product {
  id: string
  tenant_id: string
  created_at: string
  name: string
  description?: string
  price?: number
  image_url?: string
  category_type: 'skincare' | 'parfum' | 'fashion' | 'fdb'
  skincare_data?: Record<string, unknown>
  parfum_data?: Record<string, unknown>
  fashion_data?: Record<string, unknown>
  fdb_data?: Record<string, unknown>
  tokopedia_url?: string
  shopee_url?: string
  sort_order: number
  is_active: boolean
}

// Cache entry structure
interface CacheEntry<T> {
  data: T
  timestamp: number
}

// In-memory caches with TTL (5 minutes)
const tenantConfigCache = new Map<string, CacheEntry<TenantConfig>>()
const productsCache = new Map<string, CacheEntry<Product[]>>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

let supabaseClient: ReturnType<typeof createClient> | null = null

/**
 * Initialize Supabase client (lazy init on first use)
 */
function getSupabaseClient() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required')
    }

    supabaseClient = createClient(url, key)
  }

  return supabaseClient
}

/**
 * Check if a cache entry is still valid (not expired)
 */
function isCacheValid(entry: CacheEntry<unknown>): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL
}

/**
 * Get full tenant configuration (with category)
 * Uses in-memory cache with 5 min TTL, falls back to Supabase query
 *
 * @param tenantSlug - merchant's unique slug
 * @returns TenantConfig or null if not found
 */
export async function getTenantConfig(tenantSlug: string): Promise<TenantConfig | null> {
  const cacheKey = `tenant:${tenantSlug}:config`

  // Check cache
  const cached = tenantConfigCache.get(cacheKey)
  if (cached && isCacheValid(cached)) {
    console.log(`[Config Cache] Hit: ${cacheKey}`)
    return cached.data
  }

  try {
    console.log(`[Config Cache] Miss: ${cacheKey}, querying Supabase...`)
    const client = getSupabaseClient()

    const { data, error } = await client
      .from('tenants')
      .select(
        `id, slug, brand_name, tagline, description, category,
         primary_color, secondary_color, accent_color,
         logo_url, hero_image_url, whatsapp_number, instagram_url,
         tokopedia_url, shopee_url, chatbot_name, chatbot_persona,
         is_active, owner_email`
      )
      .eq('slug', tenantSlug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error(`[Config Cache] Query error for ${cacheKey}:`, error)
      return null
    }

    if (!data) {
      console.log(`[Config Cache] Tenant not found: ${cacheKey}`)
      return null
    }

    const config = data as TenantConfig

    // Cache the result with timestamp
    tenantConfigCache.set(cacheKey, {
      data: config,
      timestamp: Date.now(),
    })
    console.log(`[Config Cache] Stored: ${cacheKey}`)

    return config
  } catch (error) {
    console.error(`[Config Cache] Error fetching tenant config:`, error)
    return null
  }
}

/**
 * Alias for backward compatibility (getChatbotConfig -> getTenantConfig)
 */
export async function getChatbotConfig(tenantSlug: string): Promise<TenantConfig | null> {
  return getTenantConfig(tenantSlug)
}

/**
 * Get active products for a tenant
 * Uses in-memory cache with 5 min TTL, falls back to Supabase query
 * Includes all category-specific fields (skincare_data, parfum_data, etc)
 *
 * @param tenantId - tenant UUID
 * @returns Product[] (sorted by sort_order)
 */
export async function getProducts(tenantId: string): Promise<Product[]> {
  const cacheKey = `tenant:${tenantId}:products`

  // Check cache
  const cached = productsCache.get(cacheKey)
  if (cached && isCacheValid(cached)) {
    console.log(`[Config Cache] Hit: ${cacheKey}`)
    return cached.data
  }

  try {
    console.log(`[Config Cache] Miss: ${cacheKey}, querying Supabase...`)
    const client = getSupabaseClient()

    const { data, error } = await client
      .from('products')
      .select(
        `id, tenant_id, created_at, name, description, price, image_url,
         category_type, skincare_data, parfum_data, fashion_data, fdb_data,
         tokopedia_url, shopee_url, sort_order, is_active`
      )
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error(`[Config Cache] Query error for ${cacheKey}:`, error)
      return []
    }

    if (!data) {
      console.log(`[Config Cache] No products found: ${cacheKey}`)
      return []
    }

    const products = data as Product[]

    // Cache the result with timestamp
    productsCache.set(cacheKey, {
      data: products,
      timestamp: Date.now(),
    })
    console.log(`[Config Cache] Stored: ${cacheKey} (${products.length} products)`)

    return products
  } catch (error) {
    console.error(`[Config Cache] Error fetching products:`, error)
    return []
  }
}

/**
 * Invalidate cache entries for a tenant
 * Clears both tenant config and products cache
 *
 * @param tenantSlug - tenant slug (for config cache)
 * @param tenantId - tenant UUID (for products cache, optional)
 */
export function invalidateCache(tenantSlug: string, tenantId?: string) {
  const configKey = `tenant:${tenantSlug}:config`
  tenantConfigCache.delete(configKey)
  console.log(`[Config Cache] Invalidated: ${configKey}`)

  // If tenant ID provided, also invalidate products cache
  if (tenantId) {
    const productsKey = `tenant:${tenantId}:products`
    productsCache.delete(productsKey)
    console.log(`[Config Cache] Invalidated: ${productsKey}`)
  }
}

/**
 * Clear all cache entries (use cautiously)
 */
export function clearCache() {
  tenantConfigCache.clear()
  productsCache.clear()
  console.log('[Config Cache] All caches cleared')
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats() {
  return {
    tenantConfigCache: {
      size: tenantConfigCache.size,
      keys: Array.from(tenantConfigCache.keys()),
    },
    productsCache: {
      size: productsCache.size,
      keys: Array.from(productsCache.keys()),
    },
    totalSize: tenantConfigCache.size + productsCache.size,
    ttlMinutes: CACHE_TTL / 60000,
  }
}
