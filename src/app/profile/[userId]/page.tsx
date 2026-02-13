import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";
import { PostModel } from "@/models/Post";
import { PublicProfileHeader } from "@/components/profile/public-profile-header";
import { PublicProfileDetails } from "@/components/profile/public-profile-details";
import { PublicProfileGallery } from "@/components/profile/public-profile-gallery";
import { PublicProfileArticles } from "@/components/profile/public-profile-articles";
import { PublicProfilePortfolio } from "@/components/profile/public-profile-portfolio";
import { PublicProfileAssociates } from "@/components/profile/public-profile-associates";
import { ConnectionRequestModel } from "@/models/ConnectionRequest";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import { JobModel } from "@/models/Job";
import { HIRING_ELIGIBLE_CATEGORIES } from "@/lib/constants";

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const session = await getServerSession(authOptions);

    try {
        await connectDB();
        const rawUser = await UserModel.findById(userId)
            .select("-password -verificationToken -resetPasswordToken")
            .populate({
                path: 'connections',
                select: 'name image headline category',
                strictPopulate: false
            })
            .populate({
                path: 'associates',
                select: 'name image headline category',
                strictPopulate: false
            })
            .lean();

        if (!rawUser) {
            redirect("/");
            return null;
        }

        // Get article count
        const articleCount = await PostModel.countDocuments({ author: userId });

        // Get job post count for hiring badge
        const HIRING_ROLES = HIRING_ELIGIBLE_CATEGORIES as unknown as string[];
        let jobPostCount = 0;
        if (HIRING_ROLES.includes(rawUser.category)) {
            jobPostCount = await JobModel.countDocuments({ posted_by: userId, status: 'active' });
        }

        const user = JSON.parse(JSON.stringify({
            ...rawUser,
            articleCount,
            jobPostCount,
        }));

        const isOwnProfile = session?.user?.email === user.email;

        // Fetch Current Viewer User (if logged in)
        let currentUser;
        let connectionStatus: "none" | "pending" | "connected" | "received" = "none";

        if (session?.user?.email) {
            currentUser = await getUserByEmail(session.user.email);
            if (currentUser && !isOwnProfile) {
                // Check if already connected (Using strings for comparison)
                if (currentUser.connections && currentUser.connections.some((id: any) => id.toString() === user._id)) {
                    connectionStatus = "connected";
                } else {
                    // Check for pending requests
                    const outgoingRequest = await ConnectionRequestModel.findOne({
                        sender: currentUser._id,
                        recipient: user._id,
                        status: "pending"
                    });

                    if (outgoingRequest) {
                        connectionStatus = "pending";
                    } else {
                        const incomingRequest = await ConnectionRequestModel.findOne({
                            sender: user._id,
                            recipient: currentUser._id,
                            status: "pending"
                        });
                        if (incomingRequest) {
                            connectionStatus = "received";
                        }
                    }
                }
            }
        }

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-black/20">
                <div className="max-w-5xl mx-auto px-0 md:px-4 py-8">

                    {/* New Full Width Header */}
                    <PublicProfileHeader
                        user={user}
                        isOwnProfile={isOwnProfile}
                        initialConnectionStatus={connectionStatus}
                        jobPostCount={jobPostCount}
                    />

                    {/* Main Feed Content - Full Width */}
                    <div className="mt-6">
                        <PublicProfileDetails user={user} />

                        {/* Associates Section */}
                        <PublicProfileAssociates associates={user.associates} />

                        {/* Restored Content: Projects, Resume, Materials */}
                        <PublicProfilePortfolio user={user} />

                        {/* Gallery Section */}
                        <PublicProfileGallery gallery={user.gallery} userId={user._id} />

                        {/* Articles Section */}
                        <PublicProfileArticles userId={user._id} currentUser={JSON.parse(JSON.stringify(currentUser || null))} />
                    </div>

                </div>
            </div>
        );
    } catch (error) {
        console.error("Error loading profile:", error);
        redirect("/");
        return null;
    }
}
