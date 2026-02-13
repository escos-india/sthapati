'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import { contentCreationData } from '@/lib/reporting-mock-data';

export default function ContentCreationChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={contentCreationData}>
        <CartesianGrid strokeDasharray="3 3" stroke='rgba(255, 255, 255, 0.1)' />
        <XAxis dataKey="name" stroke='#9ca3af' />
        <YAxis stroke='#9ca3af' />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
          labelStyle={{ color: '#e5e7eb' }}
        />
        <Legend />
        <Bar dataKey="communityPosts" name="Community Posts" fill="#8884d8" />
        <Bar dataKey="jobListings" name="Job Listings" fill="#82ca9d" />
        <Bar dataKey="projects" name="Projects" fill="#ffc658" />
      </BarChart>
    </ResponsiveContainer>
  );
}
