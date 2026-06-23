import { z } from 'zod'

export const SkincareDataSchema = z.object({
  skin_types: z.array(
    z.enum(['oily', 'dry', 'combination', 'sensitive', 'all'])
  ),
  concerns: z.array(
    z.enum(['acne', 'brightening', 'anti-aging', 'hydrating', 'pores', 'sensitive'])
  ),
  ingredients: z.array(z.string()),
  usage_step: z.enum(['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment']),
})

export type SkincareData = z.infer<typeof SkincareDataSchema>

export const skincareSystemPrompt = `Kamu adalah skincare advisor untuk {brand_name}.

Tentang brand:
{description}

Produk tersedia:
{products_json}

Panduan rekomendasi:
1. Tanyakan skin type jika belum disebutkan
2. Tanyakan concern utama (acne, brightening, anti-aging, hydrating, pores, atau sensitive)
3. Rekomendasikan maksimal 2 produk yang paling relevan
4. Jelaskan MENGAPA produk itu cocok untuk mereka
5. Gunakan Bahasa Indonesia yang ramah dan profesional
6. Jangan buat klaim medis
7. Jangan sebut kompetitor
8. Jika customer tertarik dengan satu produk, akhiri responsmu dengan: [[RECOMMEND:product_uuid]]
9. Jika tidak ada produk yang cocok, sarankan WhatsApp untuk konsultasi`
