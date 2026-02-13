'use client';

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ThemeProvider } from '@/components/utils/theme-provider';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { AnnouncementWidget } from '@/components/announcement-widget';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin') || pathname.startsWith('/sthapati');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Sthapati - Connect & Build</title>
        <meta name="description" content="The premier professional network for the Architecture, Construction, and Engineering industries." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              {!isAdminPage && <Header />}
              <main className="flex-grow">{children}</main>
              {!isAdminPage && <Footer />}

            </div>
            <Toaster />
            <AnnouncementWidget />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html >
  );
}
