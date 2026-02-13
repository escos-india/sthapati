import { NextResponse } from 'next/server';
import { getAllUsers, updateUserStatus, deleteUser } from '@/lib/users';
import { handleError, asyncHandler, AppError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

export const GET = asyncHandler(async () => {
  try {
    const users = await getAllUsers();
    logger.info('Admin fetched all users', { count: users.length });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    logger.error('Error fetching users for admin', error as Error);
    return handleError(error);
  }
});

export const PATCH = asyncHandler(async (request: Request) => {
  try {
    const { userId, action } = await request.json();

    if (!userId || !['approve', 'reject', 'ban', 'unban'].includes(action)) {
      throw new AppError('Invalid payload. userId and action (approve/reject/ban/unban) are required.', 400, 'INVALID_PAYLOAD');
    }

    let status: 'active' | 'rejected' | 'banned';
    if (action === 'approve' || action === 'unban') status = 'active';
    else if (action === 'reject') status = 'rejected';
    else status = 'banned';

    const updated = await updateUserStatus(userId, status);

    if (!updated) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    logger.info(`User status updated`, {
      userId,
      email: updated.email,
      status,
      action,
    });

    return NextResponse.json({
      success: true,
      user: updated,
      message: `User ${updated.email} has been ${status}.`,
    });
  } catch (error) {
    logger.error('Error updating user status', error as Error);
    return handleError(error);
  }
});

export const DELETE = asyncHandler(async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      throw new AppError('userId is required', 400, 'MISSING_USER_ID');
    }

    const deleted = await deleteUser(userId);

    if (!deleted) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    logger.info(`User deleted`, { userId });

    return NextResponse.json({
      success: true,
      message: 'User removed successfully.',
    });
  } catch (error) {
    logger.error('Error deleting user', error as Error);
    return handleError(error);
  }
});

