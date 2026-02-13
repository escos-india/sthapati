import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default async function UserGalleryPage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;

    try {
        await connectDB();
        const rawUser = await UserModel.findById(userId)
            .select("name image gallery projects")
            .lean();

        if (!rawUser) {
            redirect("/");
            return null;
        }

        const user = JSON.parse(JSON.stringify(rawUser));

        // Combine gallery images and project images
        const galleryImages = user.gallery || [];
        const projectImages = user.projects?.flatMap((p: any) => p.media || []) || [];
        const allImages = [...galleryImages, ...projectImages];

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
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}'s Gallery</h1>
                            <p className="text-slate-500 dark:text-gray-400">View all images and project media</p>
                        </div>
                    </div>

                    {allImages.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {allImages.map((image: any, idx: number) => (
                                <Card key={idx} className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                    <div className="relative aspect-square overflow-hidden">
                                        <img
                                            src={image.url || image}
                                            alt={`Gallery image ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <ImageIcon className="h-16 w-16 mx-auto text-slate-300 dark:text-gray-600 mb-4" />
                            <p className="text-slate-500 dark:text-gray-400 text-lg">No images in gallery yet.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error loading gallery:", error);
        redirect("/");
        return null;
    }
}
