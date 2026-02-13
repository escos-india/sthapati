"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Globe, Linkedin, Twitter, Github, Instagram, Mail } from "lucide-react";

interface ProfileContactProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileContact({ user, onUpdate }: ProfileContactProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [links, setLinks] = useState(user.social_links || {});

    const handleSave = async () => {
        await onUpdate({ social_links: links });
        setIsEditing(false);
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Contact</CardTitle>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setLinks(user.social_links || {})}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Edit Contact Info</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="website">Website</Label>
                                <Input
                                    id="website"
                                    value={links.website || ""}
                                    onChange={(e) => setLinks({ ...links, website: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="linkedin">LinkedIn</Label>
                                <Input
                                    id="linkedin"
                                    value={links.linkedin || ""}
                                    onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
                                    placeholder="Profile URL"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="twitter">Twitter</Label>
                                <Input
                                    id="twitter"
                                    value={links.twitter || ""}
                                    onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                                    placeholder="Profile URL"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                    id="instagram"
                                    value={links.instagram || ""}
                                    onChange={(e) => setLinks({ ...links, instagram: e.target.value })}
                                    placeholder="Profile URL"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="github">GitHub</Label>
                                <Input
                                    id="github"
                                    value={links.github || ""}
                                    onChange={(e) => setLinks({ ...links, github: e.target.value })}
                                    placeholder="Profile URL"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">{user.email}</span>
                </div>
                {user.social_links?.website && (
                    <a href={user.social_links.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline">
                        <Globe className="w-5 h-5" />
                        <span className="text-sm">Website</span>
                    </a>
                )}
                {user.social_links?.linkedin && (
                    <a href={user.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline">
                        <Linkedin className="w-5 h-5" />
                        <span className="text-sm">LinkedIn</span>
                    </a>
                )}
                {user.social_links?.twitter && (
                    <a href={user.social_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline">
                        <Twitter className="w-5 h-5" />
                        <span className="text-sm">Twitter</span>
                    </a>
                )}
                {user.social_links?.instagram && (
                    <a href={user.social_links.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline">
                        <Instagram className="w-5 h-5" />
                        <span className="text-sm">Instagram</span>
                    </a>
                )}
                {user.social_links?.github && (
                    <a href={user.social_links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline">
                        <Github className="w-5 h-5" />
                        <span className="text-sm">GitHub</span>
                    </a>
                )}
            </CardContent>
        </Card>
    );
}
