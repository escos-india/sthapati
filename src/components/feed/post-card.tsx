"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Image as ImageIcon,
    Send,
    MessageCircle,
    Share2,
    MoreHorizontal,
    ThumbsUp,
    Loader2,
    Trash2,
    X,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { IUser } from "@/types/user";
import DOMPurify from "isomorphic-dompurify";

export interface Post {
    _id: string;
    author: {
        _id: string;
        name: string;
        image?: string;
        category: string;
        headline?: string;
    };
    content: string;
    image?: string;
    video?: string;
    likes: string[] | number; // Backwards compatible type
    comments: number;
    shares: number;
    createdAt: string;
    liked?: boolean;
}

interface PostCardProps {
    post: Post;
    user: IUser | null; // Current logged-in user (Viewer), null if guest
    isOwner?: boolean; // Is the viewer the owner of the post? (For delete permissions)
    onDelete?: (postId: string) => void;
    onLikeUpdate?: (postId: string, newLikes: number, liked: boolean) => void;
}

export function PostCard({ post, user, isOwner = false, onDelete, onLikeUpdate }: PostCardProps) {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [replyTo, setReplyTo] = useState<any>(null);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    // Calculate initial state based on data type
    const initialLikesCount = Array.isArray(post.likes) ? post.likes.length : (post.likes || 0);
    const initialLiked = user && Array.isArray(post.likes)
        ? post.likes.some((id: any) => id.toString() === user._id)
        : post.liked;

    // Local state for immediate feedback
    const [localLiked, setLocalLiked] = useState(initialLiked);
    const [localLikesCount, setLocalLikesCount] = useState(initialLikesCount);

    const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
            const res = await fetch(`/api/posts/${post._id}/comments?postId=${post._id}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Failed to fetch comments");
        } finally {
            setIsLoadingComments(false);
        }
    };

    const toggleComments = () => {
        if (!isCommentsOpen) {
            fetchComments();
        }
        setIsCommentsOpen(!isCommentsOpen);
    };

    const handleLike = async () => {
        if (!user) {
            toast.error("Please login to like posts");
            return;
        }

        // Optimistic Update
        const newLiked = !localLiked;
        const newCount = newLiked ? localLikesCount + 1 : localLikesCount - 1;
        setLocalLiked(newLiked);
        setLocalLikesCount(newCount);

        if (onLikeUpdate) {
            onLikeUpdate(post._id, newCount, newLiked);
        }

        try {
            const response = await fetch(`/api/posts`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ postId: post._id, action: 'like' })
            });

            if (!response.ok) {
                throw new Error('Failed to like');
            }

        } catch (e) {
            // Revert
            setLocalLiked(!newLiked);
            setLocalLikesCount(localLikesCount);
            toast.error("Failed to update like");
        }
    };

    const handleCommentSubmit = async () => {
        if (!user) {
            toast.error("Please login to comment");
            return;
        }
        if (!commentText.trim()) return;
        setIsSubmittingComment(true);
        try {
            const res = await fetch(`/api/posts/${post._id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: commentText,
                    parentCommentId: replyTo?._id
                })
            });
            if (res.ok) {
                const newComment = await res.json();
                setComments([...comments, newComment]);
                setCommentText("");
                setReplyTo(null);
                toast.success("Comment added");
            }
        } catch (error) {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleShare = (commentId?: string, content?: string) => {
        const urlToShare = `${window.location.origin}/community/posts/${post._id}`;

        navigator.clipboard.writeText(urlToShare)
            .then(() => toast.success("Link copied to clipboard!"))
            .catch(() => toast.error("Failed to copy link"));
    };

    const topLevelComments = comments.filter(c => !c.parentComment);
    const getReplies = (commentId: string) => comments.filter(c => c.parentComment === commentId);

    return (
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden transition-colors duration-300">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={post.author.image} alt={post.author.name} />
                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                                {post.author.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{post.author.name}</h4>
                            <p className="text-sm text-slate-500 dark:text-gray-400">
                                {post.author.headline || post.author.category} · {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {((isOwner || (user && user.isAdmin)) && onDelete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-slate-400 dark:text-gray-500">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => onDelete(post._id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-700 dark:prose-p:text-gray-300 prose-a:text-cyan-600 dark:prose-a:text-cyan-400"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
                />

                {post.image && (
                    <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-800">
                        <img src={post.image} alt="Post attachment" className="w-full h-auto max-h-[500px] object-contain" />
                    </div>
                )}
                {post.video && (
                    <div className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-gray-800">
                        <video src={post.video} controls className="w-full h-auto max-h-[500px] object-contain" />
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-gray-800">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 ${localLiked ? "text-blue-600 dark:text-blue-400" : "text-slate-600"}`}
                        onClick={handleLike}
                    >
                        <ThumbsUp className={`mr-2 h-4 w-4 ${localLiked ? "fill-current" : ""}`} />
                        {localLikesCount}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`flex-1 ${isCommentsOpen ? "text-blue-600" : "text-slate-600"}`}
                        onClick={toggleComments}
                    >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 text-slate-600" onClick={() => handleShare()}>
                        <Share2 className="mr-2 h-4 w-4" />
                        {post.shares}
                    </Button>
                </div>

                {/* Comments Section */}
                {isCommentsOpen && (
                    <div className="mt-4 space-y-4 border-t border-slate-100 dark:border-gray-800 pt-4 animate-in slide-in-from-top-2">
                        {/* Comment Input */}
                        {user ? (
                            <div className="flex gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.image || undefined} />

                                    <AvatarFallback>{user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    {replyTo && (
                                        <div className="text-xs text-slate-500 mb-1 flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-2 rounded">
                                            <span>Replying to {replyTo.author.name}...</span>
                                            <button onClick={() => setReplyTo(null)}><X className="h-3 w-3" /></button>
                                        </div>
                                    )}
                                    <div className="flex gap-2">
                                        <Textarea
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                                            className="min-h-[40px] h-[40px] py-2 resize-none"
                                        />
                                        <Button size="icon" onClick={handleCommentSubmit} disabled={isSubmittingComment || !commentText.trim()}>
                                            {isSubmittingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg bg-slate-50 dark:bg-gray-800 text-center text-sm text-slate-500">
                                Please <a href="/login" className="text-cyan-600 hover:underline">login</a> to comment.
                            </div>
                        )}

                        {/* Comments List */}
                        {isLoadingComments ? (
                            <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {topLevelComments.length === 0 && <p className="text-center text-sm text-slate-500">No comments yet. Be the first to share your thoughts!</p>}
                                {topLevelComments.map(comment => (
                                    <div key={comment._id} className="space-y-2">
                                        <CommentItem
                                            comment={comment}
                                            isAuthor={comment.author._id === post.author._id}
                                            onReply={() => setReplyTo(comment)}
                                            onShare={() => handleShare(comment._id, comment.content)}
                                        />
                                        {/* Replies */}
                                        <div className="pl-6 space-y-2 border-l-2 border-slate-100 dark:border-slate-800 ml-2">
                                            {getReplies(comment._id).map(reply => (
                                                <CommentItem
                                                    key={reply._id}
                                                    comment={reply}
                                                    isAuthor={reply.author._id === post.author._id}
                                                    onReply={() => setReplyTo(comment)}
                                                    onShare={() => handleShare(reply._id, reply.content)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CommentItem({ comment, isAuthor, onReply, onShare }: { comment: any, isAuthor: boolean, onReply: () => void, onShare: () => void }) {
    return (
        <div className="flex gap-3 text-sm">
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={comment.author.image} />
                <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{comment.author.name}</span>
                    {isAuthor && (
                        <Badge variant="secondary" className="h-5 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            Author
                        </Badge>
                    )}
                    <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 dark:text-gray-300">{comment.content}</p>
                <div className="flex gap-4 pt-1">
                    <button onClick={onReply} className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">Reply</button>
                    <button onClick={onShare} className="text-xs font-medium text-slate-500 hover:text-blue-600 transition-colors">Share</button>
                </div>
            </div>
        </div>
    );
}
