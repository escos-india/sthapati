"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User as UserIcon } from 'lucide-react';
import type { Post } from '@/app/lib/data';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function PostCard({ post }: { post: Post }) {
  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Link href={`/community/posts/${post.id}`} className="block h-full">
        <Card className="h-full w-[300px] flex flex-col overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300 border bg-card/80 backdrop-blur-sm cursor-pointer hover:ring-2 hover:ring-primary/20">
          {post.imageUrl && (
            <div className="relative h-[180px] w-full">
              <Image
                src={post.imageUrl}
                alt={post.title || "Community Post Image"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={post.imageHint}
                unoptimized
              />
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground text-sm line-clamp-3">{post.excerpt}</p>
          </CardContent>
          <CardFooter className="flex justify-between items-center text-xs text-muted-foreground pt-4 mt-auto">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{post.author.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{post.date}</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
