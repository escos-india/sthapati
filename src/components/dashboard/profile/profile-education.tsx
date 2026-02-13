"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProfileEducationProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileEducation({ user, onUpdate }: ProfileEducationProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentEdu, setCurrentEdu] = useState<any>(null);

    const emptyEdu = {
        institution: "",
        degree: "",
        field_of_study: "",
        start_date: "",
        end_date: "",
        current_year: undefined,
        is_current: false,
        duration: "",
    };

    const handleAddNew = () => {
        setCurrentEdu({ ...emptyEdu });
        setIsEditing(true);
    };

    const handleEdit = (edu: any) => {
        setCurrentEdu({
            ...edu,
            start_date: edu.start_date ? new Date(edu.start_date).toISOString().split('T')[0] : "",
            end_date: edu.end_date ? new Date(edu.end_date).toISOString().split('T')[0] : "",
            is_current: edu.is_current || false,
            current_year: edu.current_year,
            duration: edu.duration || "",
        });
        setIsEditing(true);
    };

    const handleDelete = async (eduId: string) => {
        if (!confirm("Are you sure you want to delete this education?")) return;
        const newEducation = (user.education || []).filter((e: any) => e._id !== eduId);
        await onUpdate({ education: newEducation });
    };

    const handleSave = async () => {
        let newEducation = [...(user.education || [])];

        const eduToSave = {
            ...currentEdu,
            start_date: currentEdu.start_date ? new Date(currentEdu.start_date) : undefined,
            end_date: currentEdu.end_date ? new Date(currentEdu.end_date) : undefined,
        };

        if (currentEdu._id) {
            newEducation = newEducation.map((e: any) => e._id === currentEdu._id ? eduToSave : e);
        } else {
            newEducation.unshift(eduToSave);
        }

        await onUpdate({ education: newEducation });
        setIsEditing(false);
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Education</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleAddNew}>
                    <Plus className="w-5 h-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {(user.education || []).map((edu: any, index: number) => (
                    <div key={edu._id || index} className="flex gap-4 group">
                        <div className="mt-1">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-slate-500" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{edu.institution}</h3>
                                    <p className="text-slate-700 dark:text-slate-300">{edu.degree}, {edu.field_of_study}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {formatDate(edu.start_date)} - {edu.is_current ? 'Present' : formatDate(edu.end_date)}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(edu)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(edu._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {(!user.education || user.education.length === 0) && (
                    <p className="text-slate-400 italic">No education added yet.</p>
                )}

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{currentEdu?._id ? "Edit Education" : "Add Education"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="inst">Institution</Label>
                                <Input
                                    id="inst"
                                    value={currentEdu?.institution || ""}
                                    onChange={(e) => setCurrentEdu({ ...currentEdu, institution: e.target.value })}
                                    placeholder="Ex: Harvard University"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="degree">Degree</Label>
                                <Input
                                    id="degree"
                                    value={currentEdu?.degree || ""}
                                    onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                                    placeholder="Ex: Bachelor's"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="field">Field of Study</Label>
                                <Input
                                    id="field"
                                    value={currentEdu?.field_of_study || ""}
                                    onChange={(e) => setCurrentEdu({ ...currentEdu, field_of_study: e.target.value })}
                                    placeholder="Ex: Architecture"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start">Start Date</Label>
                                    <Input
                                        id="start"
                                        type="date"
                                        value={currentEdu?.start_date || ""}
                                        onChange={(e) => setCurrentEdu({ ...currentEdu, start_date: e.target.value })}
                                    />
                                </div>
                                {!currentEdu?.is_current && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="end">End Date</Label>
                                        <Input
                                            id="end"
                                            type="date"
                                            value={currentEdu?.end_date || ""}
                                            onChange={(e) => setCurrentEdu({ ...currentEdu, end_date: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_current"
                                    className="h-4 w-4 rounded border-gray-300"
                                    checked={currentEdu?.is_current || false}
                                    onChange={(e) => setCurrentEdu({
                                        ...currentEdu,
                                        is_current: e.target.checked,
                                        end_date: e.target.checked ? undefined : currentEdu?.end_date,
                                        current_year: e.target.checked ? currentEdu?.current_year : undefined
                                    })}
                                />
                                <Label htmlFor="is_current" className="cursor-pointer">I am currently pursuing this education</Label>
                            </div>

                            {currentEdu?.is_current && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_year">Current Year</Label>
                                        <Input
                                            id="current_year"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={currentEdu?.current_year || ""}
                                            onChange={(e) => setCurrentEdu({ ...currentEdu, current_year: parseInt(e.target.value) || undefined })}
                                            placeholder="Ex: 2"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="duration">Course Duration</Label>
                                        <Input
                                            id="duration"
                                            value={currentEdu?.duration || ""}
                                            onChange={(e) => setCurrentEdu({ ...currentEdu, duration: e.target.value })}
                                            placeholder="Ex: 4 Years"
                                        />
                                    </div>
                                </div>
                            )}
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
