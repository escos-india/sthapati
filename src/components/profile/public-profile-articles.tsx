"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageCircle, Share2, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";

import { PostCard, Post } from "@/components/feed/post-card";
import { IUser } from "@/types/user";

interface PublicProfileArticlesProps {
    userId: string;
    currentUser?: IUser | null; // Logged in user (Viewer)
}

export function PublicProfileArticles({ userId, currentUser }: PublicProfileArticlesProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`/api/posts?userId=${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error("Failed to fetch user posts", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [userId]);

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-10 opacity-60">
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
                <p className="text-slate-500 text-sm">No articles published yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Articles</h3>
            {posts.map((post, idx) => (
                <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                >
                    <PostCard
                        post={post}
                        user={currentUser || null}
                        isOwner={currentUser?._id === post.author._id}
                    />
                </motion.div>
            ))}
        </div>
    );
}
