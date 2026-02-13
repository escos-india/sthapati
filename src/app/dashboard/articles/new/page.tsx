"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function NewArticlePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append("file", file);

            try {
                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });
                if (res.ok) {
                    const data = await res.json();
                    setImage(data.url);
                    toast.success("Image uploaded successfully");
                } else {
                    toast.error("Failed to upload image");
                }
            } catch (error) {
                toast.error("Error uploading image");
            }
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error("Please provide both title and content");
            return;
        }

        setIsSubmitting(true);
        try {
            // We'll use the existing /api/posts endpoint, but we might need to adjust it 
            // to handle 'title' if the Post model supports it, or just prepend it to content.
            // For better article support, we should ideally have a title field in Post model.
            // Assuming Post model is: { content, image, ... }
            // We will prepend title as an H1 to the content if there's no title field, 
            // OR if the API supports it.
            // Let's check Post model first, but for now we'll send it as part of body.

            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: `<h1>${title}</h1>\n${content}`, // Prepend title as H1 for now
                    image,
                    type: "article" // Optional: if we want to distinguish
                }),
            });

            if (res.ok) {
                toast.success("Article published successfully!");
                router.push("/dashboard/articles");
                router.refresh();
            } else {
                toast.error("Failed to publish article");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-10 px-4">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/articles">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">Write New Article</h1>
                    <p className="text-muted-foreground">Share your knowledge with the community</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Article Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter a catchy title..."
                            className="text-lg font-medium"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cover-image">Cover Image (Optional)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="cover-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="w-full"
                            />
                            {image && (
                                <div className="h-12 w-12 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                                    <img src={image} alt="Cover" className="h-full w-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Content</Label>
                        <div className="min-h-[400px] border rounded-md">
                            <RichTextEditor
                                value={content}
                                onChange={setContent}
                                placeholder="Start writing your article..."
                                className="h-[400px]"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[150px]">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Publish Article
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
