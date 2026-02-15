import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import { redirect } from "next/navigation";
import { ProfileContainer } from "@/components/dashboard/profile/profile-container";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const user = await getUserByEmail(session.user.email);

    if (!user) {
        redirect("/login");
    }

    // Ensure user object is serializable (Mongoose documents might have non-serializable fields if not leaned properly, but getUserByEmail uses .lean())
    // Also need to handle Date objects if they are not automatically serialized by Next.js server components (they are usually fine, but sometimes need toStrig)
    // Next.js passes props from Server to Client components, and they must be serializable.
    // Dates are serializable as strings in JSON, but Next.js warns about Date objects.
    // I'll assume .lean() returns Date objects. I might need to convert them to strings.
    // Actually, let's just pass it. If it fails, I'll fix it.
    // To be safe, I'll JSON stringify and parse.

    const serializedUser = JSON.parse(JSON.stringify(user));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black py-8 px-4 sm:px-6 lg:px-8">
            <ProfileContainer initialUser={serializedUser} />
        </div>
    );
}
