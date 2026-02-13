"use client";

import React, { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    aspect?: number;
    label?: string;
    className?: string;
    children?: React.ReactNode;
    showPreview?: boolean;
}

export function ImageUpload({ value, onChange, aspect = 1, label = "Upload Image", className, children, showPreview = true }: ImageUploadProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAspectLocked, setIsAspectLocked] = useState(false); // Default to unlocked for freedom
    const [mediaSize, setMediaSize] = useState<{ width: number; height: number } | null>(null);
    const [currentAspect, setCurrentAspect] = useState(aspect);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setOriginalFile(file);
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageSrc(reader.result as string);
                setIsOpen(true);
                // Reset states for new file
                setIsAspectLocked(false);
                setZoom(1);
            });
            reader.readAsDataURL(file);
        }
    };

    const onMediaLoaded = (mediaSize: { width: number, height: number, naturalWidth: number, naturalHeight: number }) => {
        setMediaSize({ width: mediaSize.naturalWidth, height: mediaSize.naturalHeight });
        // Set aspect to natural ratio so crop box fits entire image
        setCurrentAspect(mediaSize.naturalWidth / mediaSize.naturalHeight);
    };

    const handleLockToggle = () => {
        if (isAspectLocked) {
            setIsAspectLocked(false);
            if (mediaSize) {
                setCurrentAspect(mediaSize.width / mediaSize.height);
            }
        } else {
            setIsAspectLocked(true);
            setCurrentAspect(aspect);
        }
    };

    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new window.Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", (error) => reject(error));
            image.setAttribute("crossOrigin", "anonymous");
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: any
    ): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2d context");
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Canvas is empty"));
                    return;
                }
                resolve(blob);
            }, "image/jpeg", 0.95);
        });
    };

    const uploadFile = async (file: File) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            onChange(data.url);
            setIsOpen(false);
            setImageSrc(null);
            setOriginalFile(null);

            if (fileInputRef.current) fileInputRef.current.value = "";

        } catch (error) {
            console.error("Upload error:", error);
            toast({
                title: "Error",
                description: "Failed to upload image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            setIsLoading(true);
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            const file = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" });
            await uploadFile(file);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const handleUseOriginal = async () => {
        if (!originalFile) return;
        await uploadFile(originalFile);
    };

    return (
        <div className={className}>
            <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
                ref={fileInputRef}
            />

            <div
                onClick={() => fileInputRef.current?.click()}
                className={children ? "cursor-pointer w-full h-full" : `relative group bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden cursor-pointer hover:border-cyan-500 transition-colors flex items-center justify-center w-full h-full p-8`}
                style={value && showPreview ? {} : {}}
            >
                {children ? (
                    children
                ) : (
                    value && showPreview ? (
                        <>
                            <Image
                                src={value}
                                alt="Uploaded image"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="secondary" size="sm" className="pointer-events-none">Change</Button>
                                <Button variant="destructive" size="sm" onClick={(e) => {
                                    e.stopPropagation();
                                    onChange("");
                                }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center space-y-2">
                            <div className="bg-slate-200 dark:bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                                <Upload className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                            </div>
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {label}
                            </div>
                            <p className="text-xs text-slate-500">JPG, PNG up to 5MB</p>
                        </div>
                    )
                )}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Adjust Image</DialogTitle>
                    </DialogHeader>

                    {/* Increased height for better visibility */}
                    <div className="relative w-full h-[500px] bg-slate-900 rounded-md overflow-hidden my-4">
                        {imageSrc && (
                            <Cropper
                                image={imageSrc!}
                                crop={crop}
                                zoom={zoom}
                                aspect={currentAspect}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                onMediaLoaded={onMediaLoaded}
                                objectFit="contain" // Ensure whole image is visible
                            />
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <ZoomIn className="h-4 w-4 text-slate-500" />
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(val) => setZoom(val[0])}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Button
                                variant={isAspectLocked ? "secondary" : "outline"}
                                size="sm"
                                onClick={handleLockToggle}
                            >
                                {isAspectLocked ? "Free Crop (Unlock)" : `Force ${aspect === 1 ? 'Square' : 'Fixed Aspect'}`}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={handleUseOriginal} disabled={isLoading} className="mr-auto text-slate-500">
                            Skip Crop (Use Original)
                        </Button>
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
