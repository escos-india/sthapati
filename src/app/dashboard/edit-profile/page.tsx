"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";
import { COA_REGEX } from "@/lib/constants";

import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileInfo } from "@/components/profile/profile-info";
import { ProfileAbout } from "@/components/profile/profile-about";
import { ProfileProjects } from "@/components/profile/profile-projects";
import { ProfileGallery } from "@/components/profile/profile-gallery";
import { StudentSection } from "@/components/profile/student-section";
import { MaterialCatalog } from "@/components/profile/material-catalog";
import { CourseCatalog } from "@/components/profile/course-catalog";
import { ProfileEducation } from "@/components/dashboard/profile/profile-education";
import type { IUser } from "@/types/user";

// Types
interface ProfileProject {
    title: string;
    description: string;
    role: string;
    location: string;
    year: string;
    budget_range: string;
    tags: string;
    media: { url: string; type: 'image' | 'video' }[];
}

interface GalleryItem {
    url: string;
    type: 'image' | 'video';
    title?: string;
}

interface EditProfileFormState {
    name: string;
    phone?: string;
    email?: string;
    image: string;
    cover_image: string;
    headline: string;
    bio: string;
    location: {
        city: string;
        state: string;
        country: string;
        address: string;
    };
    projects: ProfileProject[];
    gallery: GalleryItem[];
    category?: string;
    certificatesStatus?: string;
    specialization?: string;
    resume?: string;
    materials?: any[];
    education?: any[];
    courses?: any[]; // Added courses
    coa_number?: string;
}

