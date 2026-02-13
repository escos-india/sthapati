"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, FolderGit2 } from "lucide-react";

interface ProfileProjectsProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileProjects({ user, onUpdate }: ProfileProjectsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentProject, setCurrentProject] = useState<any>(null);

    const emptyProject = {
        title: "",
        description: "",
        role: "",
        tools: [],
    };

    const handleAddNew = () => {
        setCurrentProject({ ...emptyProject });
        setIsEditing(true);
    };

    const handleEdit = (proj: any) => {
        setCurrentProject({ ...proj });
        setIsEditing(true);
    };

    const handleDelete = async (projId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        const newProjects = (user.projects || []).filter((p: any) => p._id !== projId);
        await onUpdate({ projects: newProjects });
    };

    const handleSave = async () => {
        let newProjects = [...(user.projects || [])];

        // Handle tools as array if it's a string (from input)
        const tools = Array.isArray(currentProject.tools)
            ? currentProject.tools
            : (currentProject.tools || "").split(",").map((t: string) => t.trim()).filter(Boolean);

        const projToSave = {
            ...currentProject,
            tools,
        };

        if (currentProject._id) {
            newProjects = newProjects.map((p: any) => p._id === currentProject._id ? projToSave : p);
        } else {
            newProjects.unshift(projToSave);
        }

        await onUpdate({ projects: newProjects });
        setIsEditing(false);
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Projects</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleAddNew}>
                    <Plus className="w-5 h-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {(user.projects || []).map((proj: any, index: number) => (
                    <div key={proj._id || index} className="flex gap-4 group">
                        <div className="mt-1">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                                <FolderGit2 className="w-6 h-6 text-slate-500" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{proj.title}</h3>
                                    <p className="text-slate-700 dark:text-slate-300">{proj.role}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(proj)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(proj._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            {proj.description && (
                                <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">
                                    {proj.description}
                                </p>
                            )}
                            {proj.tools && proj.tools.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {proj.tools.map((tool: string, i: number) => (
                                        <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {(!user.projects || user.projects.length === 0) && (
                    <p className="text-slate-400 italic">No projects added yet.</p>
                )}

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{currentProject?._id ? "Edit Project" : "Add Project"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Project Title</Label>
                                <Input
                                    id="title"
                                    value={currentProject?.title || ""}
                                    onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                                    placeholder="Ex: Sustainable Housing Complex"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Your Role</Label>
                                <Input
                                    id="role"
                                    value={currentProject?.role || ""}
                                    onChange={(e) => setCurrentProject({ ...currentProject, role: e.target.value })}
                                    placeholder="Ex: Lead Architect"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="tools">Tools Used (comma separated)</Label>
                                <Input
                                    id="tools"
                                    value={Array.isArray(currentProject?.tools) ? currentProject.tools.join(", ") : currentProject?.tools || ""}
                                    onChange={(e) => setCurrentProject({ ...currentProject, tools: e.target.value })}
                                    placeholder="Ex: AutoCAD, Revit, SketchUp"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    value={currentProject?.description || ""}
                                    onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
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
