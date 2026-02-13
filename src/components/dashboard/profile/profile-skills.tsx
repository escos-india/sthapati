"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileSkillsProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileSkills({ user, onUpdate }: ProfileSkillsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [newSkill, setNewSkill] = useState("");

    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;
        const currentSkills = user.skills || [];
        const newSkills = [...currentSkills, { name: newSkill.trim(), proficiency: "Intermediate", endorsements: 0 }];
        await onUpdate({ skills: newSkills });
        setNewSkill("");
        setIsEditing(false);
    };

    const handleDeleteSkill = async (skillName: string) => {
        const newSkills = (user.skills || []).filter((s: any) => s.name !== skillName);
        await onUpdate({ skills: newSkills });
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Skills</CardTitle>
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                        <DialogHeader>
                            <DialogTitle>Add Skill</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="skill">Skill Name</Label>
                            <Input
                                id="skill"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Ex: Project Management"
                                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddSkill}>Add</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-2">
                    {(user.skills || []).map((skill: any, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-2">
                            {skill.name}
                            <X
                                className="w-3 h-3 cursor-pointer hover:text-red-500"
                                onClick={() => handleDeleteSkill(skill.name)}
                            />
                        </Badge>
                    ))}
                    {(!user.skills || user.skills.length === 0) && (
                        <p className="text-slate-400 italic">No skills added yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
