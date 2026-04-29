import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Bebas_Neue } from 'next/font/google';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast'; // Run: npm install react-hot-toast
import NextTopLoader from 'nextjs-toploader'; // Run: npm install nextjs-toploader

// DEDICATED FONT OPTIMIZATION
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

// ADVANCED CINEMATIC METADATA (SEO)
export const metadata: Metadata = {
  title: {
    default: 'OMNIMUX | The Nexus of Cinema',
    template: '%s | OMNIMUX'
  },
  description: 'The ultimate OMSS-powered streaming nexus. Experience high-fidelity cinema, real-time watch parties, and encrypted digital vaults.',
  keywords: ['Streaming', 'Watch Party', 'OMNIMUX', 'Cinema', 'Movies', 'Real-time Sync', 'Nexus'],
  authors: [{ name: 'Omnimux Foundation' }],
  creator: 'Omnimux Core',
  publisher: 'Omnimux Foundation',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'OMNIMUX | Cinematic Nexus',
    description: 'Ultra-high performance movie streaming with real-time room synchronization.',
    url: 'https://omnimux.com',
    siteName: 'OMNIMUX',
    images: [
      {
        url: '/og-image.jpg', // Place an image in your public folder
        width: 1200,
        height: 630,
        alt: 'OMNIMUX Cinematic Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMNIMUX | Dedicated Cinema',
    description: 'Experience movies like never before with OMSS Nexus technology.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#070709',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${bebas.variable}`}>
      <body className="antialiased bg-surface text-white selection:bg-brand selection:text-white font-sans overflow-x-hidden min-h-screen flex flex-col">
        
        {/* DEDICATED CINEMATIC PROGRESS LOADER */}
        <NextTopLoader 
          color="#E50914" 
          initialPosition={0.08} 
          crawlSpeed={200} 
          height={3} 
          crawl={true} 
          showSpinner={false} 
          easing="ease" 
          speed={200} 
          shadow="0 0 15px #E50914,0 0 5px #E50914"
        />

        {/* NEXUS AUTHENTICATION LAYER */}
        <AuthProvider>
          
          {/* SYSTEM NOTIFICATIONS (TOASTER) */}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#101218',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontSize: '14px',
                fontWeight: '600'
              }
            }}
          />

          {/* DEDICATED NAVIGATION NEXUS */}
          <Navbar />

          {/* CORE CONTENT STREAM */}
          <main className="flex-grow relative">
            {/* Global Background Ambient Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            {children}
          </main>

          {/* DEDICATED FOUNDATION FOOTER */}
          <footer className="py-20 border-t border-white/5 bg-black/40 backdrop-blur-md relative z-10">
            <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
              
              {/* Brand Info */}
              <div className="flex flex-col items-center md:items-start gap-4">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="bg-brand p-2 rounded-lg shadow-glow transition-transform group-hover:scale-110">
                    <div className="w-4 h-4 bg-white rounded-sm rotate-45" />
                  </div>
                  <span className="text-3xl font-display font-black tracking-tighter text-white">OMNIMUX</span>
                </div>
                <p className="text-gray-500 text-xs font-mono uppercase tracking-[0.2em] max-w-[250px] leading-relaxed">
                  Dedicated High-Fidelity Cinema Extraction Engine. Engineered for the Foundation.
                </p>
              </div>

              {/* Status Indicator */}
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full text-[10px] font-black text-green-500 uppercase tracking-widest">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  All Systems Operational
                </div>
                <span className="text-gray-600 font-mono text-[10px]">OMSS CORE v4.2.0-STABLE</span>
              </div>

              {/* Legal & Version */}
              <div className="text-center md:text-right">
                <div className="flex justify-center md:justify-end gap-6 mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <a href="#" className="hover:text-brand transition-colors">Privacy</a>
                  <a href="#" className="hover:text-brand transition-colors">Terms</a>
                  <a href="#" className="hover:text-brand transition-colors">Nodes</a>
                </div>
                <p className="text-gray-600 text-[10px] font-medium italic">
                  © 2026 Omnimux Foundation. High Altitude Streaming Technology.
                </p>
              </div>

            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
