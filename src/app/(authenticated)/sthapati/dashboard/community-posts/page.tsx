'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { previousPosts as initialPosts, type CommunityPost } from '@/lib/community-posts-mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, RefreshCcw } from 'lucide-react';
import { ImageUpload } from "@/components/profile/image-upload";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define Post Type
interface Post {
  _id: string;
  title: string;
  image: string;
  content: string;
  tags?: string[];
  createdAt: string;
  isDeleted?: boolean;
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from 'sonner';

// ... other imports

const postSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  image: z.string().min(1, { message: "Cover image is required." }),
  tags: z.string().optional(),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
});

export default function CommunityPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/posts', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      image: "",
      tags: "",
      content: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof postSchema>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          content: values.content,
          image: values.image,
          tags: values.tags ? values.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : []
        })
      });

      if (res.ok) {
        toast.success("Post published successfully!");
        form.reset();
        fetchPosts(); // Refresh list
      } else {
        toast.error('Failed to publish post');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error publishing post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Post moved to trash");
        setPosts(prev => prev.map(p => p._id === id ? { ...p, isDeleted: true } : p));
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("Error deleting post");
    }
  };

  const handleRestore = async (id: string, type: 'post') => {
    try {
      const res = await fetch(`/api/admin/posts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDeleted: false })
      });
      if (res.ok) {
        toast.success("Post restored to active");
        setPosts(prev => prev.map(p => p._id === id ? { ...p, isDeleted: false } : p));
      } else {
        toast.error("Failed to restore post");
      }
    } catch (error) {
      toast.error("Error restoring post");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this post? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/posts?id=${id}&permanent=true`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Post permanently deleted");
        setPosts(prev => prev.filter(p => p._id !== id));
      } else {
        toast.error("Failed to delete post permanently");
      }
    } catch (error) {
      toast.error("Error deleting post");
    }
  };

  const watchedContent = form.watch("content");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full"
      suppressHydrationWarning
    >
      <h1 className="text-4xl font-extrabold tracking-tight mb-8">Community Posts</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Create a New Post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter post title"
                            className="bg-gray-900/70 border-gray-700 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Image</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            label="Upload Post Image"
                            className="w-full"
                            aspect={16 / 9}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tags (comma-separated, e.g. Design, Build)"
                            className="bg-gray-900/70 border-gray-700 focus:ring-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem className="h-full">
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Write your post content..."
                              className="h-[600px] mb-4"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4">
                    <Button type="button" variant="outline">Save as Draft</Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Publishing...' : 'Publish'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg h-full max-h-[800px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Manage Posts</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              <Tabs defaultValue="active" className="w-full flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="trash">Trash</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {posts.filter(p => !p.isDeleted).length > 0 ? (
                    posts.filter(p => !p.isDeleted).map((post) => (
                      <div key={post._id} className="p-4 rounded-lg bg-gray-900/50 border border-gray-700/30 space-y-3 group">
                        {post.image && (
                          <div className="h-32 w-full rounded-md overflow-hidden mb-2">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <h4 className="font-semibold text-gray-200 leading-tight">{post.title}</h4>
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs px-2 py-0 h-5">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => handleDelete(post._id)}
                            title="Move to Trash"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No active posts.</p>
                  )}
                </TabsContent>

                <TabsContent value="trash" className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {posts.filter(p => p.isDeleted).length > 0 ? (
                    posts.filter(p => p.isDeleted).map((post) => (
                      <div key={post._id} className="p-4 rounded-lg bg-red-900/10 border border-red-900/30 space-y-3 opacity-75">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-gray-400 leading-tight line-through">{post.title}</h4>
                          <Badge variant="destructive" className="h-5">Deleted</Badge>
                        </div>
                        <div className="flex justify-between items-center pt-2 mt-2">
                          <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                              onClick={() => handleRestore(post._id, 'post')}
                              title="Restore"
                            >
                              <RefreshCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-400 hover:bg-red-900/40"
                              onClick={() => handlePermanentDelete(post._id)}
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">Trash is empty.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
