import { Product } from './config-cache'

/**
 * Type for chat messages
 */
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Extract all keywords from chat messages (case-insensitive)
 * Filters out very short words and common stop words
 */
function extractKeywords(messages: ChatMessage[]): string[] {
  const allText = messages.map((m) => m.content).join(' ').toLowerCase()
  // Split by whitespace and common separators, remove empty strings
  const words = allText
    .split(/[\s,;.!?-]+/)
    .filter((word) => word.length >= 3) // Filter out very short words

  // Remove common stop words
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'are', 'you', 'can', 'have', 'from', 'this',
    'that', 'what', 'which', 'want', 'need', 'like', 'love', 'help', 'some',
    'any', 'all', 'but', 'not', 'one', 'two', 'three', 'how', 'why', 'when',
    'where', 'who', 'may', 'should', 'your', 'will', 'would', 'could', 'etc',
  ])

  return words.filter((word) => !stopWords.has(word))
}

/**
 * Check if any keyword matches any item in the target array (case-insensitive)
 * Uses word-boundary aware matching to avoid partial matches
 */
function hasAnyKeywordMatch(keywords: string[], targets: string[]): boolean {
  if (!targets || targets.length === 0) return false
  const lowerTargets = targets.map((t) => t.toLowerCase())

  return keywords.some((kw) => {
    return lowerTargets.some((t) => {
      // Exact match or contains as whole word (word-boundary check)
      return (
        t === kw ||
        t.includes(kw) ||
        kw.includes(t) ||
        // Word-boundary matching: check if keyword is at start, middle, or end
        new RegExp(`\\b${kw}\\b`).test(t) ||
        new RegExp(`\\b${t}\\b`).test(kw)
      )
    })
  })
}

/**
 * Count matching keywords in target array (case-insensitive)
 * Uses word-boundary aware matching to avoid partial matches
 */
function countKeywordMatches(keywords: string[], targets: string[]): number {
  if (!targets || targets.length === 0) return 0
  const lowerTargets = targets.map((t) => t.toLowerCase())
  let count = 0

  for (const target of lowerTargets) {
    for (const keyword of keywords) {
      // Check for match with word boundaries
      const exactMatch = target === keyword
      const targetContainsKeyword =
        target.includes(keyword) && target.length > keyword.length + 2
      const keywordContainsTarget =
        keyword.includes(target) && keyword.length > target.length + 2
      const wordBoundaryMatch =
        new RegExp(`\\b${keyword}\\b`).test(target) ||
        new RegExp(`\\b${target}\\b`).test(keyword)

      if (exactMatch || targetContainsKeyword || keywordContainsTarget || wordBoundaryMatch) {
        count++
        break // Count each target only once
      }
    }
  }

  return count
}

/**
 * Score products for Skincare category
 */
function scoreSkincareProducts(
  products: Product[],
  keywords: string[]
): Map<string, number> {
  const scores = new Map<string, number>()

  for (const product of products) {
    let score = 0
    const skincareData = product.skincare_data as Record<string, any> | undefined

    if (!skincareData) continue

    // Extract skincare attributes
    const skinTypes = skincareData.skin_types as string[] | undefined
    const concerns = skincareData.concerns as string[] | undefined
    const ingredients = skincareData.ingredients as string[] | undefined

    // Skin types match: +50 points
    if (hasAnyKeywordMatch(keywords, skinTypes)) {
      score += 50
    }

    // Concerns match: +30 points per match
    const concernMatches = countKeywordMatches(keywords, concerns)
    score += concernMatches * 30

    // Ingredients mention: +10 points per match
    const ingredientMatches = countKeywordMatches(keywords, ingredients)
    score += ingredientMatches * 10

    if (score > 0) {
      scores.set(product.id, score)
    }
  }

  return scores
}

/**
 * Score products for Parfum category
 */
function scoreParfumProducts(
  products: Product[],
  keywords: string[]
): Map<string, number> {
  const scores = new Map<string, number>()

  for (const product of products) {
    let score = 0
    const parfumData = product.parfum_data as Record<string, any> | undefined

    if (!parfumData) continue

    // Extract parfum attributes
    const fragranceFamily = parfumData.fragrance_family as string[] | undefined
    const notes = parfumData.notes as string[] | undefined

    // Fragrance family match: +60 points
    if (hasAnyKeywordMatch(keywords, fragranceFamily)) {
      score += 60
    }

    // Notes mentions: +15 points per match
    const noteMatches = countKeywordMatches(keywords, notes)
    score += noteMatches * 15

    if (score > 0) {
      scores.set(product.id, score)
    }
  }

  return scores
}

