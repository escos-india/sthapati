'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Briefcase, User } from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.3,
      duration: 0.8,
      ease: [0.25, 1, 0.5, 1],
    },
  }),
};

const GetStartedPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-8">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-5xl md:text-7xl font-bold mb-4 text-center"
      >
        Join Our Network
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-lg md:text-xl text-gray-400 mb-16 text-center max-w-2xl"
      >
        Whether you're looking for your next career opportunity or searching for top talent, we have a plan for you.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Employee Card */}
        <motion.div
          variants={cardVariants}
          custom={1}
          initial="hidden"
          animate="visible"
          className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/30 shadow-lg flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-blue-500/20"
        >
          <User className="h-16 w-16 text-blue-400 mb-6" />
          <h2 className="text-3xl font-bold mb-4">For Employees</h2>
          <p className="text-gray-400 mb-8 flex-grow">
            Find your dream job, connect with industry leaders, and build your professional network.
          </p>
          <Link href="/login">
            <span className="flex items-center justify-center w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-blue-700">
              Find a Job <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          </Link>
        </motion.div>

        {/* Employer Card */}
        <motion.div
          variants={cardVariants}
          custom={2}
          initial="hidden"
          animate="visible"
          className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30 shadow-lg flex flex-col items-center text-center transition-transform transform hover:scale-105 hover:shadow-purple-500/20"
        >
          <Briefcase className="h-16 w-16 text-purple-400 mb-6" />
          <h2 className="text-3xl font-bold mb-4">For Employers</h2>
          <p className="text-gray-400 mb-8 flex-grow">
            Access a curated pool of top talent and streamline your hiring process.
          </p>
          <Link href="/login">
            <span className="flex items-center justify-center w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-purple-700">
              Hire Talent <ArrowRight className="ml-2 h-5 w-5" />
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default GetStartedPage;
