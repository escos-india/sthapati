'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, 
  BarChart, Bar,
} from 'recharts';
import { Download } from 'lucide-react';

import {
    userGrowthData,
    planDistributionData,
    contentCreationData,
    fullUserList,
    contentReport,
} from '@/lib/reporting-mock-data';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ReportingPage() {
  const [dateRange, setDateRange] = useState('30d');

  const handleExport = (data: any[], filename: string) => {
    if (!data.length) {
      alert('No data available to export yet.');
      return;
    }
    const csvContent = "data:text/csv;charset=utf-8,"
        + [Object.keys(data[0]), ...data.map(item => Object.values(item))].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full"
    >
        <div className='flex justify-between items-center mb-8'>
            <h1 className="text-4xl font-extrabold tracking-tight">Reporting</h1>
            <Select onValueChange={setDateRange} defaultValue={dateRange}>
                <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a date range" />
                </SelectTrigger>
                <SelectContent className='bg-gray-900 border-gray-700'>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last Quarter</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
            </Select>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-10">
        {/* User Growth Chart */}
        <Card className="xl:col-span-2 bg-gray-800/60 border-gray-700/50 shadow-lg">
          <CardHeader>
            <CardTitle>User Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent className='h-80'>
            {userGrowthData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">No growth data available.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke='rgba(255, 255, 255, 0.1)' />
                  <XAxis dataKey="date" stroke='#9ca3af'/>
                  <YAxis stroke='#9ca3af' />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563'}} 
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Legend wrapperStyle={{ color: '#e5e7eb' }}/>
                  <Line type="monotone" dataKey="New Users" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Plan Distribution Chart */}
        <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg">
          <CardHeader>
            <CardTitle>Active User Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className='h-80'>
            {planDistributionData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">No subscription plan data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563'}}
                      formatter={(value, name) => [`${value} Users`, name]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Content Engagement Chart - Simplified for Debugging */}
        <Card className="lg:col-span-2 xl:col-span-3 bg-gray-800/60 border-gray-700/50 shadow-lg">
          <CardHeader>
            <CardTitle>New Content Creation</CardTitle>
          </CardHeader>
          <CardContent className='h-96'>
            {contentCreationData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">No content activity recorded.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={contentCreationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke='rgba(255, 255, 255, 0.1)' />
                      <XAxis dataKey="name" stroke='#9ca3af' />
                      <YAxis stroke='#9ca3af' />
                      <Bar dataKey="communityPosts" name="Community Posts" fill="#8884d8" />
                  </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Export Section */}
        <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg">
            <CardHeader>
                <CardTitle>Data Export & Report Generation</CardTitle>
                <CardDescription>Download raw data files for in-depth analysis.</CardDescription>
            </CardHeader>
            <CardContent className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                <Button variant='outline' className='justify-start' onClick={() => handleExport(fullUserList, "full_user_list.csv")} disabled={fullUserList.length === 0}><Download className="mr-2 h-4 w-4" /> Full User List (.csv)</Button>
                <Button variant='outline' className='justify-start' onClick={() => handleExport(userGrowthData, "new_user_report.csv")} disabled={userGrowthData.length === 0}><Download className="mr-2 h-4 w-4" /> New User Report (.csv)</Button>
                <Button variant='outline' className='justify-start' onClick={() => handleExport(contentReport, "content_report.csv")} disabled={contentReport.length === 0}><Download className="mr-2 h-4 w-4" /> Content Report (.csv)</Button>
                <Button variant='outline' className='justify-start' disabled><Download className="mr-2 h-4 w-4" /> Financial Report (.csv)</Button>
            </CardContent>
        </Card>

    </motion.div>
  );
}