/**
 * Score products for Fashion category
 */
function scoreFashionProducts(
  products: Product[],
  keywords: string[]
): Map<string, number> {
  const scores = new Map<string, number>()

  for (const product of products) {
    let score = 0
    const fashionData = product.fashion_data as Record<string, any> | undefined

    if (!fashionData) continue

    // Extract fashion attributes
    const styles = fashionData.style as string[] | undefined
    const sizes = fashionData.sizes as string[] | undefined

    // Style match: +50 points
    if (hasAnyKeywordMatch(keywords, styles)) {
      score += 50
    }

    // Size match: +30 points
    if (hasAnyKeywordMatch(keywords, sizes)) {
      score += 30
    }

    if (score > 0) {
      scores.set(product.id, score)
    }
  }

  return scores
}

/**
 * Score products for F&B category
 */
function scoreFDBProducts(
  products: Product[],
  keywords: string[]
): Map<string, number> {
  const scores = new Map<string, number>()

  for (const product of products) {
    let score = 0
    const fdbData = product.fdb_data as Record<string, any> | undefined

    if (!fdbData) continue

    // Extract F&B attributes
    const dietary = fdbData.dietary as string[] | undefined
    const ingredients = fdbData.ingredients as string[] | undefined

    // Dietary match: +60 points
    if (hasAnyKeywordMatch(keywords, dietary)) {
      score += 60
    }

    // Ingredients match: +15 points per match
    const ingredientMatches = countKeywordMatches(keywords, ingredients)
    score += ingredientMatches * 15

    if (score > 0) {
      scores.set(product.id, score)
    }
  }

  return scores
}

/**
 * Rank products for recommendation based on category-specific matching logic
 *
 * Takes chat messages, extracts customer preferences/keywords, and scores products
 * based on category-specific attributes. Returns top 2 products sorted by score.
 *
 * Scoring per category:
 * - Skincare: skin_types match (+50), concerns match (+30 each), ingredients (+10 each)
 * - Parfum: fragrance_family match (+60), notes mentions (+15 each)
 * - Fashion: style match (+50), size match (+30)
 * - F&B: dietary match (+60), ingredients match (+15 each)
 *
 * @param products - Array of Product objects to score
 * @param messages - Chat message history
 * @param category - Category type ('skincare' | 'parfum' | 'fashion' | 'fdb')
 * @returns Array of top 2 products sorted by score (highest first)
 */
export function rankProductsForRecommendation(
  products: Product[],
  messages: ChatMessage[],
  category: string
): Product[] {
  // Handle edge case: empty products
  if (!products || products.length === 0) {
    console.log('[Category Matcher] No products to rank')
    return []
  }

  // Extract keywords from all messages
  const keywords = extractKeywords(messages)

  if (keywords.length === 0) {
    console.log('[Category Matcher] No keywords extracted from messages')
    return []
  }

  // Score products based on category
  let scores: Map<string, number>

  switch (category.toLowerCase()) {
    case 'skincare':
      scores = scoreSkincareProducts(products, keywords)
      break
    case 'parfum':
      scores = scoreParfumProducts(products, keywords)
      break
    case 'fashion':
      scores = scoreFashionProducts(products, keywords)
      break
    case 'fdb':
      scores = scoreFDBProducts(products, keywords)
      break
    default:
      console.warn(`[Category Matcher] Unknown category: ${category}`)
      return []
  }

  // Filter products with scores > 0 and sort by score descending
  const rankedProducts = products
    .filter((p) => scores.has(p.id))
    .sort((a, b) => {
      const scoreA = scores.get(a.id) || 0
      const scoreB = scores.get(b.id) || 0
      // Primary sort: score (descending)
      if (scoreB !== scoreA) {
        return scoreB - scoreA
      }
      // Tie-breaker: original order (by sort_order)
      return a.sort_order - b.sort_order
    })

  // Return top 2
  const top2 = rankedProducts.slice(0, 2)

  console.log(
    `[Category Matcher] Ranked ${category} products. Keywords: [${keywords.slice(0, 5).join(', ')}]. Found ${top2.length} matches.`
  )

  return top2
}
