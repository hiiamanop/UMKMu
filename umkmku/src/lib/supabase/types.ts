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
  is_active: boolean
  owner_email: string | null
}

export interface Product {
  id: string
  tenant_id: string
  created_at: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  skin_types: string[]
  concerns: string[]
  ingredients: string[]
  usage_step: string | null
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

export interface ChatSession {
  id: string
  tenant_id: string
  started_at: string
  messages: ChatMessage[]
  ended_at: string | null
}
