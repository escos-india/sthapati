import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';

// GET: List pending architects
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        // TODO: Add proper admin check here
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const architects = await UserModel.find({
            category: 'Architect',
            status: 'pending',
        }).sort({ createdAt: -1 });

        return NextResponse.json(architects);
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST: Approve or Reject
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id, action } = await req.json();

        if (!id || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
        }

        await connectDB();

        const newStatus = action === 'approve' ? 'active' : 'rejected';

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            { status: newStatus },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
