"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, Award, BookOpen } from "lucide-react";
import type { IUser } from "@/types/user";

interface PublicProfileDetailsProps {
    user: IUser;
}

export function PublicProfileDetails({ user }: PublicProfileDetailsProps) {
    return (
        <div className="space-y-6 mb-8">
            {/* About Section */}
            {user.bio && (
                <Card className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">About</h3>
                        <p className="text-slate-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {user.bio}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Experience Section */}
            {user.experience && user.experience.length > 0 && (
                <Card className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-cyan-500" />
                            Experience
                        </h3>
                        <div className="space-y-6">
                            {user.experience.map((exp: any, index: number) => (
                                <div key={index} className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Briefcase className="w-6 h-6 text-slate-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white">{exp.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-gray-400">{exp.organization} · {exp.type}</p>
                                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                                            {new Date(exp.start_date).getFullYear()} -
                                            {exp.is_current ? ' Present' : ` ${new Date(exp.end_date).getFullYear()}`}
                                        </p>
                                        {exp.description && (
                                            <p className="text-sm text-slate-700 dark:text-gray-300 mt-2 whitespace-pre-wrap">
                                                {exp.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Education Section */}
            {user.education && user.education.length > 0 && (
                <Card className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-green-500" />
                            Education
                        </h3>
                        <div className="space-y-6">
                            {user.education.map((edu: any, index: number) => (
                                <div key={index} className="flex gap-4">
                                    <div className="mt-1">
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                                            <GraduationCap className="w-6 h-6 text-slate-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 dark:text-white">{edu.institution}</h4>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm text-slate-600 dark:text-gray-400">{edu.degree}, {edu.field_of_study}</p>
                                            {edu.current_year && (
                                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                                    Year {edu.current_year}
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">
                                            {new Date(edu.start_date).getFullYear()} - {edu.is_current ? 'Present' : new Date(edu.end_date).getFullYear()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Skills Section */}
            {user.skills && user.skills.length > 0 && (
                <Card className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-500" />
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill: any, index: number) => (
                                <Badge key={index} variant="secondary" className="px-3 py-1 text-sm font-medium">
                                    {skill.name}
                                    {skill.endorsements > 0 && (
                                        <span className="ml-1 text-xs text-slate-500 border-l pl-1 border-slate-300 dark:border-slate-700">
                                            {skill.endorsements}
                                        </span>
                                    )}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
