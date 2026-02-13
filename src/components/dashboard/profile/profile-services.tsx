"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";

interface ProfileServicesProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileServices({ user, onUpdate }: ProfileServicesProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentService, setCurrentService] = useState<any>(null);

    const emptyService = {
        title: "",
        description: "",
        tags: [],
    };

    const handleAddNew = () => {
        setCurrentService({ ...emptyService });
        setIsEditing(true);
    };

    const handleEdit = (svc: any) => {
        setCurrentService({ ...svc });
        setIsEditing(true);
    };

    const handleDelete = async (svcTitle: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        const newServices = (user.services || []).filter((s: any) => s.title !== svcTitle);
        await onUpdate({ services: newServices });
    };

    const handleSave = async () => {
        let newServices = [...(user.services || [])];

        const tags = Array.isArray(currentService.tags)
            ? currentService.tags
            : (currentService.tags || "").split(",").map((t: string) => t.trim()).filter(Boolean);

        const svcToSave = {
            ...currentService,
            tags,
        };

        // Since services don't have IDs in my schema definition (oops, Mongoose adds them but I didn't type them explicitly), 
        // I'll use title as key for now or just index if I had one. 
        // Ideally I should have IDs. I'll assume I'm replacing if title matches or adding new.
        // Actually, let's just replace based on index if I had it, but here I don't.
        // I'll just check if it exists in the array by reference or title.
        // A better way is to filter out the old one and add the new one.

        // Simple logic: if editing, remove old (by title? risky if title changes).
        // Let's just append for new, and for edit, I need to know which one I'm editing.
        // I'll use the object reference from the map loop if possible, but state copy breaks that.
        // I'll just filter by title for now, assuming titles are unique enough or I'll add an ID field to schema later.
        // For now, I'll just add/replace.

        // improved logic: find index
        const index = newServices.findIndex(s => s.title === currentService.originalTitle);
        if (index >= 0) {
            newServices[index] = svcToSave;
        } else {
            newServices.push(svcToSave);
        }

        await onUpdate({ services: newServices });
        setIsEditing(false);
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Services</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleAddNew}>
                    <Plus className="w-5 h-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {(user.services || []).map((svc: any, index: number) => (
                    <div key={index} className="flex gap-4 group border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{svc.title}</h3>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setCurrentService({ ...svc, originalTitle: svc.title }); setIsEditing(true); }}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(svc.title)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <p className="mt-1 text-slate-600 dark:text-slate-300 text-sm">
                                {svc.description}
                            </p>
                            {svc.tags && svc.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {svc.tags.map((tag: string, i: number) => (
                                        <span key={i} className="text-xs text-slate-500 dark:text-slate-400">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {(!user.services || user.services.length === 0) && (
                    <p className="text-slate-400 italic">No services listed.</p>
                )}

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{currentService?.originalTitle ? "Edit Service" : "Add Service"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Service Title</Label>
                                <Input
                                    id="title"
                                    value={currentService?.title || ""}
                                    onChange={(e) => setCurrentService({ ...currentService, title: e.target.value })}
                                    placeholder="Ex: Architectural Design"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    value={currentService?.description || ""}
                                    onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input
                                    id="tags"
                                    value={Array.isArray(currentService?.tags) ? currentService.tags.join(", ") : currentService?.tags || ""}
                                    onChange={(e) => setCurrentService({ ...currentService, tags: e.target.value })}
                                    placeholder="Ex: Residential, Commercial, Interior"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
