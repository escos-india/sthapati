import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

// GET: Fetch current user's materials
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.materials || []);

    } catch (error) {
        console.error("Error fetching materials:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Add new material
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.category !== 'Material Supplier') {
            return NextResponse.json({ message: "Forbidden: Material Suppliers only" }, { status: 403 });
        }

        const body = await req.json();
        const { name, type, description, price, quantity, photos } = body;

        if (!name || !price) {
            return NextResponse.json({ message: "Name, and Price are required" }, { status: 400 });
        }

        const newMaterial = {
            name,
            type: type || 'General',
            description,
            price,
            quantity,
            photos: photos || []
        };

        user.materials.push(newMaterial);
        await user.save();

        return NextResponse.json({ message: "Material added", material: user.materials[user.materials.length - 1] }, { status: 201 });

    } catch (error) {
        console.error("Error adding material:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PUT: Update material
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const body = await req.json();
        const { id, name, type, description, price, quantity, photos } = body;

        if (!id) {
            return NextResponse.json({ message: "Material ID is required" }, { status: 400 });
        }

        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const material = user.materials.id(id);
        if (!material) {
            return NextResponse.json({ message: "Material not found" }, { status: 404 });
        }

        // Update fields
        material.name = name || material.name;
        material.type = type || material.type;
        material.description = description || material.description;
        material.price = price || material.price;
        material.quantity = quantity || material.quantity;
        if (photos) material.photos = photos;

        await user.save();

        return NextResponse.json({ message: "Material updated", material });

    } catch (error) {
        console.error("Error updating material:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove material
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ message: "Material ID is required" }, { status: 400 });
        }

        await connectDB();
        const user = await UserModel.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Use $pull to remove the item from array
        // Note: Mongoose document array pull method is cleaner but requires saving
        user.materials.pull({ _id: id });
        await user.save();

        return NextResponse.json({ message: "Material deleted" });

    } catch (error) {
        console.error("Error deleting material:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
