'use client';

import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { MotionDiv } from '@/components/utils/motion-div';

const AdminLoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 sm:p-8">
      <MotionDiv
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-bold text-white text-center mb-8">Admin Access</h1>
        <AdminLoginForm />
      </MotionDiv>
    </div>
  );
};

export default AdminLoginPage;
