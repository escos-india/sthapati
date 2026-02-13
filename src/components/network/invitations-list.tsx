"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserCheck, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface InvitationProps {
    requests: any[];
}

export function InvitationsList({ requests }: InvitationProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (requestId: string, action: "accept" | "reject") => {
        setLoading(requestId);
        try {
            const res = await fetch("/api/connections/request", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, action }),
            });

            if (res.ok) {
                toast({ title: `Invitation ${action}ed` });
                router.refresh();
            } else {
                toast({ title: "Failed to process request", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            {requests.map((req) => (
                <Card key={req._id} className="overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="h-20 relative bg-gradient-to-r from-cyan-500 to-blue-600">
                        {req.sender.cover_image && (
                            <Image
                                src={req.sender.cover_image}
                                alt="Cover"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        )}
                        <div className="absolute inset-0 bg-black/10 transition-colors duration-300" />
                    </div>
                    <div className="p-4 pt-12 relative flex flex-col items-center text-center">
                        <Link href={`/profile/${req.sender._id}`} className="absolute -top-10 h-20 w-20">
                            <Image
                                src={req.sender.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                alt={req.sender.name}
                                fill
                                className="rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md"
                                unoptimized
                            />
                        </Link>
                        <Link href={`/profile/${req.sender._id}`} className="hover:underline">
                            <h3 className="font-semibold text-lg truncate w-full">{req.sender.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground truncate w-full px-4">{req.sender.headline}</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">{req.sender.category}</p>

                        <div className="w-full flex gap-2">
                            <Button
                                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                                onClick={() => handleAction(req._id, "accept")}
                                disabled={loading === req._id}
                            >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Accept
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => handleAction(req._id, "reject")}
                                disabled={loading === req._id}
                            >
                                <X className="h-4 w-4 mr-2" />
                                Ignore
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </>
    );
}
