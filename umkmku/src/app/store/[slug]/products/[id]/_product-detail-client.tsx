'use client'

import { useState } from 'react'
import { Plus, Minus, ArrowRight } from 'lucide-react'

interface AccordionItem {
  key: string
  label: string
  content: string
}

interface Props {
  accordions: AccordionItem[]
  marketplaceUrl: string | null
  whatsappNumber: string | null
  productName: string
}

export function ProductDetailClient({ accordions, marketplaceUrl, whatsappNumber, productName }: Props) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <>
      {/* CTA */}
      {marketplaceUrl ? (
        <a
          href={marketplaceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-[var(--color-primary)] text-white text-label-caps tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-opacity mb-10 group"
        >
          BELI SEKARANG
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      ) : whatsappNumber ? (
        <a
          href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Halo, saya tertarik dengan produk ${productName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 bg-[var(--color-primary)] text-white text-label-caps tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-opacity mb-10"
        >
          TANYA VIA WHATSAPP
        </a>
      ) : null}

      {/* Accordion */}
      <div className="border-t border-black/10">
        {accordions.map(({ key, label, content }) => (
          <div key={key} className="border-b border-black/10">
            <button
              onClick={() => setOpen(open === key ? null : key)}
              className="w-full py-4 flex justify-between items-center text-left"
            >
              <span className="text-label-caps">{label}</span>
              {open === key
                ? <Minus size={16} className="text-[var(--color-accent)]/50 shrink-0" />
                : <Plus size={16} className="text-[var(--color-accent)]/50 shrink-0" />
              }
            </button>
            {open === key && (
              <p className="pb-5 text-body-md text-[var(--color-accent)]/70 leading-relaxed italic">
                {content}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
