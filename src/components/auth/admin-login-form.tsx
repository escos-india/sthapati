'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

const formElementVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export function AdminLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email: data.email,
      password: data.password,
      loginType: 'admin', // Flag to identify admin login attempt
    });

    if (result?.ok) {
      toast({
        title: 'Login Successful',
        description: 'Welcome back admin',
      });
      router.push('/sthapati/dashboard');
    } else {
      setIsLoading(false);
      toast({
        title: 'Login Failed',
        description: 'Invalid email or password.',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" className="w-full max-w-lg">
      <Card className="w-full bg-gray-800/60 backdrop-blur-sm border-blue-500/30 shadow-2xl rounded-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1, rotate: 360 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <div className="bg-white/10 p-2 rounded-full inline-block">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <CardTitle className="text-4xl font-bold text-white">Admin Login</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <motion.div variants={formElementVariants}>
              <Input
                {...register('email')}
                placeholder="Email Address"
                type="email"
                className={`bg-gray-900/70 border-gray-700 focus:ring-blue-500 text-lg py-6 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <p className="text-red-400 text-sm mt-2">{errors.email.message}</p>}
            </motion.div>
            <motion.div variants={formElementVariants}>
              <Input
                {...register('password')}
                placeholder="Password"
                type="password"
                className={`bg-gray-900/70 border-gray-700 focus:ring-blue-500 text-lg py-6 rounded-lg ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <p className="text-red-400 text-sm mt-2">{errors.password.message}</p>}
            </motion.div>
            <motion.div variants={formElementVariants}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-3 h-6 w-6" />
                    Login
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
