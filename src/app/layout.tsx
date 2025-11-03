// src/app/layout.tsx (FINAL SIMPLE VERSION)
import './globals.css';
import { Inter } from 'next/font/google';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'The24Fitness - Premium Gym & Fitness Center',
  description: 'Join The24Fitness for premium gym facilities, personal training, and fitness classes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}