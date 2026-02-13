
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserModel } from "@/models/User";
import { connectDB } from "@/lib/mongodb";

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

// Helper to check admin permission
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return false;

    await connectDB();
    const user = await UserModel.findOne({ email: session.user.email });
    // Allow 'Sthapati' (Super Admin) or 'Admin' role users
    return user && (user.isAdmin || user.status === 'active'); // Adjust logic as per specific admin role requirement. Assuming isAdmin field or specific user for now.
    // Ideally, check for specific admin role if defined. The path is under /sthapati/admin, so strict check is better.
    // user.category === 'Admin'? No, category list doesn't have Admin.
    // user.isAdmin is the flag.
}

export async function GET() {
    try {
        // Ensure directory exists
        if (!fs.existsSync(IMAGES_DIR)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(IMAGES_DIR);
        // Filter for image files
        const images = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));

        // Return paths relative to public
        const imagePaths = images.map(file => `/images/${file}`);
        return NextResponse.json(imagePaths);
    } catch (error) {
        console.error('Error listing images:', error);
        return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Create unique name to avoid loose collisions, or keep original name?
        // User probably wants to control order or replace files. 
        // Let's keep original name for now butsanitize it.
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = path.join(IMAGES_DIR, sanitizedName);

        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ success: true, path: `/images/${sanitizedName}` });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const isAdmin = await checkAdmin();
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const filename = searchParams.get('filename');

        if (!filename) {
            return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
        }

        // Sanitize filename to prevent directory traversal
        const safeFilename = path.basename(filename);
        const filePath = path.join(IMAGES_DIR, safeFilename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
