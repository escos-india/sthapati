
import { PlaceHolderImages } from '@/lib/placeholder-images';

export type Post = {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  date: string;
  imageUrl: string;
  imageHint: string;
};

export type Blog = {
  id: string;
  title: string;
  content: string;
};

export type User = {
  id: string;
  name: string;
  title: string;
};

export type Profile = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  followers?: number;
  activity?: number;
};

export const communityPosts: Post[] = [];

export const blogs: Blog[] = [];

export const users: User[] = [];

const generateProfiles = (category: string, count: number): Profile[] => {
  if (count === 0) return [];
  return Array.from({ length: count }, (_, i) => ({
    id: `${category.toLowerCase()}-${i + 1}`,
    name: `${category} User ${i + 1}`,
    role: `Lead ${category}`,
    avatarUrl: `https://i.pravatar.cc/150?u=${category}${i}`,
    followers: Math.floor(Math.random() * 5000) + 100,
    activity: Math.floor(Math.random() * 100),
  }));
};

export const professionalProfiles: Profile[] = [];
export const agencyProfiles: Profile[] = [];
export const supplierProfiles: Profile[] = [];
export const instituteProfiles: Profile[] = [];
