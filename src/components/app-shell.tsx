'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/sthapati');

    return (
        <div className="flex flex-col min-h-screen">
            {!isAdminPage && <Header />}
            <main className="flex-grow">{children}</main>
            {!isAdminPage && <Footer />}
        </div>
    );
}
