import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { handleError, asyncHandler } from '@/lib/error-handler';
import { UserModel } from '@/models/User';
import { logger } from '@/lib/logger';

export const GET = asyncHandler(async (req: Request) => {
  try {
    await connectDB();

    // Get user ID from query params or headers (adjust based on your auth implementation)
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { message: 'User ID is required', code: 'MISSING_USER_ID' } },
        { status: 400 }
      );
    }

    const user = await UserModel.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    logger.info('User fetched successfully', { userId });

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error('Error fetching user', error as Error);
    return handleError(error);
  }
});
