// app/layout.tsx
import { AuthProvider } from '@/context/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface">
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
