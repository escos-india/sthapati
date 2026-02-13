"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Camera, Pencil, Phone, Mail, Copy, User, BriefcaseBusiness } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { IUser } from "@/types/user";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { ConnectButton } from "@/components/network/connect-button";

interface PublicProfileHeaderProps {
    user: IUser;
    isOwnProfile?: boolean;
    initialConnectionStatus?: "none" | "pending" | "connected" | "received";
    jobPostCount?: number;
}

export function PublicProfileHeader({ user, isOwnProfile = false, initialConnectionStatus = "none", jobPostCount = 0 }: PublicProfileHeaderProps) {
    const { toast } = useToast();
    const [showContactDialog, setShowContactDialog] = useState(false);

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${label} copied!` });
    };

    const ContactDialog = () => (
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
            <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden p-0 border-0">
                <DialogTitle className="sr-only">Contact {user.name}</DialogTitle>
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-center text-white">
                    <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center mb-4 border-4 border-white/30 shadow-xl overflow-hidden">
                        {user.image ? (
                            <Image src={user.image} alt={user.name} width={96} height={96} className="h-full w-full rounded-full object-cover" unoptimized />
                        ) : (
                            <User className="h-10 w-10 text-white" />
                        )}
                    </div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-blue-100">{user.headline}</p>
                </div>

                <div className="p-6 space-y-4 bg-white dark:bg-slate-900">
                    <p className="text-center text-sm text-muted-foreground mb-4">Connect directly regarding opportunities.</p>

                    {user.phone && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Phone Number</p>
                                <p className="font-semibold text-lg text-slate-900 dark:text-white">{user.phone}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-blue-600" onClick={() => copyToClipboard(user.phone || '', 'Phone number')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {user.email && (
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10">
                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Email Address</p>
                                <p className="font-semibold text-sm text-slate-900 dark:text-white break-all">{user.email}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-purple-600" onClick={() => copyToClipboard(user.email || '', 'Email')}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    {!user.phone && !user.email && (
                        <p className="text-center text-muted-foreground py-4">No contact information available.</p>
                    )}

                    <Button className="w-full mt-2" variant="outline" onClick={() => setShowContactDialog(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            <ContactDialog />
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-slate-200 dark:border-gray-800 overflow-hidden mb-6">
                {/* Banner Section */}
                <div className="relative h-48 md:h-64 bg-slate-100 dark:bg-gray-800 group">
                    {user.cover_image ? (
                        <img
                            src={user.cover_image}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-cyan-500 to-blue-600" />
                    )}

                    {isOwnProfile && (
                        <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 shadow-sm border border-slate-200 rounded-full dark:bg-gray-900/90 dark:text-white dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <a href="/dashboard/edit-profile">
                                <Camera className="w-4 h-4 mr-2" />
                                Edit background
                            </a>
                        </Button>
                    )}
                </div>

                <div className="px-6 md:px-8 pb-8 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end mb-4 gap-4 md:gap-6">
                        {/* Avatar - Pulled up to overlap banner */}
                        <div className="relative -mt-16 md:-mt-20 shrink-0">
                            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-white dark:border-gray-900 shadow-lg bg-white dark:bg-gray-900">
                                <AvatarImage src={user.image || undefined} alt={user.name} />
                                <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-4xl font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Name and Headline - Flows naturally below banner */}
                        <div className="flex-1 pt-2 md:pt-0 pb-2 min-w-0 md:mb-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
                                    {user.name}
                                </h1>
                                {/* Open To Work Badge */}
                                {user.isOpenToWork && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800 text-sm font-medium w-fit mt-1 md:mt-0 shrink-0">
                                        <Briefcase className="w-4 h-4" />
                                        <span>Open to work</span>
                                    </div>
                                )}
                                {/* Hiring Badge */}
                                {jobPostCount > 0 && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800 text-sm font-medium w-fit mt-1 md:mt-0 shrink-0">
                                        <BriefcaseBusiness className="w-4 h-4" />
                                        <span>Hiring</span>
                                    </div>
                                )}
                            </div>

                            {user.headline && (
                                <p className="text-slate-600 dark:text-gray-300 text-base md:text-lg mt-1 break-words line-clamp-2">
                                    {user.headline}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-500 dark:text-gray-400">
                                {user.location?.city && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{user.location.city}, {user.location.country}</span>
                                    </div>
                                )}
                                <span className="hidden md:inline text-slate-300 dark:text-gray-700">•</span>
                                <div className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                                    <span>{user.connections?.length || 0} connections</span>
                                </div>
                                <span className="hidden md:inline text-slate-300 dark:text-gray-700">•</span>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto text-cyan-600 dark:text-cyan-400 font-semibold hover:no-underline"
                                    onClick={() => setShowContactDialog(true)}
                                >
                                    Contact info
                                </Button>
                            </div>
                        </div>

                        {/* Actions (Desktop) - Strictly Controlled */}
                        <div className="hidden md:flex gap-2 self-start md:self-end pb-2 shrink-0">
                            {isOwnProfile ? (
                                <Button variant="outline" className="rounded-full border-slate-300 dark:border-gray-600 hover:bg-slate-100 dark:hover:bg-gray-800" asChild>
                                    <a href="/dashboard/edit-profile">
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Edit profile
                                    </a>
                                </Button>
                            ) : (
                                <ConnectButton userId={user._id || ""} initialStatus={initialConnectionStatus} />
                            )}
                        </div>
                    </div>

                    {/* Mobile Actions (Below info) */}
                    <div className="md:hidden flex flex-col gap-3 mt-2">
                        {isOwnProfile ? (
                            <Button variant="outline" className="w-full rounded-full border-slate-300 dark:border-gray-600" asChild>
                                <a href="/dashboard/edit-profile">Edit profile</a>
                            </Button>
                        ) : (
                            <ConnectButton userId={user._id || ""} initialStatus={initialConnectionStatus} />
                        )}
                    </div>
                </div>
            </div >
        </>
    );
}
