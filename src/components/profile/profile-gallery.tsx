"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon, Video } from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/profile/image-upload";

interface GalleryItem {
    url: string;
    type: 'image' | 'video';
    title?: string;
}

interface ProfileGalleryProps {
    gallery: GalleryItem[];
    onUpdate: (gallery: GalleryItem[]) => void;
}

export function ProfileGallery({ gallery, onUpdate }: ProfileGalleryProps) {
    const [isEditing, setIsEditing] = useState(false);

    const handleAdd = (url: string, type: 'image' | 'video') => {
        onUpdate([...gallery, { url, type }]);
    };

    const handleRemove = (index: number) => {
        const newGallery = [...gallery];
        newGallery.splice(index, 1);
        onUpdate(newGallery);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gallery</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Showcase your best work (Images only for now)</p>
                </div>
                <ImageUpload
                    onChange={(url) => handleAdd(url, 'image')}
                    showPreview={false}
                >
                    <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </ImageUpload>
            </div>

            {gallery.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No items yet</p>
                    <p className="text-xs text-slate-400">Upload images to your gallery</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((item, index) => (
                        <div key={index} className="group relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {item.type === 'image' ? (
                                <Image
                                    src={item.url}
                                    alt={item.title || "Gallery Item"}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Video className="h-8 w-8 text-slate-400" />
                                </div>
                            )}

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleRemove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
