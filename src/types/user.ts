// Type-only definitions for User - safe to import in client components
// This file should NEVER import Mongoose or any Node.js-only modules

import type { UserCategory, UserStatus } from '@/lib/constants';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  googleId?: string | null;
  password?: string | null;
  phone?: string | null;
  image?: string | null;
  category: UserCategory;
  status: UserStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // Profile Fields
  isOpenToWork?: boolean; // Added
  isHiring?: boolean; // Added for professional roles
  isAdmin?: boolean; // Added
  dismissedAnnouncements?: string[]; // Added
  isProfileComplete?: boolean; // Added
  connections?: string[]; // Added
  associates?: string[]; // Added
  cover_image?: string | null;
  headline?: string | null;
  location?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string; // Added
  };
  work_preference?: 'Remote' | 'Hybrid' | 'Onsite' | 'Not Open';
  bio?: string | null;

  services?: {
    title: string;
    description: string;
    tags: string[];
  }[];

  experience?: {
    _id?: string;
    title: string;
    organization: string;
    type: string;
    start_date: Date | string;
    end_date?: Date | string;
    is_current: boolean;
    description: string;
    media?: string[];
  }[];

  education?: {
    _id?: string;
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: Date | string;
    end_date?: Date | string;
    is_current?: boolean;
    current_year?: number;
    duration?: string;
  }[];

  skills?: {
    _id?: string;
    name: string;
    proficiency?: string;
    endorsements?: number;
  }[];

  projects?: {
    _id?: string;
    title: string;
    description: string;
    role: string;
    location?: string;
    year?: string | number;
    budget_range?: string;
    tags?: string[];
    tools?: string[]; // Keeping for legacy/optional
    media: { url: string; type: 'image' | 'video' }[]; // Updated structure
  }[];

  certifications?: {
    _id?: string;
    title: string;
    issuer: string;
    issue_date: Date | string;
    credential_url?: string;
  }[];

  gallery?: {
    _id?: string;
    title?: string;
    url: string;
    type: 'image' | 'video';
  }[];

  // Student-specific fields
  certificatesStatus?: 'Pursuing' | 'Completed';
  specialization?: string;
  resume?: string; // PDF URL

  // Material Supplier catalog
  materials?: {
    _id?: string;
    name: string;
    type: string;
    description?: string; // Added
    price: string;
    quantity?: string; // Added
    photos: { url: string }[];
    createdAt?: Date | string;
  }[];

  // Educational Institute Courses
  courses?: {
    _id?: string;
    title: string;
    description: string;
    duration?: string;
    price?: string;
    media: { url: string }[];
    createdAt?: Date | string;
  }[];

  social_links?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };

  verification_badges?: {
    email: boolean;
    organization: boolean;
    skill: boolean;
  };
}

export type { UserCategory, UserStatus };
