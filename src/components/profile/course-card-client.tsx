"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
    course: any;
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <Card
            className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col overflow-hidden"
        >
            <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
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
            </CardContent>
        </Card>
    );
}
