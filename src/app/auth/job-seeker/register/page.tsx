"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
    email: z.string().email({ message: "Invalid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export default function JobSeekerRegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [generatedOtp, setGeneratedOtp] = useState("");
    const [otpInput, setOtpInput] = useState("");

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/auth/register/job-seeker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: values.name,
                    phone: values.phone,
                    email: values.email,
                    password: values.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Auto Login - Job Seeker Specific
            const result = await signIn("credentials", {
                redirect: false,
                identifier: values.email, // Note: backend expects 'identifier' for credentials provider
                password: values.password,
                loginType: 'job-seeker'
            });

            if (result?.error) {
                // If login fails but registration succeeded, we might still want to proceed or warn
                toast({ title: "Login failed", description: "Account created but login failed. Please login manually.", variant: "destructive" });
                router.push("/auth/job-seeker/login");
                return;
            }

            // SIMULATION: Generate and show OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(otp);
            setShowOtpModal(true);

            // Show OTP to user (Simulation)
            alert(`Your OTP Code is: ${otp}`);

        } catch (error) {
            toast({
                title: "Registration failed",
                description: error instanceof Error ? error.message : "Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = () => {
        if (otpInput === generatedOtp) {
            toast({ title: "Verification Successful", description: "Redirecting to subscription..." });
            router.push("/subscription");
        } else {
            toast({ title: "Invalid OTP", description: "Please enter the correct code.", variant: "destructive" });
        }
    };

    if (showOtpModal) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 shadow-2xl">
                    <CardHeader>
                        <CardTitle>Verify Your Account</CardTitle>
                        <CardDescription>Enter the OTP sent to your device (Check the alert)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="otp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">One-Time Password</label>
                            <Input
                                id="otp"
                                placeholder="Enter 6-digit code"
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                                className="text-center text-lg tracking-widest"
                                maxLength={6}
                            />
                        </div>
                        <Button className="w-full" onClick={handleVerifyOtp}>Verify & Continue</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>
                <Card className="bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Job Seeker Registration</CardTitle>
                        <CardDescription>Create an account to start applying for jobs</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="name@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="9876543210" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="submit"
                                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                                    ) : (
                                        "Register & Continue"
                                    )}
                                </Button>
                            </form>
                        </Form>
                        <p className="mt-4 text-center text-sm text-slate-500">
                            Already have an account? <Link href="/auth/job-seeker/login" className="text-cyan-600 hover:underline">Login</Link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
