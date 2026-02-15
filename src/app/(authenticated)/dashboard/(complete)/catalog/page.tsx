import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardCatalogClient } from "./page-client";

export const dynamic = 'force-dynamic';

export default async function DashboardCatalogPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    const rawUser = await getUserByEmail(session.user.email);

    if (!rawUser) {
        redirect("/register");
    }

    // Only allow Material Suppliers
    if (rawUser.category !== "Material Supplier") {
        redirect("/dashboard");
    }

    const user = JSON.parse(JSON.stringify(rawUser));

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Sidebar */}
                    <aside className="lg:col-span-3">
                        <DashboardSidebar user={user} />
                    </aside>

                    {/* Main Content */}
                    <section className="lg:col-span-9">
                        <DashboardCatalogClient user={user} />
                    </section>
                </div>
            </div>
        </main>
    );
}
