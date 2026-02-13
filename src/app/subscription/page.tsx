"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export default function SubscriptionPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/subscription");
        }
    }, [status, router]);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            // Simulate API call to payment gateway / backend
            const response = await fetch("/api/subscription/purchase", {
                method: "POST",
            });

            if (response.ok) {
                toast({ title: "Subscription Active!", description: "You can now apply for jobs." });
                router.push("/jobs");
            } else {
                toast({ title: "Purchase failed", variant: "destructive" });
            }
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Upgrade to Apply</h1>
                    <p className="text-slate-600 dark:text-slate-400">Subscribe now to unlock unlimited job applications.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {/* Free Tier - Disabled/Info */}
                    <Card className="opacity-70 border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>Free Account</CardTitle>
                            <CardDescription>Browse jobs only</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-4">$0 <span className="text-sm font-normal text-slate-500">/ mo</span></div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Browse Job Listings</li>
                                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Create Profile</li>
                                <li className="flex items-center gap-2 text-sm text-slate-400"><Check className="h-4 w-4" /> Apply to Jobs</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                        </CardFooter>
                    </Card>

                    {/* Premium Tier */}
                    <Card className="border-cyan-500 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">RECOMMENDED</div>
                        <CardHeader>
                            <CardTitle>Job Seeker Pro</CardTitle>
                            <CardDescription>Unlock applications & insights</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold mb-4 text-cyan-600">$19 <span className="text-sm font-normal text-slate-500">/ mo</span></div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Browse Job Listings</li>
                                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Create Profile</li>
                                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> <strong>Apply to Unlimited Jobs</strong></li>
                                <li className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-green-500" /> Priority Support</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={handlePurchase} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Subscribe & Apply"}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