export default function EditProfilePage() {
    const router = useRouter();
    const { data: session, status, update } = useSession();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [profile, setProfile] = useState<EditProfileFormState>({
        name: "",
        email: "",
        image: "",
        cover_image: "",
        headline: "",
        bio: "",
        location: { city: "", state: "", country: "", address: "" },
        projects: [],
        gallery: [],
        category: "",
        certificatesStatus: "",
        specialization: "",
        resume: "",
        education: [],
        materials: [],
        courses: []
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        if (session?.user) {
            setProfile(prev => ({
                ...prev,
                name: session.user?.name || "",
                email: session.user?.email || "",
                image: session.user?.image || "",
            }));
            fetchProfile();
        }
    }, [session, status]);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/user/profile");
            if (res.ok) {
                const data = await res.json();
                setProfile(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error("Failed to fetch profile");
        }
    };

    // Generic Save Function
    const saveProfile = async (updatedProfile: EditProfileFormState, complete: boolean = false) => {
        // Validate COA if present
        if (updatedProfile.coa_number && !COA_REGEX.test(updatedProfile.coa_number)) {
            toast({
                title: "Invalid COA Number",
                description: "Format must be CA/YYYY/XXXXX",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...updatedProfile, complete }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                let errorMessage = errorData.error || "Failed to save";

                if (errorData.details && Array.isArray(errorData.details)) {
                    // Format Zod errors
                    const details = errorData.details.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
                    errorMessage += ` (${details})`;
                }

                throw new Error(errorMessage);
            }

            const data = await res.json();
            setProfile(updatedProfile); // Update local state with latest

            if (complete) {
                // Force session update to persist changes to the token
                await update({
                    trigger: "update",
                    isProfileComplete: true
                });

                toast({ title: "Profile Completed!", description: "Welcome to your dashboard." });
                router.push("/dashboard");
            } else {
                toast({ title: "Saved", description: "Changes saved successfully." });
            }
        } catch (error: any) {
            console.error("Save Error:", error);
            toast({
                title: "Error",
                description: error.message || "Could not save profile.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Component Handlers
    const handleImageUpdate = (url: string) => {
        const newProfile = { ...profile, image: url };
        setProfile(newProfile); // Optimistic update
        saveProfile(newProfile);
    };

    const handleCoverUpdate = (url: string) => {
        const newProfile = { ...profile, cover_image: url };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleInfoUpdate = (headline: string, location: any) => {
        const newProfile = { ...profile, headline, location };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleAboutUpdate = (bio: string) => {
        const newProfile = { ...profile, bio };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleProjectsUpdate = (projects: ProfileProject[]) => {
        const newProfile = { ...profile, projects };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleGalleryUpdate = (gallery: GalleryItem[]) => {
        const newProfile = { ...profile, gallery };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleStudentUpdate = (certificatesStatus: string, specialization: string, resume?: string) => {
        const newProfile = { ...profile, certificatesStatus, specialization, resume };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleEducationUpdate = async (data: Partial<IUser>) => {
        const newProfile = { ...profile, ...data };
        setProfile(newProfile as EditProfileFormState);
        await saveProfile(newProfile as EditProfileFormState);
    };

    const handleMaterialsUpdate = (materials: any[]) => {
        const newProfile = { ...profile, materials };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    const handleCoursesUpdate = (courses: any[]) => {
        const newProfile = { ...profile, courses };
        setProfile(newProfile);
        saveProfile(newProfile);
    };

    // Completion Logic
    const isStudent = profile.category === 'Student';
    const isMaterialSupplier = profile.category === 'Material Supplier';

    // Mandatory Fields
    const isBasicValid = profile.name && profile.image && profile.headline;
    const isCoverValid = !!profile.cover_image;
    const isDetailsValid = profile.location.city && profile.location.country && profile.bio && profile.location.address;
    const isProjectValid = profile.projects.length > 0 && profile.projects.every(p => p.title && p.description && p.media.length > 0);
    const isGalleryValid = isStudent ? true : profile.gallery.length > 0; // Gallery not mandatory for students
    const isStudentValid = isStudent ? (!!profile.certificatesStatus && !!profile.specialization && !!profile.resume) : true;
    const isMaterialValid = isMaterialSupplier ? (profile.materials && profile.materials.length > 0) : true;

    // Determine if can finish
    const canFinish = isBasicValid && isCoverValid && isDetailsValid && isProjectValid && isGalleryValid && isStudentValid && isMaterialValid;

    // Calculate Percentage
    let totalSteps = 6; // PFP, Cover, Headline/Info, Bio, Projects, Gallery
    if (isStudent) totalSteps = 7; // Add student fields
    if (isMaterialSupplier) totalSteps = 7; // Add materials

    let completedSteps = 0;
    if (profile.image) completedSteps++;
    if (profile.cover_image) completedSteps++;
    if (profile.headline && profile.location.city && profile.location.address) completedSteps++;
    if (profile.bio) completedSteps++;
    if (isProjectValid) completedSteps++;
    if (!isStudent && isGalleryValid) completedSteps++;
    if (isStudent && profile.certificatesStatus && profile.specialization && profile.resume) completedSteps += 2;
    if (isMaterialSupplier && isMaterialValid) completedSteps++;

    const progress = Math.round((completedSteps / totalSteps) * 100);

    // Calculate Missing Fields
    const missingFields = [];
    if (!profile.image) missingFields.push("Profile Picture");
    if (!profile.cover_image) missingFields.push("Cover Image");
    if (!profile.headline) missingFields.push("Headline");

    if (!profile.location.city) missingFields.push("City");
    if (!profile.location.country) missingFields.push("Country");
    if (!profile.location.address) missingFields.push("Address");
    if (!profile.bio) missingFields.push("About/Bio");
    if (profile.projects.length === 0) missingFields.push("At least 1 Project");
    if (!isStudent && profile.gallery.length === 0) missingFields.push("At least 1 Gallery Item");
    if (isStudent && !profile.certificatesStatus) missingFields.push("Certificates Status");
    if (isStudent && !profile.specialization) missingFields.push("Specialization");
    if (isStudent && !profile.resume) missingFields.push("Resume (PDF)");
    if (isMaterialSupplier && (!profile.materials || profile.materials.length === 0)) missingFields.push("At least 1 Material");

    if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-cyan-500" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans transition-colors duration-300">
            {/* Sticky Header */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>
                        <p className="text-xs text-slate-500">
                            {isStudent ? "Student Profile (Optional Completion)" : `Profile Completion: `}
                            {!isStudent && <span className="font-medium text-cyan-600">{progress}%</span>}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                        <Button
                            onClick={() => saveProfile(profile, true)}
                            disabled={!canFinish || isSaving}
                            className={`min-w-[140px] ${canFinish ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-400 cursor-not-allowed'} text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                            {canFinish ? "Complete" : "Incomplete"}
                        </Button>
                        {!canFinish && !isStudent && missingFields.length > 0 && (
                            <div className="text-[10px] text-red-500 font-medium text-right max-w-[200px] leading-tight">
                                Missing: {missingFields.slice(0, 3).join(", ")} {missingFields.length > 3 && `+${missingFields.length - 3} more`}
                            </div>
                        )}
                    </div>
                </div>
                {/* Progress Bar (Only for Non-Students) */}
                {!isStudent && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-0 pt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* 1. Header & Identity + 2. Basic Info (Merged) */}
                <div className="flex flex-col">
                    <ProfileHeader
                        cover_image={profile.cover_image}
                        onCoverChange={handleCoverUpdate}
                    />
                    <ProfileInfo
                        name={profile.name}
                        headline={profile.headline}
                        location={profile.location}
                        image={profile.image}
                        category={profile.category}

                        onImageChange={handleImageUpdate}
                        onSave={handleInfoUpdate}
                    />
                </div>

                {/* 3. About Section */}
                <ProfileAbout
                    bio={profile.bio}
                    onSave={handleAboutUpdate}
                />

                {/* 4. Projects Section */}
                <ProfileProjects
                    projects={profile.projects}
                    onUpdate={handleProjectsUpdate}
                />

                {/* 5. Gallery Section (Not mandatory for students) */}
                {!isStudent && (
                    <ProfileGallery
                        gallery={profile.gallery}
                        onUpdate={handleGalleryUpdate}
                    />
                )}

                {/* 6. Student-Specific Section */}
                {isStudent && (
                    <>
                        <ProfileEducation user={profile as unknown as IUser} onUpdate={handleEducationUpdate} />
                        <StudentSection
                            certificatesStatus={profile.certificatesStatus}
                            specialization={profile.specialization}
                            resume={profile.resume}
                            onUpdate={handleStudentUpdate}
                        />
                    </>
                )}

                {/* 7. Material Supplier Catalog */}
                {isMaterialSupplier && (
                    <MaterialCatalog
                        materials={profile.materials}
                        onUpdate={handleMaterialsUpdate}
                    />
                )}

                {/* 8. Educational Institute Courses */}
                {profile.category === 'Educational Institute' && (
                    <CourseCatalog
                        courses={profile.courses}
                        onUpdate={handleCoursesUpdate}
                    />
                )}

                <div className="h-12"></div> {/* Spacer */}
            </div>
        </div>
    );
}

// Helper icon
function X({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>;
}
