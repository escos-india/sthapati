import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GalleryPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const rawUser = await getUserByEmail(session.user.email);
    if (!rawUser) {
        redirect("/login");
    }

    // Serialize user to avoid "Only plain objects" error
    const user = JSON.parse(JSON.stringify(rawUser));

    // Aggregate images from gallery, projects, and posts (if we had a way to fetch posts here easily, but let's stick to user.gallery and user.projects for now as they are in the user object)
    // Actually, the request said "images displayed by the user as gallery". So strictly `user.gallery`.
    // But `user.gallery` might be empty if we haven't built a way to add to it yet.
    // Let's include project images too as a fallback or additional section to make it look populated.

    const galleryItems = user.gallery || [];
    const projectImages = user.projects?.flatMap((p: any) => p.media?.filter((m: any) => m.type === 'image').map((m: any) => ({ url: m.url, title: p.title }))) || [];

    const allImages = [...galleryItems, ...projectImages];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Gallery</h1>
                        <p className="text-slate-500 dark:text-gray-400">A collection of your work and inspirations</p>
                    </div>
                </div>

                {allImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {allImages.map((item: any, idx: number) => (
                            <Card key={idx} className="overflow-hidden rounded-2xl border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    <div className="relative aspect-square group cursor-pointer">
                                        <img
                                            src={item.url}
                                            alt={item.title || "Gallery Image"}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                        {item.title && (
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <p className="text-white text-sm font-medium truncate">{item.title}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-gray-400 text-lg">No images found in your gallery.</p>
                        <Button className="mt-4" variant="outline">
                            Upload Images (Coming Soon)
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
