// app/layout.tsx — SERVER COMPONENT (no "use client")
// Metadata & viewport can only be exported from server components in Next.js 14+.

import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Bebas_Neue, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';
import { ClientShell } from '@/components/ClientShell';
import { Navbar } from '@/components/Navbar';

// ─── FONT SYSTEM ──────────────────────────────────────────────────────────────
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});
const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// ─── METADATA ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: { default: 'OMNIMUX | The Nexus of Cinema', template: '%s | OMNIMUX' },
  description:
    'The ultimate OMSS-powered streaming nexus. Experience 4K HDR cinema, real-time encrypted watch parties, and neural-adaptive vaults.',
  keywords: [
    'Streaming', 'Watch Party', 'OMNIMUX', 'Cinema', 'Movies',
    '4K', 'HDR', 'Real-time Sync', 'Nexus',
  ],
  authors: [{ name: 'Omnimux Foundation' }],
  creator: 'Omnimux Core Engine v4',
  openGraph: {
    title: 'OMNIMUX | The Nexus of Cinema',
    description: 'Highly encrypted streaming node for movies and real-time watch parties.',
    url: 'https://omnimux.com',
    siteName: 'OMNIMUX NEXUS',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMNIMUX | The Nexus of Cinema',
    description: 'Experience 4K HDR cinema and node-based streaming on the Edge.',
  },
};

// ─── VIEWPORT ─────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: '#E50914',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// ─── ROOT LAYOUT (server) ─────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark scroll-smooth ${inter.variable} ${bebas.variable} ${jetbrains.variable}`}
    >
      <head>
        <style>{`
          @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          [data-theme="amoled"] { --bg-surface: #000000; }
          [data-theme="midnight"] { --bg-surface: #050510; --accent: #4f46e5; }
        `}</style>
      </head>
      <body className="antialiased bg-surface text-white selection:bg-brand/30 selection:text-white">
        <AuthProvider>
          <NextTopLoader
            color="#E50914"
            height={3}
            showSpinner={false}
            shadow="0 0 30px #E50914, 0 0 15px #E50914"
            zIndex={99998}
          />
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'font-mono text-[10px] font-black tracking-widest uppercase',
              style: {
                background: '#0a0a0f',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '1rem',
                boxShadow: '0 20px 60px -10px rgba(0,0,0,0.95), 0 0 40px rgba(229,9,20,0.05)',
                padding: '12px 20px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: '#000' } },
              error: { iconTheme: { primary: '#E50914', secondary: '#000' } },
            }}
          />
          {/* ClientShell owns all useState/useEffect/context client logic */}
          <ClientShell>
            <Navbar />
            <main className="min-h-screen relative z-10">{children}</main>
          </ClientShell>
        </AuthProvider>
      </body>
    </html>
  );
}
