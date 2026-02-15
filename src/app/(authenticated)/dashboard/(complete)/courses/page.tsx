'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GraduationCap, Video } from 'lucide-react';
import { ImageUpload } from "@/components/profile/image-upload";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from 'sonner';

interface Course {
    _id: string;
    title: string;
    description: string;
    duration: string;
    price: string;
    media: { url: string }[];
}

const courseSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters." }),
    description: z.string().min(10, { message: "Description needed (min 10 chars)." }),
    duration: z.string().optional(),
    price: z.string().optional(),
    media: z.array(z.string()).optional(),
});

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/user/courses', { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                setCourses(data);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        }
    };

    const form = useForm<z.infer<typeof courseSchema>>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            title: "",
            description: "",
            duration: "",
            price: "",
            media: [],
        },
    });

    const onSubmit = async (values: z.infer<typeof courseSchema>) => {
        setIsLoading(true);
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = { ...values, id: editingId, media: values.media?.map(url => ({ url })) };

            const res = await fetch('/api/user/courses', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(editingId ? "Course updated!" : "Course added!");
                form.reset();
                setEditingId(null);
                fetchCourses();
            } else {
                toast.error('Failed to save course');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving course');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (course: Course) => {
        setEditingId(course._id);
        form.reset({
            title: course.title,
            description: course.description,
            duration: course.duration,
            price: course.price,
            media: course.media.map(m => m.url),
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this course?")) return;

        try {
            const res = await fetch(`/api/user/courses?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Course deleted");
                setCourses(prev => prev.filter(c => c._id !== id));
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        form.reset({
            title: "",
            description: "",
            duration: "",
            price: "",
            media: [],
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full"
            suppressHydrationWarning
        >
            <h1 className="text-4xl font-extrabold tracking-tight mb-8 flex items-center gap-3">
                <GraduationCap className="h-10 w-10 text-blue-500" />
                My Courses
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">
                                {editingId ? 'Edit Course' : 'Add New Course'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Course Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Advanced Architecture" className="bg-gray-900/70" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="duration"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Duration</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 6 Weeks" className="bg-gray-900/70" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price/Fees</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. ₹5000" className="bg-gray-900/70" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>


                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Course details, curriculum..." className="bg-gray-900/70 resize-none h-32" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="media"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cover Image</FormLabel>
                                                <FormControl>
                                                    <div className="space-y-2">
                                                        {(field.value || []).map((url, i) => (
                                                            <div key={i} className="relative h-20 w-full mb-2">
                                                                <img src={url} className="h-full object-contain" />
                                                                <Button type="button" variant="destructive" size="icon" className="absolute top-0 right-0 h-6 w-6" onClick={() => {
                                                                    const newMedia = [...(field.value || [])];
                                                                    newMedia.splice(i, 1);
                                                                    field.onChange(newMedia);
                                                                }}><Trash2 className="h-3 w-3" /></Button>
                                                            </div>
                                                        ))}
                                                        {/* Allow only one image for cover */}
                                                        {(field.value || []).length === 0 && (
                                                            <ImageUpload
                                                                value={""}
                                                                onChange={(url) => field.onChange([url])}
                                                                label="Add Cover Image"
                                                                className="w-full"
                                                            />
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end space-x-2 pt-4">
                                        {editingId && <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>}
                                        <Button type="submit" disabled={isLoading} className="w-full">
                                            {isLoading ? 'Saving...' : (editingId ? 'Update Course' : 'Add Course')}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((course) => (
                            <Card key={course._id} className="bg-gray-800/40 border-gray-700/30 overflow-hidden group hover:border-blue-500/50 transition-all">
                                <div className="h-48 w-full bg-gray-900 relative">
                                    {course.media?.[0] ? (
                                        <img src={course.media[0].url} alt={course.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <GraduationCap className="h-12 w-12 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleEdit(course)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(course._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    {course.price && (
                                        <Badge className="absolute bottom-2 right-2 bg-green-900 text-green-300 border-0">
                                            {course.price}
                                        </Badge>
                                    )}
                                    {course.duration && (
                                        <Badge variant="secondary" className="absolute bottom-2 left-2">
                                            {course.duration}
                                        </Badge>
                                    )}
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-bold text-lg text-white mb-2">{course.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-3">{course.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                        {courses.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-800/20 rounded-lg border border-dashed border-gray-700">
                                <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No courses added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
