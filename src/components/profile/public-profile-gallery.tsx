"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, PlayCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface GalleryItem {
    title?: string;
    url: string;
    type: "image" | "video";
}

interface PublicProfileGalleryProps {
    gallery: GalleryItem[];
    userId: string;
}

export function PublicProfileGallery({ gallery, userId }: PublicProfileGalleryProps) {
    const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

    if (!gallery || gallery.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Gallery</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                    asChild
                >
                    <a href={`/profile/${userId}/gallery`}>View All</a>
                </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.slice(0, 6).map((item, index) => (
                    <Card
                        key={index}
                        className="overflow-hidden rounded-2xl border border-slate-200 dark:border-gray-800 cursor-pointer group relative aspect-square shadow-sm hover:shadow-md transition-all"
                        onClick={() => setSelectedItem(item)}
                    >
                        {item.type === "video" ? (
                            <div className="relative w-full h-full bg-black">
                                <video src={item.url} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <PlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full relative">
                                <img src={item.url} alt={item.title || "Gallery Item"} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-slate-800">
                    {selectedItem && (
                        <div className="flex items-center justify-center w-full h-full max-h-[80vh]">
                            {selectedItem.type === "video" ? (
                                <video src={selectedItem.url} controls autoPlay className="max-w-full max-h-full" />
                            ) : (
                                <img src={selectedItem.url} alt={selectedItem.title} className="max-w-full max-h-full object-contain" />
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
