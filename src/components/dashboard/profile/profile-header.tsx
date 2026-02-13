"use client";

import { useState, useRef } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, MapPin, Pencil, Briefcase } from "lucide-react";
import { uploadFile } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileHeader({ user, onUpdate }: ProfileHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const coverInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: user.name,
        headline: user.headline || "",
        location: {
            city: user.location?.city || "",
            state: user.location?.state || "",
            country: user.location?.country || "",
        },
        work_preference: user.work_preference || "Onsite",
    });

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingCover(true);
        try {
            const url = await uploadFile(file);
            await onUpdate({ cover_image: url });
        } catch (error) {
            console.error("Cover upload failed", error);
        } finally {
            setIsUploadingCover(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        try {
            const url = await uploadFile(file);
            await onUpdate({ image: url });
        } catch (error) {
            console.error("Avatar upload failed", error);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        await onUpdate(formData);
        setIsEditing(false);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden relative group">
            {/* Cover Image */}
            <div className="h-48 md:h-64 bg-slate-200 dark:bg-slate-800 relative">
                {user.cover_image ? (
                    <img
                        src={user.cover_image}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-800 dark:to-slate-700" />
                )}

                <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                >
                    <Camera className="w-4 h-4 mr-2" />
                    {isUploadingCover ? "Uploading..." : "Edit Cover"}
                </Button>
                <input
                    type="file"
                    ref={coverInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleCoverUpload}
                />
            </div>

            <div className="px-6 pb-6 relative">
                {/* Avatar */}
                <div className="absolute -top-16 left-6">
                    <div className="relative group/avatar">
                        <Avatar className="w-32 h-32 border-4 border-white dark:border-slate-900 shadow-md">
                            <AvatarImage src={user.image || undefined} />
                            <AvatarFallback className="text-4xl bg-slate-100 dark:bg-slate-800">
                                {user.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity text-white"
                            onClick={() => avatarInputRef.current?.click()}
                            disabled={isUploadingAvatar}
                        >
                            <Camera className="w-6 h-6" />
                        </button>
                        <input
                            type="file"
                            ref={avatarInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
                    </div>
                </div>

                {/* Edit Profile Button */}
                <div className="flex justify-end pt-4">
                    <Dialog open={isEditing} onOpenChange={setIsEditing}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Edit Intro</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="headline">Headline</Label>
                                    <Input
                                        id="headline"
                                        value={formData.headline}
                                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                        placeholder="Architect | Designer | Visionary"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={formData.location.city}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={formData.location.country}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="work_preference">Work Preference</Label>
                                    <Select
                                        value={formData.work_preference}
                                        onValueChange={(val) => setFormData({ ...formData, work_preference: val as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select preference" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Onsite">Onsite</SelectItem>
                                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                                            <SelectItem value="Remote">Remote</SelectItem>
                                            <SelectItem value="Not Open">Not Open</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleSave}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Info */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                        {user.verification_badges?.organization && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Verified</Badge>
                        )}
                    </div>

                    <p className="text-lg text-slate-600 dark:text-slate-300">
                        {user.headline || "Add a headline to describe your role"}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {user.location?.city && user.location?.country
                                ? `${user.location.city}, ${user.location.country}`
                                : "Add location"}
                        </div>
                        <div className="flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {user.work_preference || "Onsite"}
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 font-medium cursor-pointer hover:underline">
                            Contact info
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

