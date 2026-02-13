'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, LayoutDashboard, Megaphone, BarChart2, CreditCard, Image as ImageIcon } from 'lucide-react';

const sidebarNavLinks = [
  { href: '/sthapati/dashboard/control-panel', label: 'Control Panel', icon: LayoutDashboard },
  { href: '/sthapati/dashboard/user-management', label: 'User Management', icon: Users },
  { href: '/sthapati/dashboard/subscriptions', label: 'Subscription Management', icon: CreditCard },
  { href: '/sthapati/dashboard/community-posts', label: 'Community Posts', icon: Shield },
  { href: '/sthapati/dashboard/announcement', label: 'Announcement', icon: Megaphone },
  { href: '/sthapati/dashboard/landing-images', label: 'Landing Images', icon: ImageIcon },
  { href: '/sthapati/dashboard/reporting', label: 'Reporting', icon: BarChart2 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white transition-colors duration-300">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col transition-colors duration-300">
        <div className="flex items-center mb-12">
          <Shield className="h-10 w-10 text-blue-600 dark:text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
        </div>
        <nav className="flex flex-col space-y-3">
          {sidebarNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                href={link.href}
                key={link.label}
                className={`flex items-center p-3 rounded-lg transition-all duration-200 ${isActive
                  ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-slate-900 dark:hover:text-gray-200'
                  }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500 group-hover:text-slate-600 dark:group-hover:text-gray-300'}`} />
                <span className="font-medium text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-8 lg:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
