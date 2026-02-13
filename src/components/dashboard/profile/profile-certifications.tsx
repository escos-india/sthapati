"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Award, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProfileCertificationsProps {
    user: IUser;
    onUpdate: (data: Partial<IUser>) => Promise<void>;
}

export function ProfileCertifications({ user, onUpdate }: ProfileCertificationsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentCert, setCurrentCert] = useState<any>(null);

    const emptyCert = {
        title: "",
        issuer: "",
        issue_date: "",
        credential_url: "",
    };

    const handleAddNew = () => {
        setCurrentCert({ ...emptyCert });
        setIsEditing(true);
    };

    const handleEdit = (cert: any) => {
        setCurrentCert({
            ...cert,
            issue_date: cert.issue_date ? new Date(cert.issue_date).toISOString().split('T')[0] : "",
        });
        setIsEditing(true);
    };

    const handleDelete = async (certId: string) => {
        if (!confirm("Are you sure you want to delete this certification?")) return;
        const newCerts = (user.certifications || []).filter((c: any) => c._id !== certId);
        await onUpdate({ certifications: newCerts });
    };

    const handleSave = async () => {
        let newCerts = [...(user.certifications || [])];

        const certToSave = {
            ...currentCert,
            issue_date: currentCert.issue_date ? new Date(currentCert.issue_date) : undefined,
        };

        if (currentCert._id) {
            newCerts = newCerts.map((c: any) => c._id === currentCert._id ? certToSave : c);
        } else {
            newCerts.unshift(certToSave);
        }

        await onUpdate({ certifications: newCerts });
        setIsEditing(false);
    };

    return (
        <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold">Certifications</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleAddNew}>
                    <Plus className="w-5 h-5" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {(user.certifications || []).map((cert: any, index: number) => (
                    <div key={cert._id || index} className="flex gap-4 group">
                        <div className="mt-1">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                                <Award className="w-6 h-6 text-slate-500" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{cert.title}</h3>
                                    <p className="text-slate-700 dark:text-slate-300">{cert.issuer}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Issued {formatDate(cert.issue_date)}
                                    </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cert)}>
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDelete(cert._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            {cert.credential_url && (
                                <a
                                    href={cert.credential_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
                                >
                                    Show Credential <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
                {(!user.certifications || user.certifications.length === 0) && (
                    <p className="text-slate-400 italic">No certifications added yet.</p>
                )}

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{currentCert?._id ? "Edit Certification" : "Add Certification"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Name</Label>
                                <Input
                                    id="title"
                                    value={currentCert?.title || ""}
                                    onChange={(e) => setCurrentCert({ ...currentCert, title: e.target.value })}
                                    placeholder="Ex: LEED Accredited Professional"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="issuer">Issuing Organization</Label>
                                <Input
                                    id="issuer"
                                    value={currentCert?.issuer || ""}
                                    onChange={(e) => setCurrentCert({ ...currentCert, issuer: e.target.value })}
                                    placeholder="Ex: U.S. Green Building Council"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Issue Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={currentCert?.issue_date || ""}
                                    onChange={(e) => setCurrentCert({ ...currentCert, issue_date: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="url">Credential URL</Label>
                                <Input
                                    id="url"
                                    value={currentCert?.credential_url || ""}
                                    onChange={(e) => setCurrentCert({ ...currentCert, credential_url: e.target.value })}
                                    placeholder="https://..."
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
