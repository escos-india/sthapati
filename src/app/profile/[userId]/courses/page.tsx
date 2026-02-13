import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/profile/course-card-client";

export default async function UserCoursesPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    await connectDB();
    const rawUser = await UserModel.findById(userId).lean();

    if (!rawUser) {
        return <div className="min-h-screen flex items-center justify-center">User not found</div>;
    }

    const user = JSON.parse(JSON.stringify(rawUser));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/profile/${userId}`}>
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}'s Courses</h1>
                        <p className="text-slate-500 dark:text-gray-400">View all course offerings</p>
                    </div>
                </div>

                {user.courses && user.courses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {user.courses.map((course: any, idx: number) => (
                            <CourseCard key={idx} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <GraduationCap className="h-16 w-16 mx-auto text-slate-300 dark:text-gray-600 mb-4" />
                        <p className="text-slate-500 dark:text-gray-400 text-lg">No courses offered.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
