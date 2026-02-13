"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Plus, X, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/profile/image-upload";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Course {
    _id?: string;
    title: string;
    description: string;
    duration: string;
    price: string;
    media: { url: string }[];
}

interface CourseCatalogProps {
    courses?: Course[];
    onUpdate: (courses: Course[]) => void;
}

export function CourseCatalog({ courses = [], onUpdate }: CourseCatalogProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCourse, setNewCourse] = useState<Course>({
        title: "",
        description: "",
        duration: "",
        price: "",
        media: [],
    });
    const [photoUrl, setPhotoUrl] = useState("");

    const handleAddCourse = () => {
        if (!newCourse.title || !newCourse.description || !newCourse.duration) {
            return;
        }

        onUpdate([...courses, newCourse]);
        setNewCourse({ title: "", description: "", duration: "", price: "", media: [] });
        setIsDialogOpen(false);
    };

    const handleRemoveCourse = (index: number) => {
        onUpdate(courses.filter((_, i) => i !== index));
    };

    const handleAddPhoto = (url: string) => {
        if (url) {
            setNewCourse({
                ...newCourse,
                media: [...newCourse.media, { url }],
            });
        }
    };

    const handleRemovePhoto = (index: number) => {
        setNewCourse({
            ...newCourse,
            media: newCourse.media.filter((_, i) => i !== index),
        });
    };

    return (
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Courses Offered</CardTitle>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                Add courses you provide
                            </p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Course</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Course Title *</Label>
                                    <Input
                                        placeholder="e.g., Advanced Architecture Design"
                                        value={newCourse.title}
                                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description *</Label>
                                    <Textarea
                                        placeholder="Course curriculum and details..."
                                        value={newCourse.description}
                                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                                        className="min-h-[100px]"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Duration *</Label>
                                        <Input
                                            placeholder="e.g., 6 Months"
                                            value={newCourse.duration}
                                            onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Price</Label>
                                        <Input
                                            placeholder="e.g., ₹50,000"
                                            value={newCourse.price}
                                            onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Media (Optional)</Label>
                                    <div className="flex gap-4 overflow-x-auto pb-2 min-h-[100px] items-center">
                                        {newCourse.media.map((item, idx) => (
                                            <div key={idx} className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden group border border-slate-200 dark:border-slate-700">
                                                <img
                                                    src={item.url}
                                                    alt={`Course Media ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemovePhoto(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        <ImageUpload
                                            value={""}
                                            onChange={handleAddPhoto}
                                            label="Add Image"
                                            className="w-24 h-24 shrink-0"
                                            showPreview={false}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                                    onClick={handleAddCourse}
                                    disabled={!newCourse.title || !newCourse.description || !newCourse.duration}
                                >
                                    Add Course
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course, index) => (
                            <Card key={index} className="group relative overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">{course.title}</h4>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">{course.duration}</p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveCourse(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-2 line-clamp-2">{course.description}</p>
                                    <div className="mt-3 text-sm font-medium text-slate-700 dark:text-gray-300">
                                        {course.price}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-gray-400">
                        <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No courses added yet. Click "Add Course" to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
