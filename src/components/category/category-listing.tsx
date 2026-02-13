"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Briefcase, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface User {
    _id: string;
    name: string;
    image?: string;
    headline?: string;
    category: string;
    location?: {
        city?: string;
        country?: string;
    };
    bio?: string;
    cover_image?: string | null;
}

interface CategoryListingProps {
    categorySlug: string;
    categoryTitle: string;
}

export function CategoryListing({ categorySlug, categoryTitle }: CategoryListingProps) {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, [categorySlug]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`/api/category?category=${categorySlug}`);
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(user =>
            user.name.toLowerCase().includes(q) ||
            user.headline?.toLowerCase().includes(q) ||
            user.location?.city?.toLowerCase().includes(q) ||
            user.location?.country?.toLowerCase().includes(q)
        );
    }, [users, searchQuery]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4">
                        {categoryTitle}
                    </h1>
                    <p className="text-slate-600 dark:text-gray-400 text-lg">
                        Discover talented professionals in our community
                    </p>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="max-w-xl mx-auto mb-10"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                            placeholder={`Search ${categoryTitle.toLowerCase()}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 rounded-full border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md focus:ring-2 focus:ring-cyan-500"
                        />
                    </div>
                </motion.div>

                {filteredUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user, idx) => (
                            <motion.div
                                key={user._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <Card
                                    className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden"
                                    onClick={() => router.push(`/profile/${user._id}`)}
                                >
                                    <div className="h-24 bg-gradient-to-r from-cyan-500 to-blue-600 relative">
                                        {user.cover_image && (
                                            <Image
                                                src={user.cover_image}
                                                alt={user.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
                                    </div>
                                    <CardContent className="p-6 -mt-12 relative">
                                        <div className="flex flex-col items-center text-center">
                                            <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-900 shadow-xl ring-2 ring-cyan-500/20 group-hover:ring-cyan-500/40 transition-all duration-300">
                                                <AvatarImage src={user.image} alt={user.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xl font-bold">
                                                    {user.name[0]}
                                                </AvatarFallback>
                                            </Avatar>

                                            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                                {user.name}
                                            </h3>

                                            {user.headline && (
                                                <p className="text-sm text-slate-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                    {user.headline}
                                                </p>
                                            )}

                                            <Badge className="mt-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                                                {user.category}
                                            </Badge>

                                            {user.location?.city && (
                                                <div className="flex items-center gap-1 mt-3 text-xs text-slate-500 dark:text-gray-500">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{user.location.city}, {user.location.country}</span>
                                                </div>
                                            )}

                                            {user.bio && (
                                                <p className="text-sm text-slate-600 dark:text-gray-400 mt-4 line-clamp-3 leading-relaxed">
                                                    {user.bio}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <Briefcase className="h-16 w-16 mx-auto text-slate-300 dark:text-gray-600 mb-4" />
                        <p className="text-slate-500 dark:text-gray-400 text-lg">
                            No professionals found in this category yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
