"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { GraduationCap, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";

interface StudentSectionProps {
    certificatesStatus?: string;
    specialization?: string;
    resume?: string;
    onUpdate: (certificatesStatus: string, specialization: string, resume?: string) => void;
}

export function StudentSection({ certificatesStatus, specialization, resume, onUpdate }: StudentSectionProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                onUpdate(certificatesStatus || "", localSpecialization, data.url);
                toast.success("Resume uploaded successfully");
            } else {
                toast.error("Failed to upload resume");
            }
        } catch (error) {
            toast.error("Error uploading resume");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveResume = () => {
        onUpdate(certificatesStatus || "", localSpecialization, "");
        toast.success("Resume removed");
    };

    const [localSpecialization, setLocalSpecialization] = useState(specialization || "");

    // Sync local state if props change (e.g. initial load)
    // We only want to do this if we are not currently editing (not focused), but simpler: 
    // Just sync when prop changes effectively. 
    // UseEffect is risky if it overwrites user typing, but since prop only updates on save success (mostly), 
    // and we delay save, it's safer to just initialize and maybe sync.
    // Actually, simple pattern: 
    // 1. Input value = localState
    // 2. onChange = setLocalState
    // 3. onBlur = onUpdate(..., localState, ...)
    const handleBlur = () => {
        if (localSpecialization !== specialization) {
            onUpdate(certificatesStatus || "", localSpecialization, resume);
        }
    };

    return (
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold">Student Information</CardTitle>
                </div>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-2">
                    Complete your student-specific details
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="certificatesStatus" className="text-sm font-medium">
                        Certificates Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={certificatesStatus || ""}
                        onValueChange={(value) => onUpdate(value, localSpecialization, resume)}
                    >
                        <SelectTrigger id="certificatesStatus" className="rounded-xl">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Pursuing">Pursuing</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-sm font-medium">
                        Specialization <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="specialization"
                        placeholder="e.g., Sustainable Architecture, Urban Design"
                        value={localSpecialization}
                        onChange={(e) => setLocalSpecialization(e.target.value)}
                        onBlur={handleBlur}
                        className="rounded-xl"
                    />
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                        Your area of focus or expertise
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="resume" className="text-sm font-medium">
                        Resume (PDF) <span className="text-red-500">*</span>
                    </Label>
                    {resume ? (
                        <div className="flex items-center gap-2 p-4 border border-slate-200 dark:border-gray-700 rounded-xl bg-slate-50 dark:bg-gray-800">
                            <FileText className="h-5 w-5 text-red-500" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Resume.pdf</p>
                                <a
                                    href={resume}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                                >
                                    View Resume
                                </a>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRemoveResume}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="relative">
                            <Input
                                id="resume"
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                className="w-full rounded-xl border-dashed"
                                onClick={() => document.getElementById("resume")?.click()}
                                disabled={uploading}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? "Uploading..." : "Upload Resume (PDF, Max 5MB)"}
                            </Button>
                        </div>
                    )}
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                        Upload your resume in PDF format
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
