"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import Link from "next/link";

interface PublicProfileAssociatesProps {
    associates: any[];
}

export function PublicProfileAssociates({ associates }: PublicProfileAssociatesProps) {
    if (!associates || associates.length === 0) return null;

    return (
        <Card className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-shadow mb-8">
            <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-500" />
                    Associates
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {associates.map((conn: any) => (
                        <Link href={`/profile/${conn._id}`} key={conn._id}>
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all cursor-pointer group">
                                <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-900 shadow-sm">
                                    <AvatarImage src={conn.image} />
                                    <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-semibold">
                                        {conn.name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-cyan-600 transition-colors">
                                        {conn.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 truncate">
                                        {conn.headline || conn.category}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
