"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import Logo from "@/components/ui/logo";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [phone, setPhone] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/check-phone", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone })
            });

            if (!res.ok) {
                throw new Error("Phone number not registered.");
            }

            // Redirect to Verify
            // Using currently active path - if move fails, this might break if we assume /auth/verify-phone
            // Safest is to use the /register one if we are unsure, OR assume the move will happen.
            // Prompt asked to reuse the component.
            // I'll assume /auth/verify-phone for now as per plan, user will approve command.
            router.push("/auth/verify-phone?mode=reset");

        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Phone number not found",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-900 dark:text-white transition-colors duration-300">
            <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 shadow-xl">
                <CardHeader className="text-center flex flex-col items-center">
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                    <CardDescription>
                        Enter your registered phone number to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                placeholder="9876543210"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                required
                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                            disabled={isLoading || !phone}
                        >
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Proceed"}
                        </Button>
                        <div className="text-center mt-4">
                            <Link href="/login" className="text-sm text-slate-500 hover:text-cyan-500 flex items-center justify-center gap-1">
                                <ArrowLeft className="h-3 w-3" /> Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
