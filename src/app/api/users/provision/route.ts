import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { USER_CATEGORIES } from '@/lib/constants';
import { createUserFromOAuth, getUserByEmail } from '@/lib/users';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user?.googleId) {
    return NextResponse.json(
      { message: 'Unauthorized. Please sign in with Google first.' },
      { status: 401 }
    );
  }

  const payload = await request.json();
  const category = payload?.category as string;

  if (!category || !USER_CATEGORIES.includes(category as (typeof USER_CATEGORIES)[number])) {
    return NextResponse.json(
      { message: 'Please choose a valid category.' },
      { status: 400 }
    );
  }

  const existing = await getUserByEmail(session.user.email);

  if (existing) {
    return NextResponse.json(
      { message: 'An account already exists for this email.' },
      { status: 409 }
    );
  }

  const user = await createUserFromOAuth({
    name: session.user.name ?? 'Sthapati Member',
    email: session.user.email,
    googleId: session.user.googleId,
    image: session.user.image,
    category: category as (typeof USER_CATEGORIES)[number],
  });

  return NextResponse.json({ user }, { status: 201 });
}

