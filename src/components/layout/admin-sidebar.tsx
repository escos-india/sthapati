'use client';

import { Home, Users, Briefcase, MessageSquare, Shield, Settings, BarChart, CreditCard, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/sthapati/dashboard/control-panel', icon: Home, label: 'Control Panel' },
  { href: '/sthapati/dashboard/user-management', icon: Users, label: 'User Management' },
  { href: '/sthapati/dashboard/subscriptions', icon: CreditCard, label: 'Subscription Management' },
  { href: '/sthapati/dashboard/community-posts', icon: MessageSquare, label: 'Community Posts' },
  { href: '/sthapati/dashboard/announcement', icon: Briefcase, label: 'Announcement' },
  { href: '/sthapati/dashboard/landing-images', icon: ImageIcon, label: 'Landing Images' },
  { href: '/sthapati/dashboard/reporting', icon: BarChart, label: 'Reporting' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col p-4 border-r border-gray-700">
      <div className="mb-8 text-center">
        <Link href="/sthapati/dashboard/control-panel">
          <h1 className="text-2xl font-bold text-primary">Sthāpati</h1>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </Link>
      </div>
      <nav className="flex-grow">
        <ul>
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname.startsWith(href);
            return (
              <li key={href} className="mb-2">
                <Link href={href}>
                  <div
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-primary/20 text-primary' : 'hover:bg-gray-800'}`}>
                    <Icon className="h-5 w-5 mr-3" />
                    <span className="font-medium">{label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} Sthapati. All rights reserved.</p>
      </div>
    </aside>
  );
}
