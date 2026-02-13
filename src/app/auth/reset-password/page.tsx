"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Logo from "@/components/ui/logo";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { toast } = useToast();

    const [passwords, setPasswords] = useState({ new: "", confirm: "" });
    const [isLoading, setIsLoading] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Invalid or missing reset token.
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.new !== passwords.confirm) {
            toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
            return;
        }

        if (passwords.new.length < 6) {
            toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: passwords.new })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            toast({
                title: "Success",
                description: "Password updated successfully. Logging you in...",
            });

            // Success!
            // Prompt says: "Auto-create session... Auto-redirect to User's own profile page."
            // To do this, we need to log them in. 
            // For now, redirect to Login. 
            // Ideally we use signIn("credentials", { ... }) with the new password?
            // Let's try redirecting to login first. 
            router.push("/login");

        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to reset password",
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
                    <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                    <CardDescription>
                        Create a new strong password for your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="new-pass">New Password</Label>
                            <Input
                                id="new-pass"
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                required
                                className="bg-slate-50 dark:bg-slate-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-pass">Confirm Password</Label>
                            <Input
                                id="confirm-pass"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                required
                                className="bg-slate-50 dark:bg-slate-800"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Reset Password"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-cyan-500" /></div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
