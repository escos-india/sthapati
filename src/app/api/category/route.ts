import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get("category");

        if (!category) {
            return NextResponse.json(
                { message: "Category parameter required" },
                { status: 400 }
            );
        }

        // Map slugs to database categories
        const categoryMap: Record<string, string[]> = {
            'professionals': ['Architect', 'Professional'], // Assumption based on typical classification
            'agencies': ['Agency'],
            'builders': ['Builder'],
            'contractors': ['Contractor'],
            'material-suppliers': ['Material Supplier'],
            'educational-institutes': ['Educational Institute'],
            'students': ['Student'],
            // Fallback for direct matches or exact slug usage
            'architects': ['Architect'],
            'job-seekers': ['Job Seeker']
        };

        // Normalize category slug
        const normalizeSlug = (s: string) => s.toLowerCase().trim();
        const slug = normalizeSlug(category);

        // Determine target categories
        let targetCategories = categoryMap[slug];

        // If not found in map, try to match directly (case-insensitive) or use as-is
        if (!targetCategories) {
            // Try to find a case-insensitive match in user categories
            const directMatch = ['Architect', 'Contractor', 'Builder', 'Agency', 'Material Supplier', 'Educational Institute', 'Student', 'Professional', 'Job Seeker']
                .find(c => c.toLowerCase() === slug);

            targetCategories = directMatch ? [directMatch] : [category];
        }

        await connectDB();
        const users = await UserModel.find({
            category: { $in: targetCategories },
            isProfileComplete: true,
        })
            .select("name image headline category location bio cover_image")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching category users:", error);
        return NextResponse.json(
            { message: "Failed to fetch users" },
            { status: 500 }
        );
    }
}
