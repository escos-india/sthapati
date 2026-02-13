"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Pencil } from "lucide-react";

interface ProfileAboutProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileAbout({ user, onUpdate }: ProfileAboutProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [bio, setBio] = useState(user.bio || "");

    const handleSave = async () => {
        await onUpdate({ bio });
        setIsEditing(false);
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">About</CardTitle>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setBio(user.bio || "")}>
                            <Pencil className="w-4 h-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit About</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="min-h-[200px]"
                                placeholder="Write about yourself..."
                            />
                            <p className="text-xs text-muted-foreground mt-2 text-right">
                                {bio.length}/2600 characters
                            </p>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {user.bio ? (
                    <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                        {user.bio}
                    </p>
                ) : (
                    <p className="text-slate-400 italic">Add a summary to highlight your personality and work history.</p>
                )}
            </CardContent>
        </Card>
    );
}
