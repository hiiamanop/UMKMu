import type { Metadata } from "next";
import { Libre_Caslon_Text, Hanken_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const libreCaslon = Libre_Caslon_Text({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: {
    default: 'UMKMu — Toko Online untuk UMKM Indonesia',
    template: '%s | UMKMu',
  },
  description: 'Bangun toko online sendiri dalam 60 detik. AI onboarding, chatbot penjualan, notifikasi WhatsApp otomatis — satu platform untuk brand lokal Indonesia bebas dari ketergantungan marketplace.',
  keywords: ['toko online UMKM', 'web builder UMKM', 'toko digital Indonesia', 'platform e-commerce UMKM', 'chatbot penjualan AI', 'toko online tanpa marketplace'],
  authors: [{ name: 'UMKMu' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://umkmu.site',
    siteName: 'UMKMu',
    title: 'UMKMu — Toko Online untuk UMKM Indonesia',
    description: 'Bangun toko online sendiri dalam 60 detik. AI onboarding, chatbot penjualan, notifikasi WhatsApp otomatis — satu platform untuk brand lokal Indonesia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UMKMu — Toko Online untuk UMKM Indonesia',
    description: 'Bangun toko online sendiri dalam 60 detik. Platform untuk brand lokal Indonesia bebas dari ketergantungan marketplace.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${libreCaslon.variable} ${hankenGrotesk.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
