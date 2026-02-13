"use client";

import { useState } from "react";
import { IUser } from "@/types/user";
import { ProfileHeader } from "./profile-header";
import { ProfileAbout } from "./profile-about";
import { ProfileExperience } from "./profile-experience";
import { ProfileEducation } from "./profile-education";
import { ProfileSkills } from "./profile-skills";
import { ProfileProjects } from "./profile-projects";
import { ProfileServices } from "./profile-services";
import { ProfileCertifications } from "./profile-certifications";
import { ProfileContact } from "./profile-contact";
import { ProfileGallery } from "./profile-gallery";
import { useToast } from "@/hooks/use-toast";

interface ProfileContainerProps {
    initialUser: IUser;
}

export function ProfileContainer({ initialUser }: ProfileContainerProps) {
    const [user, setUser] = useState<IUser>(initialUser);
    const { toast } = useToast();

    const handleUpdate = async (data: Partial<IUser>) => {
        try {
            const response = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error("Failed to update profile");

            const updatedUser = await response.json();
            setUser(updatedUser.user);

            toast({
                title: "Profile updated",
                description: "Your changes have been saved successfully.",
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to save changes. Please try again.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <ProfileHeader user={user} onUpdate={handleUpdate} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <ProfileAbout user={user} onUpdate={handleUpdate} />
                    <ProfileExperience user={user} onUpdate={handleUpdate} />
                    <ProfileProjects user={user} onUpdate={handleUpdate} />
                    <ProfileGallery user={user} onUpdate={handleUpdate} />
                    <ProfileEducation user={user} onUpdate={handleUpdate} />
                    <ProfileCertifications user={user} onUpdate={handleUpdate} />
                </div>

                <div className="space-y-6">
                    <ProfileContact user={user} onUpdate={handleUpdate} />
                    <ProfileServices user={user} onUpdate={handleUpdate} />
                    <ProfileSkills user={user} onUpdate={handleUpdate} />
                </div>
            </div>
        </div>
    );
}
