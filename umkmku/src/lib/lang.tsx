'use client'
import { useState, useEffect } from 'react'

export type Lang = 'id' | 'en'

export function useLang() {
  const [lang, setLangState] = useState<Lang>('id')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'en' || saved === 'id') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  const toggle = () => setLang(lang === 'id' ? 'en' : 'id')

  return { lang, setLang, toggle }
}

export function LangToggle({ lang, toggle }: { lang: Lang; toggle: () => void }) {
  return (
    <button
      onClick={toggle}
      title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
    >
      <img
        src={lang === 'id' ? 'https://flagcdn.com/id.svg' : 'https://flagcdn.com/gb.svg'}
        alt={lang === 'id' ? 'ID' : 'GB'}
        className="w-6 h-6 rounded-full object-cover"
      />
    </button>
  )
}
