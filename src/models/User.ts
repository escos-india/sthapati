import { Schema, model, models, type Model, type InferSchemaType } from 'mongoose';
import { USER_CATEGORIES, type UserCategory, type UserStatus } from '@/lib/constants';

// Re-export for backward compatibility (server-side only)
export { USER_CATEGORIES, type UserCategory, type UserStatus };

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    googleId: { type: String, sparse: true, unique: true },
    password: { type: String },
    phone: { type: String, unique: true, sparse: true },
    image: { type: String },
    // Category enum validation comes from constants.ts
    category: { type: String, enum: USER_CATEGORIES, required: true },
    coa_number: {
      type: String,
      match: [/^CA\/\d{4}\/\d{5}$/, 'Invalid CoA Number format. Must be CA/YYYY/XXXXX']
    },
    auth_provider: { type: String, enum: ['email', 'google'], default: 'email' },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'banned'],
      default: 'pending',
    },
    approved_by_admin_id: { type: String }, // Using String for ObjectId reference flexibility
    approved_at: { type: Date },
    rejected_by_admin_id: { type: String },
    rejected_at: { type: Date },
    phone_verified: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },

    // OTP Fields
    otp: { type: String },
    otpExpiry: { type: Date },

    isProfileComplete: { type: Boolean, default: false },

    // Profile Fields
    cover_image: { type: String },
    headline: { type: String, maxlength: 220 },
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
      address: { type: String }, // Added Address
    },
    work_preference: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Onsite', 'Not Open'],
      default: 'Onsite'
    },
    bio: { type: String, maxlength: 2600 },

    services: [{
      title: { type: String },
      description: { type: String },
      tags: [{ type: String }]
    }],

    experience: [{
      title: { type: String },
      organization: { type: String },
      type: { type: String }, // Full-time, Part-time, etc.
      start_date: { type: Date },
      end_date: { type: Date },
      is_current: { type: Boolean, default: false },
      description: { type: String },
      media: [{ type: String }] // URLs
    }],

    education: [{
      institution: { type: String },
      degree: { type: String },
      field_of_study: { type: String },
      start_date: { type: Date },
      end_date: { type: Date },
      is_current: { type: Boolean, default: false },
      current_year: { type: Number },
      duration: { type: String }
    }],

    skills: [{
      name: { type: String },
      proficiency: { type: String }, // Beginner, Intermediate, Expert
      endorsements: { type: Number, default: 0 }
    }],

    projects: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      role: { type: String, required: true },
      location: { type: String }, // City, Country etc
      year: { type: Number },
      budget_range: { type: String },
      tags: [{ type: String }],
      media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' }
      }]
    }],

    certifications: [{
      title: { type: String },
      issuer: { type: String },
      issue_date: { type: Date },
      credential_url: { type: String }
    }],

    gallery: [{
      title: { type: String },
      url: { type: String },
      type: { type: String, enum: ['image', 'video'], default: 'image' }
    }],

    // Student-specific fields
    certificatesStatus: {
      type: String,
      enum: ['Pursuing', 'Completed']
    },
    specialization: { type: String },
    resume: { type: String }, // PDF URL

    // Material Supplier catalog
    materials: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      description: { type: String }, // Added description
      price: { type: String, required: true },
      quantity: { type: String }, // Added quantity field
      photos: [{
        url: { type: String, required: true }
      }],
      createdAt: { type: Date, default: Date.now }
    }],

    // Educational Institute Courses
    courses: [{
      title: { type: String, required: true },
      description: { type: String, required: true },
      duration: { type: String },
      price: { type: String },
      media: [{
        url: { type: String, required: true }
      }],
      createdAt: { type: Date, default: Date.now }
    }],

    social_links: {
      website: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      github: { type: String }
    },

    verification_badges: {
      email: { type: Boolean, default: false },
      organization: { type: Boolean, default: false },
      skill: { type: Boolean, default: false }
    },

    isOpenToWork: { type: Boolean, default: false },
    isHiring: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    connections: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    associates: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    dismissedAnnouncements: [{ type: Schema.Types.ObjectId, ref: 'Announcement' }],

    // Subscription fields
    subscriptionStatus: { type: String, enum: ['none', 'active', 'expired'], default: 'none' },
    subscriptionExpiry: { type: Date },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export type IUser = UserDocument;

// Force model recompilation in dev to pick up enum changes
if (process.env.NODE_ENV === 'development' && models.User) {
  delete models.User;
}

export const UserModel: Model<UserDocument> =
  (models.User as Model<UserDocument>) || model<UserDocument>('User', userSchema);
