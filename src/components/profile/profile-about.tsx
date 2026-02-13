"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";

interface ProfileAboutProps {
    bio: string;
    onSave: (bio: string) => void;
}

export function ProfileAbout({ bio, onSave }: ProfileAboutProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editBio, setEditBio] = useState(bio);

    const handleEditClick = () => {
        setEditBio(bio);
        setIsOpen(true);
    };

    const handleSave = () => {
        onSave(editBio);
        setIsOpen(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 mt-4 relative group">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">About</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEditClick}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Pencil className="h-5 w-5 text-slate-500" />
                </Button>
            </div>

            <div className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {bio ? bio : <span className="text-slate-400 italic">Add a summary about yourself...</span>}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit About</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Textarea
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className="h-64 resize-none text-base"
                            placeholder="Tell us about your career, expertise, and what drives you..."
                            maxLength={2600}
                        />
                        <p className="text-xs text-slate-500 text-right">{editBio.length}/2600</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!editBio.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white">Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
