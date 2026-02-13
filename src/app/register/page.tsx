"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { GoogleIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import Logo from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { USER_CATEGORIES, COA_REGEX } from "@/lib/constants";
import { CategorySelectionModal } from "@/components/auth/category-selection-modal";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Role selection is required." }),
  coa_number: z.string().optional(),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).superRefine((data, ctx) => {
  if (data.category === "Architect") {
    if (!data.coa_number) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "COA Number is required for Architects.",
        path: ["coa_number"],
      });
    } else if (!COA_REGEX.test(data.coa_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid format. Must be CA/YYYY/XXXXX.",
        path: ["coa_number"],
      });
    }
  }
});

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      category: "",
      coa_number: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const category = form.watch("category");

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      let endpoint = "/api/auth/register";
      if (values.category === 'Job Seeker') {
        endpoint = "/api/auth/register/job-seeker";
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          category: values.category,
          coa_number: values.category === "Architect" ? values.coa_number : undefined,
          phone: values.phone,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // SIMULATION: Generate and show OTP for ALL users (including Job Seekers if they use this form)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      setShowOtpModal(true);

      // Usually would send email/SMS here. For simulation:
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
      toast({ title: "Verification Successful", description: "Please login with your credentials." });

      router.push("/login");
    } else {
      toast({ title: "Invalid OTP", description: "Please enter the correct code.", variant: "destructive" });
    }
  };

  const handleGoogleSignup = () => {
    setShowGoogleModal(true);
  };

  if (showOtpModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
          <CardHeader>
            <CardTitle className="text-center">Verify Your Account</CardTitle>
            <CardDescription className="text-center">Enter the OTP sent to your device (Check the alert)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-center">
                <Input
                  id="otp"
                  placeholder="------"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  className="text-center text-3xl tracking-[1em] font-mono h-16 w-full max-w-[240px]"
                  maxLength={6}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">Enter the 6-digit code</p>
            </div>
            <Button className="w-full h-12 text-lg font-semibold bg-cyan-600 hover:bg-cyan-700" onClick={handleVerifyOtp}>
              Verify & Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans transition-colors duration-300">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-10 gap-x-12">
        {/* Left Column - Branding */}
        <div className="hidden md:flex md:col-span-4 flex-col items-start justify-center space-y-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full shadow-sm">
            <Logo />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white">Welcome to the Network.</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Connect, collaborate, and build the future of the ACE industry. Get started.
          </p>
        </div>

        {/* Right Column - Form */}
        <div className="md:col-span-6 w-full">
          <Card className="bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-xl">
            <CardHeader className="p-8 md:p-12 pb-4">
              <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white">Create an Account</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400 pt-2">
                Join the premier professional network for the ACE industry.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12 pt-0">
              <div className="space-y-6">
                <Button
                  variant="outline"
                  className="w-full bg-slate-100 dark:bg-white text-slate-900 dark:text-black hover:bg-slate-200 dark:hover:bg-slate-200 rounded-md font-bold py-6 border-slate-200 dark:border-transparent"
                  onClick={handleGoogleSignup}
                >
                  <GoogleIcon className="mr-2 h-5 w-5" />
                  Sign up with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-900 px-2 text-slate-500">
                      OR
                    </span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-slate-900 dark:text-white">Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-cyan-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-slate-900 dark:text-white">I am a...</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                                  <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700">
                                {USER_CATEGORIES.filter((cat) => cat !== "Job Seeker").map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {category === "Architect" && (
                      <FormField
                        control={form.control}
                        name="coa_number"
                        render={({ field }) => (
                          <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <FormLabel className="font-bold text-slate-900 dark:text-white">COA Number <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="CA/YYYY/XXXXX" className="uppercase bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-cyan-500" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-slate-900 dark:text-white">Contact Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="9876543210"
                              className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-cyan-500"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                            />
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
                          <FormLabel className="font-bold text-slate-900 dark:text-white">Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="name@example.com" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-cyan-500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-slate-900 dark:text-white">Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-cyan-500" {...field} />
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
                            <FormLabel className="font-bold text-slate-900 dark:text-white">Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-cyan-500" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full font-bold rounded-md py-6 mt-2 transition-all duration-200 bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-cyan-400 hover:text-cyan-300">
                    Login here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <CategorySelectionModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        intent="signup"
      />
    </div>
  );
}
