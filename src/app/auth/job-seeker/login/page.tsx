
"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
    identifier: z.string().min(3, { message: "Email or Phone is required" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

function JobSeekerLoginContent() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                identifier: `JOB-SEEKER-LOGIN:${values.identifier}`,
                password: values.password,
                loginType: 'job-seeker', // Strict Job Seeker Login
                redirect: false,
            });

            if (result?.error) {
                if (result.error.includes("AccountBanned")) {
                    toast({
                        title: "Account Banned",
                        description: "Your account has been banned. Please contact support.",
                        variant: "destructive",
                    });
                } else {
                    toast({
                        title: "Login failed",
                        description: result.error,
                        variant: "destructive",
                    });
                }
                setIsLoading(false);
                return;
            }

            if (result?.ok) {
                router.push("/jobs");
                router.refresh();
            }
        } catch (error) {
            toast({
                title: "Login failed",
                description: "An error occurred. Please try again.",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-sans flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-10 rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">

                {/* Left Column - Branding (Different for Job Seeker maybe?) */}
                <div className="relative hidden md:col-span-4 md:block">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: "url('https://placehold.co/600x800/3b82f6/fff?text=Find+Jobs')" }}
                    >
                        <div className="absolute inset-0 bg-white/10 dark:bg-black/30 backdrop-blur-md"></div>
                    </div>
                    <div className="relative z-10 flex flex-col items-start justify-center h-full p-12 space-y-6">
                        <div className="bg-slate-100/80 dark:bg-slate-800/50 p-4 rounded-full backdrop-blur-sm shadow-sm ring-1 ring-slate-200 dark:ring-white/10">
                            <Logo />
                        </div>
                        <h1 className="text-5xl font-bold text-slate-900 dark:text-white drop-shadow-sm">Job Seeker Portal</h1>
                        <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
                            Sign in to find your dream job in the ACE industry.
                        </p>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="col-span-full md:col-span-6 w-full p-8 md:p-12 flex flex-col justify-center">
                    <div className="space-y-6 w-full max-w-md mx-auto">

                        <div className="text-center mb-4">
                            <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
                                &larr; Back to Main Login
                            </Link>
                        </div>

                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-center">Job Seeker Login</h2>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="identifier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Email or Phone Number</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="name@example.com or 9876543210"
                                                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white w-full focus:ring-blue-500 focus:border-blue-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="font-bold">Password</Label>
                                        <Link href="/auth/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium">
                                            Forgot?
                                        </Link>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="password"
                                                        placeholder="••••••••"
                                                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-md placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white w-full focus:ring-blue-500 focus:border-blue-500"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full font-bold rounded-md transition-colors duration-200 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        "Sign In"
                                    )}
                                </Button>
                            </form>
                        </Form>

                        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                            Don't have an account?{' '}
                            <Link href="/auth/job-seeker/register" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function JobSeekerLoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>}>
            <JobSeekerLoginContent />
        </Suspense>
    );
}
