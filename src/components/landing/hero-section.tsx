'use client';

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, Search, Building, Users, Handshake, GraduationCap, HardHat, Briefcase, ClipboardSignature } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchContent } from '@/app/actions/search';
import type { Post, User, Blog } from '@/app/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type SearchResults = {
  posts: Post[];
  users: User[];
  blogs: Blog[];
};

const searchCategories = [
  { name: 'Professionals', icon: <Users />, href: '/professionals' },
  { name: 'Agencies', icon: <Building />, href: '/agencies' },
  { name: 'Builders', icon: <HardHat />, href: '/builders' },
  { name: 'Jobs', icon: <Briefcase />, href: '/jobs' },
  { name: 'Contractors', icon: <ClipboardSignature />, href: '/contractors' },
  { name: 'Material Suppliers', icon: <Handshake />, href: '/material-suppliers' },
  { name: 'Educational Institutes', icon: <GraduationCap />, href: '/educational-institutes' },
  { name: 'Students', icon: <GraduationCap />, href: '/students' },
]

export function HeroSection() {
  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isAiPending, startAiTransition] = useTransition();
  const [results, setResults] = useState<SearchResults>({ posts: [], users: [], blogs: [] });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showPopover, setShowPopover] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textShadow, setTextShadow] = useState('2px 2px 8px rgba(0, 0, 0, 0.7)');

  const heroImageUrl = '/images/hero-background.jpg';

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = heroImageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);

      // Sample a pixel from the center of the image for better accuracy
      const pixelData = context.getImageData(img.width / 2, img.height / 2, 1, 1).data;
      const [r, g, b] = pixelData;

      // Using the YIQ formula to determine brightness
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

      if (yiq >= 128) {
        // Light background
        setTextColor('#111827'); // A dark gray color
        setTextShadow('1px 1px 3px rgba(255, 255, 255, 0.5)');
      } else {
        // Dark background
        setTextColor('#FFFFFF');
        setTextShadow('2px 2px 8px rgba(0, 0, 0, 0.7)');
      }
    };
  }, [heroImageUrl]);

  const handleSearch = useCallback((searchTerm: string) => {
    if (searchTerm.length > 0) {
      setShowPopover(true);
      startTransition(async () => {
        const res = await searchContent(searchTerm);
        setResults(res);
      });
    } else {
      setShowPopover(false);
      setResults({ posts: [], users: [], blogs: [] });
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.length > 1) {
        handleSearch(query);
      } else {
        setShowPopover(false);
        setResults({ posts: [], users: [], blogs: [] });
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, handleSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      e.currentTarget.select();
    }
  };

  const hasResults = results.posts.length > 0 || results.users.length > 0 || results.blogs.length > 0;
  const hasSuggestions = suggestions.length > 0;

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center overflow-hidden" style={{ backgroundImage: `url(${heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative z-20 flex flex-col items-center justify-center h-full pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-4xl flex flex-col items-center"
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold font-headline"
            style={{ color: textColor, textShadow: textShadow }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Connect & Build
          </motion.h1>
          <motion.h2
            className="text-lg md:text-xl font-semibold mb-8 text-balance"
            style={{ color: textColor, textShadow: textShadow, opacity: 0.9 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            The Premier Network for the ACE Industry.
          </motion.h2>

          <Popover open={showPopover && query.length > 1} onOpenChange={setShowPopover}>
            <PopoverTrigger asChild>
              <motion.div
                className="relative flex justify-center w-full"
                onHoverStart={() => setIsExpanded(true)}
                onHoverEnd={() => { if (query === '') setIsExpanded(false) }}
                suppressHydrationWarning
              >
                <motion.div
                  className="relative flex items-center bg-background/90 dark:bg-black/90 border-2 dark:border-white border-black rounded-full shadow-2xl p-2 w-full max-w-2xl"
                  animate={{ width: isExpanded ? '100%' : '56px' }}
                  transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
                  whileHover={{ scale: isExpanded ? 1 : 1.05, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
                    animate={{ width: isExpanded ? '56px' : '100%' }}
                  >
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </motion.div>

                  <Input
                    type="search"
                    placeholder={isExpanded ? 'Search for companies, opportunities, topics...' : ''}
                    className={cn(
                      'pl-12 pr-4 h-14 text-lg border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-foreground rounded-full w-full transition-opacity duration-300',
                      isExpanded ? 'opacity-100' : 'opacity-0'
                    )}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsExpanded(true)}
                    onBlur={() => { if (query === '') setIsExpanded(false) }}
                  />
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: 0.2, type: 'tween', ease: 'easeInOut' } }}
                        exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
                        className="pr-2"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98, y: 1 }}
                      >
                        <Button
                          type="submit"
                          size="lg"
                          className="h-14 w-28 text-base rounded-full shadow-md hover:shadow-lg transition-all"
                        >
                          Search
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] mt-2 max-h-[50vh] overflow-y-auto rounded-xl shadow-2xl border-border bg-background/95 backdrop-blur-sm">
              {(isPending || isAiPending) && (
                <div className="flex items-center justify-center p-4">
                  <Loader className="animate-spin text-primary" />
                </div>
              )}
              {(!isPending && !isAiPending) && (!hasResults && !hasSuggestions) && query.length > 2 && (
                <p className="text-center text-muted-foreground p-4">No results found.</p>
              )}
              {hasSuggestions && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold uppercase text-muted-foreground px-3 py-2">AI Suggestions</h3>
                  <div className="flex flex-wrap gap-2 p-2">
                    {suggestions.map((suggestion, index) => (
                      <Button key={index} variant="outline" size="sm" onClick={() => setQuery(suggestion)} className="text-sm">
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {hasResults && (
                <div className="p-2">
                  {results.posts.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground px-3 py-2">Community Posts</h3>
                      {results.posts.map(post => (
                        <div key={`post-${post.id}`} className="p-3 hover:bg-accent rounded-md cursor-pointer text-sm font-medium">
                          {post.title}
                        </div>
                      ))}
                    </div>
                  )}
                  {results.users.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground px-3 py-2">People</h3>
                      {results.users.map(user => (
                        <div key={`user-${user.id}`} className="p-3 hover:bg-accent rounded-md cursor-pointer text-sm font-medium">
                          {user.name} - <span className="text-muted-foreground font-normal">{user.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.blogs.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground px-3 py-2">Blogs</h3>
                      {results.blogs.map(blog => (
                        <div key={`blog-${blog.id}`} className="p-3 hover:bg-accent rounded-md cursor-pointer text-sm font-medium">
                          {blog.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </PopoverContent>
          </Popover>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            {searchCategories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="shadow-md rounded-full"
              >
                <Button
                  asChild
                  variant="default"
                  className="rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <Link href={category.href}>
                    {category.icon}
                    <span className="font-semibold">{category.name.toUpperCase()}</span>
                  </Link>
                </Button>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
