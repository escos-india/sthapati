'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { MotionDiv } from '@/components/utils/motion-div';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // --- BACKEND INTEGRATION POINT ---
    // Replace this with your actual API call to the backend
    try {
      // Example: await yourApiClient.requestPasswordReset(values.email);
      console.log("Requesting password reset for:", values.email);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      setSubmitted(true);
      toast({
        title: 'Request Sent',
        description: "If an account with that email exists, we've sent a password reset link.",
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send password reset email. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-4">
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              {submitted
                ? "You can now close this page."
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="name@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Reset Link
                  </Button>
                </form>
              </Form>
            ) : (
                <div className="text-center">
                    <p className="text-muted-foreground mb-4">Check your email for the reset link.</p>
                </div>
            )}
            <p className="mt-6 text-center text-sm">
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Return to Login
                </Link>
            </p>
          </CardContent>
        </Card>
      </MotionDiv>
    </div>
  );
}
