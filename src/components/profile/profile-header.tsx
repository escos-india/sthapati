"use client";

import { ImageUpload } from "@/components/profile/image-upload";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
    cover_image: string;
    onCoverChange: (url: string) => void;
}

export function ProfileHeader({ cover_image, onCoverChange }: ProfileHeaderProps) {
    return (
        <div className="relative rounded-t-lg overflow-visible bg-white dark:bg-gray-800 shadow-sm border-x border-t border-slate-200 dark:border-slate-800">
            {/* Cover Image Area */}
            <div className="relative h-48 md:h-64 w-full rounded-t-lg overflow-hidden bg-slate-200 dark:bg-slate-800 group">
                {cover_image ? (
                    <Image
                        src={cover_image}
                        alt="Cover"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <p>No cover image</p>
                    </div>
                )}

                {/* Cover Edit Button - Top Right */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ImageUpload
                        onChange={onCoverChange}
                        aspect={4} // Wide aspect for cover
                        showPreview={false}
                        label="Edit background"
                    >
                        <Button variant="secondary" size="sm" className="gap-2 shadow-sm pointer-events-none">
                            <Pencil className="h-3 w-3" />
                            <span className="text-xs font-medium">Edit background</span>
                        </Button>
                    </ImageUpload>
                </div>
            </div>

        </div>
    );
}
