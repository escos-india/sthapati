import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardFeed } from "@/components/dashboard/dashboard-feed";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardRightPanel } from "@/components/dashboard/dashboard-right-panel";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const rawUser = await getUserByEmail(session.user.email);

  if (!rawUser) {
    redirect("/register");
  }

  if (rawUser.status !== "active") {
    redirect(`/auth/status?state=${rawUser.status}`);
  }

  // Fetch article count
  const { connectDB } = await import("@/lib/mongodb");
  const { PostModel } = await import("@/models/Post");
  await connectDB();
  const articleCount = await PostModel.countDocuments({ author: rawUser._id });

  const user = JSON.parse(JSON.stringify({
    ...rawUser,
    articleCount,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#fdfaf6] via-white to-[#eef2ff] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Sidebar - Profile & Connections */}
          <aside className="lg:col-span-3">
            <DashboardSidebar user={user} />
          </aside>

          {/* Main Feed */}
          <section className="lg:col-span-6">
            <DashboardFeed user={user} filterUserId={user._id} />
          </section>

          {/* Right Panel - Suggestions & Activity */}
          <aside className="lg:col-span-3">
            <DashboardRightPanel user={user} />
          </aside>
        </div>
      </div>
    </main>
  );
}
