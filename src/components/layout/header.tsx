'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LogIn, Menu, UserPlus, X, LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/ui/logo';
import { ThemeToggle } from '@/components/utils/theme-toggle';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [logoClickCount, setLogoClickCount] = React.useState(0);
  const [lastLogoClickTime, setLastLogoClickTime] = React.useState(0);
  const router = useRouter();
  const { data: session } = useSession();

  const handleLogoClick = (e: React.MouseEvent) => {
    const currentTime = new Date().getTime();

    if (currentTime - lastLogoClickTime < 2000) { // 2 seconds threshold
      const newClickCount = logoClickCount + 1;
      setLogoClickCount(newClickCount);

      if (newClickCount === 4) {
        e.preventDefault(); // Prevent the default link navigation
        router.push('/sthapati/admin');
        setLogoClickCount(0); // Reset count after navigation
      }
    } else {
      setLogoClickCount(1); // Reset count if the click is too slow
    }

    setLastLogoClickTime(currentTime);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const AuthButtons = () => {
    if (session) {
      return (
        <Button
          onClick={handleLogout}
          className="bg-red-600 text-white rounded-md transition-all duration-300 ease-in-out hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      );
    }

    return (
      <>
        <Button
          asChild
          className="bg-cyan-500 text-white rounded-md transition-all duration-300 ease-in-out hover:bg-cyan-600 hover:scale-105"
        >
          <Link href="/register">
            <UserPlus className="mr-2 h-4 w-4" />
            Get Started
          </Link>
        </Button>
        <Button
          asChild
          className="bg-cyan-500 text-white rounded-md transition-all duration-300 ease-in-out hover:bg-cyan-600 hover:scale-105"
        >
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="flex h-20 w-full items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2" onClick={handleLogoClick}>
            <Logo />
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl lg:text-3xl font-semibold font-headline">sthāpati</span>
              <span className="text-xs text-muted-foreground -mt-1">The Master Creator</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0 w-full">
                <div className="flex justify-between items-center p-4 border-b">
                  <div onClick={handleLogoClick} className="cursor-pointer">
                    <Logo />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="flex flex-col items-center space-y-3 p-4 mt-8">
                  {session ? (
                    <Button
                      className="w-4/5 bg-red-600 text-white hover:bg-red-700"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  ) : (
                    <>
                      <Button asChild className="w-4/5" onClick={() => setIsMobileMenuOpen(false)}><Link href="/login">Login</Link></Button>
                      <Button asChild className="w-4/5" onClick={() => setIsMobileMenuOpen(false)}><Link href="/register">Get Started</Link></Button>
                    </>
                  )}
                  <div className="pt-4">
                    <ThemeToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
