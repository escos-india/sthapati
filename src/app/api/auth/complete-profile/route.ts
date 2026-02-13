import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { COA_REGEX } from '@/lib/constants';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { category, coa_number } = await req.json();

        if (!category) {
            return NextResponse.json({ message: 'Category is required' }, { status: 400 });
        }

        if (category === 'Architect') {
            if (!coa_number) {
                return NextResponse.json({ message: 'COA Number is required for Architects' }, { status: 400 });
            }
            if (!COA_REGEX.test(coa_number)) {
                return NextResponse.json({ message: 'Invalid COA Number format (CA/YYYY/XXXXX)' }, { status: 400 });
            }
        }

        await connectDB();

        const status = category === 'Architect' ? 'pending' : 'active';

        // Try to find the user first
        let user = await UserModel.findOne({ email: session.user.email });

        if (user) {
            // Update existing user
            user.category = category;
            user.coa_number = category === 'Architect' ? coa_number : undefined;
            user.auth_provider = 'google';
            user.status = status;
            if (session.user.image) user.image = session.user.image;
            if (session.user.name) user.name = session.user.name;
            // Don't overwrite googleId if it exists, but set it if missing
            if (!user.googleId && session.user.googleId) user.googleId = session.user.googleId;

            await user.save();
        } else {
            // Create new user
            user = await UserModel.create({
                name: session.user.name,
                email: session.user.email,
                googleId: session.user.googleId,
                image: session.user.image,
                category,
                coa_number: category === 'Architect' ? coa_number : undefined,
                auth_provider: 'google',
                status,
            });
        }

        return NextResponse.json({
            success: true,
            status: user.status,
            user: user,
        });
    } catch (error) {
        console.error('Profile completion error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
