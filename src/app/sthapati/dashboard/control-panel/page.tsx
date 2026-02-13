'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { newUsersData, pendingApprovals, totalUsers, recentActivity } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX } from 'lucide-react';

export default function ControlPanelPage() {
  const totalNewUsers = newUsersData.reduce((acc, curr) => acc + curr.users, 0);
  const hasTrendData = newUsersData.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full"
    >
      <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-slate-900 dark:text-white">Control Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-white dark:bg-gray-800/60 border-gray-200 dark:border-blue-500/30 shadow-lg rounded-lg transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-gray-400">New Users (Last 7 Days)</CardTitle>
            <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalNewUsers}</div>
            <div className="h-24 mt-4">
              {hasTrendData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={newUsersData}>
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(37, 99, 235, 0.1)' }}
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #1F2937)',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: 'var(--tooltip-text, #F3F4F6)'
                      }}
                    />
                    <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-slate-400 dark:text-gray-400">No user activity data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800/60 border-gray-200 dark:border-yellow-500/30 shadow-lg rounded-lg transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-gray-400">Pending User Approvals</CardTitle>
            <UserX className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center h-full">{pendingApprovals}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800/60 border-gray-200 dark:border-green-500/30 shadow-lg rounded-lg transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-gray-400">Total Users</CardTitle>
            <UserCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center h-full">{totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Recent Activity</h2>
        <Card className="bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700/50 shadow-lg rounded-lg transition-colors duration-300">
          <CardContent className="p-6">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-gray-400">No recent admin activity.</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {recentActivity.map((activity, index) => (
                  <li key={index} className="py-4 flex justify-between items-center">
                    <span className="text-slate-700 dark:text-gray-300">{activity.action}</span>
                    <span className="text-slate-400 dark:text-gray-500 text-sm">{activity.timestamp}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
