
"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Upload, RefreshCw, Image as ImageIcon } from "lucide-react";

export default function LandingImagesPage() {
    const { toast } = useToast();
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchImages = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/landing-images");
            if (!response.ok) throw new Error("Failed to fetch images");
            const data = await response.json();
            setImages(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load images",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        setIsUploading(true);
        try {
            const response = await fetch("/api/admin/landing-images", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to upload image");

            toast({ title: "Success", description: "Image uploaded successfully" });
            fetchImages();
            // Reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload image",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (filename: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            const response = await fetch(`/api/admin/landing-images?filename=${filename}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete image");

            toast({ title: "Success", description: "Image deleted successfully" });
            setImages(prev => prev.filter(img => !img.endsWith(filename)));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete image",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-8 space-y-8 min-h-screen bg-slate-950 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Landing Page Images</h1>
                    <p className="text-slate-400 mt-2">Manage the slideshow images on the homepage.</p>
                </div>
                <Button onClick={fetchImages} variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200">
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Upload New Image</CardTitle>
                    <CardDescription>Supported formats: JPG, PNG, WEBP</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Select Image
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                        />
                        <p className="text-sm text-slate-500">
                            Maximum size: 4MB recommended.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
                    </div>
                ) : images.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        No images found. Upload one to get started.
                    </div>
                ) : (
                    images.map((img, index) => (
                        <Card key={index} className="bg-slate-900 border-slate-800 overflow-hidden group">
                            <div className="relative aspect-video">
                                <img
                                    src={img}
                                    alt={`Slide ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(img.split('/').pop() || '')}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {img.split('/').pop()}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
