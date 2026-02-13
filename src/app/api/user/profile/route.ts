import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { COA_REGEX } from '@/lib/constants';
import { connectToDatabase } from '@/lib/mongodb';
import { UserModel } from '@/models/User';
import { z } from 'zod';

import { JobSeekerModel } from '@/models/JobSeeker';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Check if user is a Job Seeker (based on session flag or lookup)
    if ((session.user as any).isJobSeeker) {
        const jobSeeker = await JobSeekerModel.findOne({ email: session.user.email }).select('-password -__v');
        if (!jobSeeker) {
            return NextResponse.json({ error: 'Job Seeker not found' }, { status: 404 });
        }
        // Augment with category for frontend consistency
        return NextResponse.json({ ...jobSeeker.toObject(), category: 'Job Seeker' });
    }

    const user = await UserModel.findOne({ email: session.user.email }).select('-password -__v');

    if (!user) {
        // Fallback: check if it's a job seeker even if flag wasn't perfectly set (e.g. old session)
        const jobSeeker = await JobSeekerModel.findOne({ email: session.user.email }).select('-password -__v');
        if (jobSeeker) {
            return NextResponse.json({ ...jobSeeker.toObject(), category: 'Job Seeker' });
        }
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
}

// Validation Schema for Strict Completion
// We need conditional schemas based on category
const projectSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    role: z.string().min(1),
    media: z.array(z.object({
        url: z.string().min(1),
        type: z.enum(['image', 'video'])
    })).min(1, "At least one image is required per project"),
});

const gallerySchema = z.object({
    url: z.string().min(1),
    type: z.enum(['image', 'video']),
    title: z.string().optional()
});

export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { complete, ...updateData } = body;

        await connectToDatabase();
        await connectToDatabase();

        let user: any = null;
        let isJobSeeker = (session.user as any).isJobSeeker;

        if (isJobSeeker) {
            user = await JobSeekerModel.findOne({ email: session.user.email });
        } else {
            user = await UserModel.findOne({ email: session.user.email });
        }

        if (!user) {
            // Fallback lookup
            if (!isJobSeeker) {
                user = await JobSeekerModel.findOne({ email: session.user.email });
                if (user) isJobSeeker = true;
            }
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update Fields
        if (updateData.name) user.name = updateData.name;
        if (updateData.image) user.image = updateData.image;
        if (updateData.cover_image) user.cover_image = updateData.cover_image;
        if (updateData.headline) user.headline = updateData.headline;
        if (updateData.bio) user.bio = updateData.bio;
        if (updateData.phone) user.phone = updateData.phone;

        if (updateData.location) {
            user.location = { ...user.location, ...updateData.location };
        }

        if (updateData.projects) user.projects = updateData.projects;
        if (updateData.gallery) user.gallery = updateData.gallery;
        if (updateData.coa_number) user.coa_number = updateData.coa_number;
        if (updateData.certificatesStatus) user.certificatesStatus = updateData.certificatesStatus;
        if (updateData.specialization) user.specialization = updateData.specialization;
        if (updateData.resume) user.resume = updateData.resume;
        if (updateData.materials) user.materials = updateData.materials;
        if (updateData.education) user.education = updateData.education;
        if (updateData.experience) user.experience = updateData.experience; // Added experience
        if (updateData.courses) user.courses = updateData.courses; // Added courses

        let isComplete = false;

        if (complete) {
            // BASIC VALIDATION FOR ALL
            if (!user.name || !user.image || !user.headline || !user.bio || !user.phone ||
                !user.location?.city || !user.location?.country || !user.location?.address) {
                return NextResponse.json({
                    error: "Profile incomplete",
                    details: "Basic details (Name, Image, Headline, Bio, Phone, Location) are required for all users."
                }, { status: 400 });
            }

            // Student Exemption
            if (user.category === 'Student') {
                if (!user.cover_image || !user.projects?.length || !user.certificatesStatus || !user.specialization || !user.resume) {
                    return NextResponse.json({
                        error: "Profile incomplete",
                        details: "Students must complete all fields including certificates, specialization, and resume. Gallery is optional."
                    }, { status: 400 });
                }
                isComplete = true;
                isComplete = true;
            }
            // Job Seeker Exemption
            else if (user.category === 'Job Seeker') {
                if (!user.resume || !user.location?.city) {
                    return NextResponse.json({
                        error: "Profile incomplete",
                        details: "Job Seekers must provide a resume and location."
                    }, { status: 400 });
                }
                isComplete = true;
            }
            // Material Supplier Exemption
            else if (user.category === 'Material Supplier') {
                if ((!user.materials || user.materials.length === 0)) {
                    return NextResponse.json({
                        error: "Profile incomplete",
                        details: "Material Suppliers must add at least one material to their catalog."
                    }, { status: 400 });
                }
                isComplete = true;
            }
            // Educational Institute Exemption
            else if (user.category === 'Educational Institute') {
                if ((!user.courses || user.courses.length === 0)) {
                    return NextResponse.json({
                        error: "Profile incomplete",
                        details: "Educational Institutes must add at least one course."
                    }, { status: 400 });
                }
                isComplete = true;
            }
            // Architects & Professionals (Default Strict)
            else {
                // Strict Validation for Architects/Designers
                try {
                    // Check Projects (Mandatory for Portfolio-based roles)
                    const tempSchema = z.object({
                        projects: z.array(projectSchema).min(1, "At least one project is required"),
                        gallery: z.array(gallerySchema).min(1, "At least one gallery item is required"),
                    });

                    tempSchema.parse({
                        projects: user.projects,
                        gallery: user.gallery || []
                    });

                    // Architect Specific
                    if (user.category === 'Architect' && !user.coa_number) {
                        throw new Error("Architects must provide a COA Number.");
                    }

                    isComplete = true;

                } catch (validationError) {
                    return NextResponse.json({
                        error: "Profile incomplete",
                        details: validationError instanceof z.ZodError ? validationError.errors : (validationError as any).message
                    }, { status: 400 });
                }
            }
        }

        // Update Status
        if (isComplete) {
            user.isProfileComplete = true;
        } else if (complete === false) {
            // Logic to potentially downgrade status if they remove mandatory fields could go here, 
            // but simplified for now: if they explicitly asked to Complete and failed, we error. 
            // If they are just saving (complete=false), we don't change isProfileComplete generally,
            // UNLESS we want to force re-verification. 
            // For now, let's keep it simple.
        }

        await user.save();

        return NextResponse.json({ success: true, user });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
