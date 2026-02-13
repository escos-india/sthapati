"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";
import type { IUser } from "@/types/user";

export default function ArticlesPage() {
    const router = useRouter();
    const [user, setUser] = useState<IUser | null>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current user
                const userRes = await fetch("/api/user/profile");
                if (!userRes.ok) {
                    router.push("/login");
                    return;
                }
                const userData = await userRes.json();
                setUser(userData);

                // Fetch user's posts
                const postsRes = await fetch(`/api/posts?userId=${userData._id}`);
                if (postsRes.ok) {
                    const postsData = await postsRes.json();
                    setPosts(postsData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleDeletePost = async (postId: string) => {
        try {
            const response = await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
            if (response.ok) {
                setPosts(posts.filter(p => p._id !== postId));
                router.refresh();
            }
        } catch (error) {
            console.error("Error deleting post", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-6 lg:p-10">
                <div className="max-w-4xl mx-auto">
                    <p className="text-center text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-6 lg:p-10">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Articles</h1>
                        <p className="text-slate-500 dark:text-gray-400">Manage and view your published articles</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button asChild>
                        <Link href="/dashboard/articles/new">Create New Article</Link>
                    </Button>
                </div>

                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map((post: any) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                user={user}
                                isOwner={user?._id === post.author._id}
                                onDelete={handleDeletePost}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-gray-400 text-lg">You haven't posted any articles yet.</p>
                        <Button className="mt-4" asChild>
                            <Link href="/dashboard/articles/new">Create Article</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
