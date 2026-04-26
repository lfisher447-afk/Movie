
import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata = {
  title: 'Omnimux | Cinematic Streaming',
  description: 'Watch your favorite movies with friends in real-time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-surface text-white selection:bg-brand selection:text-white">
        <Navbar />
        {children}
        <footer className="py-12 border-t border-white/5 bg-surface-light text-center mt-20">
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="bg-brand p-1 rounded-sm"><span className="text-white font-bold text-xs">O</span></div>
                <span className="text-xl font-display font-bold tracking-tighter text-brand">OMNIMUX</span>
            </div>
            <p className="text-gray-500 text-sm">© 2026 Omnimux Foundation. OMSS Core Engine.</p>
        </footer>
      </body>
    </html>
  );
}
