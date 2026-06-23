export type TenantCategory = 'skincare' | 'parfum' | 'fashion' | 'fdb'
export type OrderPaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export interface Tenant {
  id: string
  slug: string
  created_at: string
  brand_name: string
  tagline: string | null
  description: string | null
  primary_color: string
  secondary_color: string
  accent_color: string
  logo_url: string | null
  hero_image_url: string | null
  whatsapp_number: string | null
  instagram_url: string | null
  tokopedia_url: string | null
  shopee_url: string | null
  chatbot_name: string
  chatbot_persona: string | null
  category: TenantCategory
  is_active: boolean
  owner_email: string | null
  about_image_1_url: string | null
  about_image_2_url: string | null
  cta_image_url: string | null
  footer_image_url: string | null
  page_about_story: string | null
  page_commitments: PageItem[] | null
  page_process_steps: PageItem[] | null
  page_sustainability: PageItem[] | null
  page_stats: PageStat[] | null
  page_about_image_url: string | null
  page_about_story_image_url: string | null
  page_ingredients_title: string | null
  page_ingredients_items: IngredientItem[] | null
  page_ingredients_image_url: string | null
  page_sustainability_image_url: string | null
  page_sustainability_story_image_url: string | null
  page_sustainability_story_title: string | null
  page_sustainability_story_body: string | null
}

export interface IngredientItem { name: string; description: string }

export interface PageItem {
  title: string
  body: string
}

export interface PageStat {
  value: string
  label: string
}

export interface Testimonial {
  id: string
  tenant_id: string
  created_at: string
  author_name: string
  author_title: string | null
  quote: string
  image_1_url: string | null
  image_2_url: string | null
  rating: number
  sort_order: number
  is_active: boolean
}

// Skincare-specific data
export interface SkincareData {
  skin_types?: string[] // ['oily','combination','dry','sensitive','all']
  concerns?: string[] // ['acne','brightening','anti-aging','hydrating','pores']
  ingredients?: string[] // ['niacinamide','vitamin-c','retinol','ceramide']
  usage_step?: string // 'cleanser'|'toner'|'serum'|'moisturizer'|'sunscreen'|'treatment'
}

// Parfum-specific data
export interface ParfumData {
  fragrance_family?: string // 'floral', 'oriental', 'fresh', 'chypre'
  notes_top?: string[]
  notes_middle?: string[]
  notes_base?: string[]
  size?: number // ml
  longevity?: string // 'light', 'moderate', 'long-lasting'
}

// Fashion-specific data
export interface FashionData {
  sizes?: string[] // ['XS', 'S', 'M', 'L', 'XL']
  colors?: string[]
  materials?: string[]
  fit?: string // 'slim', 'regular', 'loose'
  style?: string // 'casual', 'formal', 'sporty'
}

// F&B-specific data
export interface FDBData {
  ingredients?: string[]
  allergens?: string[]
  preparation_time?: number // minutes
  servings?: number
  dietary?: string[] // ['vegan', 'gluten-free', 'halal']
}

export interface Product {
  id: string
  tenant_id: string
  created_at: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  category_type: TenantCategory
  // Legacy skincare fields (kept for backward compatibility)
  skin_types: string[]
  concerns: string[]
  ingredients: string[]
  usage_step: string | null
  // Category-specific JSON fields
  skincare_data: SkincareData | null
  parfum_data: ParfumData | null
  fashion_data: FashionData | null
  fdb_data: FDBData | null
  tokopedia_url: string | null
  shopee_url: string | null
  sort_order: number
  is_active: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  recommended_product_id?: string
}

export interface RecommendedProduct {
  product_id: string
  timestamp: string
}

export interface ChatSession {
  id: string
  tenant_id: string
  customer_id: string | null
  started_at: string
  messages: ChatMessage[]
  recommended_products: RecommendedProduct[]
  session_value: number | null
  ended_at: string | null
}

export interface Customer {
  id: string
  tenant_id: string
  created_at: string
  email: string
  phone: string | null
  name: string | null
  total_orders: number
  total_spent: number // Rupiah
  last_order_at: string | null
  is_active: boolean
}

export interface OrderItem {
  product_id: string
  quantity: number
  price_at_purchase: number // Rupiah
}

export interface Order {
  id: string
  tenant_id: string
  customer_id: string | null
  created_at: string
  customer_email: string
  customer_phone: string | null
  customer_name: string | null
  items: OrderItem[]
  // Pricing breakdown (Rupiah)
  subtotal: number
  ppn: number // 12% VAT
  subtotal_with_ppn: number
  xendit_fee: number // 2.5% of subtotal_with_ppn
  final_price: number // what customer pays
  // Payment
  qris_code: string | null
  qris_image_url: string | null
  payment_status: OrderPaymentStatus
  order_status: OrderStatus
  promo_code: string | null
  discount_amount: number
  notes: string | null
  updated_at: string
}
