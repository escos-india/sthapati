'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from '@/components/ui/logo';

const footerSections = [
  {
    title: 'About',
    links: [
      { name: 'Our Mission', href: '/about' },
      { name: 'Leadership', href: '/team' },
      { name: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Navigation',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Dashboard', href: '/admin' },
      { name: 'Settings', href: '/admin/settings' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'API Docs', href: '/docs' },
      { name: 'System Status', href: '/status' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { name: 'GitHub', href: '#' },
      { name: 'Twitter', href: '#' },
      { name: 'LinkedIn', href: '#' },
    ],
  },
];

const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function AdminFooter() {
  return (
    <motion.footer
      className="bg-background border-t mt-auto"
      variants={footerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <motion.div className="col-span-2 md:col-span-1" variants={itemVariants}>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-primary" />
              <span className="font-bold text-lg font-headline">Sthāpati</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              The Master Creator
            </p>
          </motion.div>

          {footerSections.map((section) => (
            <motion.div key={section.title} variants={itemVariants}>
              <h3 className="font-semibold text-foreground mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center"
          variants={itemVariants}
        >
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sthāpati. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
             {/* Add social media icons here if you have them */}
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
