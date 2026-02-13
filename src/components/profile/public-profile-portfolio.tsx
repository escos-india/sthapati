"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Image as ImageIcon,
    Package,
    GraduationCap,
    FileText,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import type { IUser } from "@/types/user";

import { ContactBanner } from "./contact-banner";

interface PublicProfilePortfolioProps {
    user: IUser;
}

export function PublicProfilePortfolio({ user }: PublicProfilePortfolioProps) {
    const router = useRouter();
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [isContactOpen, setIsContactOpen] = useState(false);

    return (
        <div className="space-y-6 mb-8">
            <ContactBanner
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                email={user.email}
                phone={user.phone}
                name={user.name}
            />

            {/* Project Details Modal */}
            <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="items-center text-center">
                        <DialogTitle className="text-2xl font-bold">{selectedProject?.title}</DialogTitle>
                        {selectedProject?.role && (
                            <p className="text-sm text-muted-foreground font-medium">{selectedProject.role}</p>
                        )}
                    </DialogHeader>

                    <div className="space-y-6 mt-4 text-center">
                        {/* Project Media */}
                        {selectedProject?.media && selectedProject.media.length > 0 && (
                            <div className="flex flex-wrap justify-center gap-4">
                                {selectedProject.media.map((media: any, i: number) => (
                                    <div key={i} className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full md:w-[45%] h-64">
                                        <img
                                            src={media.url}
                                            alt={`${selectedProject.title} - ${i + 1}`}
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
                                {selectedProject?.description}
                            </p>
                        </div>

                        {/* Tools */}
                        {selectedProject?.tools && selectedProject.tools.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tools Used</h4>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {selectedProject.tools.map((tool: string, i: number) => (
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

            {/* Student Specialization Section */}
            {user.category === 'Student' && user.specialization && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Specialization</h3>
                                    <p className="text-slate-600 dark:text-gray-400">{user.specialization}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Student Resume Section */}
            {user.category === 'Student' && user.resume && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Professional Resume</h3>
                                        <p className="text-sm text-slate-500 dark:text-gray-400">PDF Document • Ready for applications</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="rounded-xl border-pink-200 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600 dark:text-pink-400"
                                    asChild
                                >
                                    <a href={user.resume} target="_blank" rel="noopener noreferrer">
                                        View Resume
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* My Projects Section */}
            {user.projects && user.projects.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Projects</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                            onClick={() => router.push(`/profile/${user._id}/projects`)}
                        >
                            View All
                        </Button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {user.projects.map((project: any, idx: number) => (
                            <Card
                                key={idx}
                                className="min-w-[280px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                                onClick={() => setSelectedProject(project)}
                            >
                                <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
                                    {project.media && project.media[0] ? (
                                        <img src={project.media[0].url} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                            <ImageIcon className="h-8 w-8 text-slate-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{project.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* My Materials Section (For Material Suppliers) */}
            {user.category === 'Material Supplier' && user.materials && user.materials.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Materials</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                            onClick={() => router.push(`/profile/${user._id}/materials`)}
                        >
                            View All
                        </Button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {user.materials.map((material: any, idx: number) => (
                            <Card
                                key={idx}
                                className="min-w-[280px] w-[300px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col"
                            >
                                <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                                    {material.photos && material.photos[0] ? (
                                        <img src={material.photos[0].url} alt={material.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Package className="h-10 w-10 text-slate-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-orange-500 text-white border-0 shadow-sm text-sm">
                                            {material.price} Rs.
                                        </Badge>
                                    </div>
                                    {material.quantity && (
                                        <div className="absolute bottom-2 left-2">
                                            <Badge variant="secondary" className="backdrop-blur-md bg-white/80 dark:bg-black/60">
                                                In Stock: {material.quantity}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4 flex-1 flex flex-col">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate">{material.name}</h4>
                                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">{material.type}</p>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">{material.description}</p>

                                    <Button className="w-full mt-auto" onClick={() => setIsContactOpen(true)}>
                                        Contact Supplier
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* My Courses Section (For Educational Institutes) */}
            {user.category === 'Educational Institute' && user.courses && user.courses.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Courses Offerings</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                            onClick={() => router.push(`/profile/${user._id}/courses`)}
                        >
                            View All
                        </Button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {user.courses.map((course: any, idx: number) => (
                            <Card
                                key={idx}
                                className="min-w-[280px] w-[300px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col"
                            >
                                <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
                                    {course.media && course.media[0] ? (
                                        <img src={course.media[0].url} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                            <GraduationCap className="h-10 w-10 text-slate-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                    {course.price && (
                                        <div className="absolute top-2 right-2">
                                            <Badge className="bg-blue-600 text-white border-0 shadow-sm">
                                                {course.price}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-4 flex-1 flex flex-col">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{course.title}</h4>
                                    {course.duration && (
                                        <p className="text-xs font-medium text-slate-500 dark:text-gray-500 mb-3 flex items-center gap-1">
                                            Duration: {course.duration}
                                        </p>
                                    )}
                                    <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">{course.description}</p>

                                    <Button variant="outline" className="w-full mt-auto" onClick={() => setIsContactOpen(true)}>
                                        Enquire Now
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
