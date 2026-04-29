import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast'; 
import NextTopLoader from 'nextjs-toploader'; 

// DEDICATED FONT OPTIMIZATION (Zero Layout Shift)
// Injects these directly into the CSS Engine
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap' 
});

const bebas = Bebas_Neue({ 
  weight: '400',
  subsets: ['latin'], 
  variable: '--font-display',
  display: 'swap' 
});

// ADVANCED CINEMATIC METADATA (SEO & SOCIAL GRAPH)
export const metadata: Metadata = {
  title: {
    default: 'OMNIMUX | The Nexus of Cinema',
    template: '%s | OMNIMUX'
  },
  description: 'The ultimate OMSS-powered streaming nexus. Experience high-fidelity cinema, real-time watch parties, and encrypted digital vaults.',
  keywords:['Streaming', 'Watch Party', 'OMNIMUX', 'Cinema', 'Movies', 'Real-time Sync', 'Nexus'],
  authors: [{ name: 'Omnimux Foundation' }],
  creator: 'Omnimux Core Engine',
  publisher: 'Omnimux Foundation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
    description: 'Experience high-fidelity cinema and node-based streaming on the Edge.',
  }
};

// DEVICE CONFIGURATION
export const viewport: Viewport = {
  themeColor: '#E50914',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // We apply the Next.js font variables directly to the HTML tag
    <html lang="en" className={`dark scroll-smooth ${inter.variable} ${bebas.variable}`}>
      <body className="antialiased bg-surface text-white">
        
        <AuthProvider>
          {/* HARDWARE ACCELERATED LOADING BAR */}
          <NextTopLoader 
            color="#E50914" 
            height={4} 
            showSpinner={false} 
            shadow="0 0 25px #E50914, 0 0 10px #E50914"
            zIndex={99999}
          />
          
          {/* HIGH-FIDELITY TOAST NOTIFICATIONS */}
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: 'font-sans text-xs font-black tracking-widest uppercase',
              style: { 
                background: '#0F1117', 
                color: '#fff', 
                border: '1px solid rgba(255,255,255,0.08)', 
                borderRadius: '1rem',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.9)'
              }
            }} 
          />
          
          <Navbar />
          
          <main className="min-h-screen relative z-10">{children}</main>
          
          {/* OMNIMUX CLOSING PLATE */}
          <footer className="py-24 border-t border-surface-border bg-[#030304] flex flex-col items-center relative z-10">
            <span className="font-nexus text-4xl text-brand mb-2 tracking-widest drop-shadow-[0_0_15px_rgba(229,9,20,0.5)]">
              OMNIMUX NEXUS
            </span>
            <p className="text-gray-600 text-[9px] font-black tracking-[0.4em] uppercase">Hyperflow Engineering v3.2</p>
          </footer>
        </AuthProvider>

      </body>
    </html>
  );
}
