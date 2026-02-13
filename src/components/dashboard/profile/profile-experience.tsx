"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProfileExperienceProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileExperience({ user, onUpdate }: ProfileExperienceProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentExp, setCurrentExp] = useState<any>(null); // Using any for form state flexibility

    const emptyExp = {
        title: "",
        organization: "",
        type: "Full-time",
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
    };

    const handleAddNew = () => {
        setCurrentExp({ ...emptyExp });
        setIsEditing(true);
    };

    const handleEdit = (exp: any) => {
        setCurrentExp({
            ...exp,
            start_date: exp.start_date ? new Date(exp.start_date).toISOString().split('T')[0] : "",
            end_date: exp.end_date ? new Date(exp.end_date).toISOString().split('T')[0] : "",
        });
        setIsEditing(true);
    };

    const handleDelete = async (expId: string) => {
        if (!confirm("Are you sure you want to delete this experience?")) return;
        const newExperience = (user.experience || []).filter((e: any) => e._id !== expId);
        await onUpdate({ experience: newExperience });
    };

    const handleSave = async () => {
        let newExperience = [...(user.experience || [])];

        const expToSave = {
            ...currentExp,
            start_date: currentExp.start_date ? new Date(currentExp.start_date) : undefined,
            end_date: currentExp.is_current ? undefined : (currentExp.end_date ? new Date(currentExp.end_date) : undefined),
        };

        if (currentExp._id) {
            // Update existing
            newExperience = newExperience.map((e: any) => e._id === currentExp._id ? expToSave : e);
        } else {
            // Add new
            newExperience.unshift(expToSave); // Add to top
        }

        await onUpdate({ experience: newExperience });
        setIsEditing(false);
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Experience</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleAddNew}>
                    <Plus className="w-5 h-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {(user.experience || []).map((exp: any, index: number) => (
                    <div key={exp._id || index} className="flex gap-4 group">
                        <div className="mt-1">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-slate-500" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{exp.title}</h3>
                                    <p className="text-slate-700 dark:text-slate-300">{exp.organization} · {exp.type}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {formatDate(exp.start_date)} - {exp.is_current ? "Present" : formatDate(exp.end_date)}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(exp)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(exp._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            {exp.description && (
                                <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">
                                    {exp.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                {(!user.experience || user.experience.length === 0) && (
                    <p className="text-slate-400 italic">No experience added yet.</p>
                )}

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{currentExp?._id ? "Edit Experience" : "Add Experience"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={currentExp?.title || ""}
                                    onChange={(e) => setCurrentExp({ ...currentExp, title: e.target.value })}
                                    placeholder="Ex: Senior Architect"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="org">Organization</Label>
                                    <Input
                                        id="org"
                                        value={currentExp?.organization || ""}
                                        onChange={(e) => setCurrentExp({ ...currentExp, organization: e.target.value })}
                                        placeholder="Ex: Studio X"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Employment Type</Label>
                                    <Input
                                        id="type"
                                        value={currentExp?.type || ""}
                                        onChange={(e) => setCurrentExp({ ...currentExp, type: e.target.value })}
                                        placeholder="Ex: Full-time"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="current"
                                    checked={currentExp?.is_current || false}
                                    onCheckedChange={(checked) => setCurrentExp({ ...currentExp, is_current: checked })}
                                />
                                <Label htmlFor="current">I am currently working in this role</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start">Start Date</Label>
                                    <Input
                                        id="start"
                                        type="date"
                                        value={currentExp?.start_date || ""}
                                        onChange={(e) => setCurrentExp({ ...currentExp, start_date: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end">End Date</Label>
                                    <Input
                                        id="end"
                                        type="date"
                                        value={currentExp?.end_date || ""}
                                        onChange={(e) => setCurrentExp({ ...currentExp, end_date: e.target.value })}
                                        disabled={currentExp?.is_current}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    value={currentExp?.description || ""}
                                    onChange={(e) => setCurrentExp({ ...currentExp, description: e.target.value })}
                                    className="min-h-[100px]"
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
