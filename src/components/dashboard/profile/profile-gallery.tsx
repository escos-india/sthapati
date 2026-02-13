"use client";

import { useState, useRef } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/utils";

interface ProfileGalleryProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileGallery({ user, onUpdate }: ProfileGalleryProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            const url = await uploadFile(file);

            const newGalleryItem = {
                title: title || file.name,
                url,
                type: 'image' as const,
            };

            const newGallery = [...(user.gallery || []), newGalleryItem];
            await onUpdate({ gallery: newGallery });

            setIsAdding(false);
            setTitle("");
            setFile(null);
        } catch (error) {
            console.error("Gallery upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (index: number) => {
        if (!confirm("Delete this image?")) return;
        const newGallery = [...(user.gallery || [])];
        newGallery.splice(index, 1);
        await onUpdate({ gallery: newGallery });
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Gallery</CardTitle>
                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Add Image</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title (Optional)</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Ex: Project Render"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="file">Image</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Select Image
                                    </Button>
                                    <span className="text-sm text-slate-500 truncate max-w-[200px]">
                                        {file ? file.name : "No file selected"}
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} disabled={!file || isUploading}>
                                {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Upload
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(user.gallery || []).map((item: any, index: number) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                            <img
                                src={item.url}
                                alt={item.title || "Gallery Image"}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDelete(index)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            {item.title && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                                    {item.title}
                                </div>
                            )}
                        </div>
                    ))}
                    {(!user.gallery || user.gallery.length === 0) && (
                        <div className="col-span-full text-center py-8 text-slate-400 italic">
                            No images added yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
