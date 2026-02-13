import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import type { IUser } from '@/types/user';
import type { UserCategory, UserStatus } from '@/types/user';

export async function getUserByEmail(email: string) {
  await connectDB();
  return UserModel.findOne({ email: email.toLowerCase() }).lean<IUser | null>();
}

export async function getUserByGoogleId(googleId: string) {
  await connectDB();
  return UserModel.findOne({ googleId }).lean<IUser | null>();
}

export async function createUserFromOAuth(params: {
  name: string;
  email: string;
  googleId: string;
  image?: string | null;
  category: UserCategory;
  coa_number?: string;
}) {
  const { name, email, googleId, image, category, coa_number } = params;
  await connectDB();

  const status: UserStatus = category === 'Architect' ? 'pending' : 'active';

  return UserModel.create({
    name,
    email: email.toLowerCase(),
    googleId,
    image,
    category,
    coa_number,
    auth_provider: 'google',
    status,
  });
}

import { JobSeekerModel } from '@/models/JobSeeker';

export async function getAllUsers() {
  await connectDB();

  // Fetch Users (excluding admins)
  const users = await UserModel.find({
    $or: [
      { isAdmin: { $ne: true } },
      { isAdmin: { $exists: false } }
    ]
  }).sort({ createdAt: -1 }).lean<IUser[]>();

  // Fetch Job Seekers
  const jobSeekers = await JobSeekerModel.find().sort({ createdAt: -1 }).lean();

  // Normalize Job Seekers to match IUser interface as much as needed for display
  const normalizedJobSeekers = jobSeekers.map(js => ({
    ...js,
    _id: js._id,
    name: js.name,
    email: js.email,
    category: 'Job Seeker',
    status: js.status,
    createdAt: js.createdAt,
    // Add other relevant fields if needed by the frontend
  }));

  // Combine and sort by createdAt descending
  const allUsers = [...users, ...normalizedJobSeekers].sort((a, b) => {
    return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
  });

  return allUsers;
}

export async function updateUserStatus(userId: string, status: UserStatus) {
  await connectDB();
  let user = await UserModel.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).lean<IUser | null>();

  if (!user) {
    user = await JobSeekerModel.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    ).lean();
  }
  return user;
}

export async function deleteUser(userId: string) {
  await connectDB();
  let result = await UserModel.findByIdAndDelete(userId);
  if (!result) {
    result = await JobSeekerModel.findByIdAndDelete(userId);
  }
  return result;
}

