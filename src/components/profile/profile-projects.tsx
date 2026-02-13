"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { ImageUpload } from "@/components/profile/image-upload";
import Image from "next/image";

// Duplicate of interface to avoid circular deps if needed, but best shared
interface ProfileProject {
    title: string;
    description: string;
    role: string;
    location: string;
    year: string;
    budget_range: string;
    tags: string;
    media: { url: string; type: 'image' | 'video' }[];
}

interface ProfileProjectsProps {
    projects: ProfileProject[];
    onUpdate: (projects: ProfileProject[]) => void;
}

export function ProfileProjects({ projects, onUpdate }: ProfileProjectsProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null); // null means adding new
    const [isOpen, setIsOpen] = useState(false);

    // Internal state for the modal form
    const [formData, setFormData] = useState<ProfileProject>({
        title: "", description: "", role: "", location: "", year: "", budget_range: "", tags: "", media: []
    });

    const openAddModal = () => {
        setEditingIndex(null);
        setFormData({ title: "", description: "", role: "", location: "", year: "", budget_range: "", tags: "", media: [] });
        setIsOpen(true);
    };

    const openEditModal = (index: number) => {
        setEditingIndex(index);
        setFormData({ ...projects[index] }); // Clone to avoid direct mutation
        setIsOpen(true);
    };

    const handleSave = () => {
        const newProjects = [...projects];
        if (editingIndex !== null) {
            newProjects[editingIndex] = formData;
        } else {
            newProjects.push(formData);
        }
        onUpdate(newProjects);
        setIsOpen(false);
    };

    const handleDelete = (index: number) => {
        const newProjects = projects.filter((_, i) => i !== index);
        onUpdate(newProjects);
    };

    const isValid = formData.title && formData.role && formData.description && formData.media.length > 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 mt-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Projects</h2>
                <Button variant="ghost" size="icon" onClick={openAddModal}>
                    <Plus className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </Button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                    <p>Add at least one project to complete your profile.</p>
                    <Button variant="outline" className="mt-4" onClick={openAddModal}>+ Add Project</Button>
                </div>
            ) : (
                <div className="space-y-6">
                    {projects.map((proj, index) => (
                        <div key={index} className="group relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 pb-6 last:pb-0 last:border-0">
                            {/* Actions */}
                            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => openEditModal(index)}>
                                    <Pencil className="h-4 w-4 text-slate-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(index)} className="hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                {proj.media[0] && (
                                    <div className="w-24 h-24 shrink-0 bg-slate-100 rounded-md overflow-hidden relative">
                                        <Image src={proj.media[0].url} alt="" fill className="object-cover" unoptimized />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{proj.title}</h3>
                                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{proj.role}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {[proj.year, proj.location, proj.budget_range].filter(Boolean).join(" • ")}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{proj.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD / EDIT MODAL */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingIndex !== null ? "Edit Project" : "Add Project"}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Project Details</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role *</Label>
                                    <Input placeholder="e.g. Lead Architect" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Location</Label>
                                    <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Input value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Budget</Label>
                                    <Input value={formData.budget_range} onChange={e => setFormData({ ...formData, budget_range: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description *</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="h-32"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Media (Images/Videos) *</Label>
                                <div className="flex gap-4 overflow-x-auto pb-2 min-h-[100px] items-center">
                                    {formData.media.map((m, i) => (
                                        <div key={i} className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden group">
                                            <Image src={m.url} alt="" fill className="object-cover" unoptimized />
                                            <button
                                                className="absolute top-1 right-1 bg-red-600/80 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    const newMedia = [...formData.media];
                                                    newMedia.splice(i, 1);
                                                    setFormData({ ...formData, media: newMedia });
                                                }}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <ImageUpload
                                        onChange={(url) => setFormData(d => ({ ...d, media: [...d.media, { url, type: 'image' }] }))}
                                        label="Add Media"
                                        className="w-24 h-24 shrink-0"
                                    />
                                </div>
                                <p className="text-xs text-slate-500">At least 1 image required.</p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={!isValid} className="bg-cyan-600 hover:bg-cyan-700 text-white">Save Project</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
