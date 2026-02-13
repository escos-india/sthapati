"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, MapPin, Camera, Award } from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/profile/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/countries";

interface ProfileInfoProps {
    name: string;
    headline: string;
    location: {
        city: string;
        state: string;
        country: string;
        address: string;
    };
    image: string;
    category?: string;
    onImageChange: (url: string) => void;
    onSave: (headline: string, location: any) => void;
}

export function ProfileInfo({ name, headline, location, image, category, onImageChange, onSave }: ProfileInfoProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editHeadline, setEditHeadline] = useState(headline);
    const [editLocation, setEditLocation] = useState(location);

    const handleEditClick = () => {
        setEditHeadline(headline);
        setEditLocation({ ...location });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset local state handled by effect or next open
    };

    const handleSave = () => {
        onSave(editHeadline, editLocation);
        setIsEditing(false);
    };

    const isSaveDisabled = !editHeadline || !editLocation.country || !editLocation.city || !editLocation.address;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-b-lg shadow-sm border-x border-b border-slate-200 dark:border-slate-800 p-6 relative group">

            {/* Edit Icon for the Section */}
            {!isEditing && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleEditClick}
                >
                    <Pencil className="h-5 w-5 text-slate-500" />
                </Button>
            )}

            <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Profile Picture Section */}
                <div className="shrink-0 relative group/pfp z-20">
                    <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-900 bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-md relative">
                        {image ? (
                            <Image
                                src={image}
                                alt="Profile"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-4xl text-slate-400">?</span>
                            </div>
                        )}

                        {/* PFP Edit Overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/pfp:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
                            <ImageUpload
                                onChange={onImageChange}
                                aspect={1}
                                showPreview={false}
                                className="w-full h-full flex items-center justify-center"
                            >
                                <Camera className="h-8 w-8 text-white/90 drop-shadow-md pointer-events-none" />
                            </ImageUpload>
                        </div>
                    </div>
                </div>

                <div className="flex-1 space-y-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{name}</h1>

                    {isEditing ? (
                        <div className="space-y-4 max-w-xl animate-in fade-in slide-in-from-top-1 mt-4">
                            <div className="space-y-1.5">
                                <Label>Headline *</Label>
                                <Input
                                    value={editHeadline}
                                    onChange={(e) => setEditHeadline(e.target.value)}
                                    className="text-base"
                                />
                            </div>



                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label>City *</Label>
                                    <Input
                                        value={editLocation.city}
                                        onChange={(e) => setEditLocation({ ...editLocation, city: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Country *</Label>
                                    <Select
                                        value={editLocation.country}
                                        onValueChange={(value) => setEditLocation({ ...editLocation, country: value })}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRIES.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label>Address *</Label>
                                <Input
                                    value={editLocation.address}
                                    onChange={(e) => setEditLocation({ ...editLocation, address: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleSave} disabled={isSaveDisabled} className="bg-cyan-600 hover:bg-cyan-700 text-white">Save</Button>
                                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-lg text-slate-700 dark:text-slate-300 mt-1">{headline || "Add a headline..."}</p>
                            <div className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-center md:justify-start gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span>
                                    {location.city && location.country
                                        ? `${location.city}, ${location.country}`
                                        : "Add location..."}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
