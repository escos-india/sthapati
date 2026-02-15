import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { getToken } from 'next-auth/jwt';
import mime from 'mime';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    // 1. Check Authentication using JWT token (more reliable than getServerSession in route handlers)
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // In Next.js 15+, params is a Promise and must be awaited
        const { filename } = await params;

        // 2. Prevent Directory Traversal
        const safeFilename = path.basename(filename);
        const uploadsDir = path.join(process.cwd(), 'uploads');
        const filepath = path.join(uploadsDir, safeFilename);

        // 3. Check if file exists
        try {
            await stat(filepath);
        } catch (e) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // 4. Read file
        const fileBuffer = await readFile(filepath);

        // 5. Determine Content Type
        const contentType = mime.getType(filepath) || 'application/octet-stream';

        // 6. Return File
        return new NextResponse(fileBuffer as any, {

            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch (error) {
        console.error('Error serving file:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
