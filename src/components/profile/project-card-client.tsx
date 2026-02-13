"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ProjectCardProps {
    project: any;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Card
                className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => setIsOpen(true)}
            >
                <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                    {project.media && project.media[0] ? (
                        <img src={project.media[0].url} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                        <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                            <ImageIcon className="h-10 w-10 text-slate-300 dark:text-gray-600" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate text-lg">{project.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                </CardContent>
            </Card>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="items-center text-center">
                        <DialogTitle className="text-2xl font-bold">{project?.title}</DialogTitle>
                        {project?.role && (
                            <p className="text-sm text-muted-foreground font-medium">{project.role}</p>
                        )}
                    </DialogHeader>

                    <div className="space-y-6 mt-4 text-center">
                        {/* Project Media */}
                        {project?.media && project.media.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-4">
                                {project.media.map((media: any, i: number) => (
                                    <div key={i} className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full md:w-[45%] h-64">
                                        <img
                                            src={media.url}
                                            alt={`${project.title} - ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">About this project</h4>
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-gray-300">
                                {project?.description}
                            </p>
                        </div>

                        {/* Tools */}
                        {project?.tools && project.tools.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tools Used</h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {project.tools.map((tool: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1">
                                            {tool}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
