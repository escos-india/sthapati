"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, User as UserIcon, ArrowLeft, Tag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from "isomorphic-dompurify";

type Post = {
    _id: string;
    title: string;
    content: string;
    image?: string;
    tags?: string[];
    author: {
        name: string;
        image?: string;
    };
    createdAt: string;
};

export default function SinglePostPage() {
    const params = useParams();
    const id = params?.id as string;
    const [post, setPost] = useState<Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            try {
                const res = await fetch(`/api/posts/public/${id}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Post not found");
                    throw new Error("Failed to load post");
                }
                const data = await res.json();
                setPost(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPost();
    }, [id]);

    if (isLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="container max-w-4xl mx-auto py-24 px-4 text-center">
                <h2 className="text-2xl font-bold mb-4">Post not found</h2>
                <p className="text-muted-foreground mb-8">{error || "The post looking for does not exist."}</p>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        );
    }

    return (
        <article className="min-h-screen bg-background">
            {/* Header Image */}
            {post.image && (
                <div className="relative w-full h-[400px] md:h-[500px]">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                </div>
            )}

            <div className="container max-w-4xl mx-auto px-4 py-8 relative -mt-20 md:-mt-32 z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Button variant="ghost" asChild className="mb-6 hover:bg-background/20 text-foreground">
                        <Link href="/#community" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Community
                        </Link>
                    </Button>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-foreground drop-shadow-sm">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-foreground/80 mb-8 p-4 bg-background/50 backdrop-blur-md rounded-lg border border-border/50">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={post.author.image} />
                                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-2 ml-auto">
                                {post.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                        <Tag className="h-3 w-3 mr-1" /> {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div
                        className="prose prose-lg dark:prose-invert max-w-none rich-text-content"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                    />
                </motion.div>
            </div>
        </article>
    );
}
