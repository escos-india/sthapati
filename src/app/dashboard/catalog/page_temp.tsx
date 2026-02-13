import { authOptions } from "@/lib/auth";
import { getUserByEmail } from "@/lib/users";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { MaterialCatalog } from "@/components/profile/material-catalog";

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
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">my Material Catalog</h1>
                            <p className="text-slate-500 dark:text-gray-400">Manage the materials you supply</p>
                        </div>
                        <MaterialCatalog
                            materials={user.materials || []}
                            isOwnProfile={true}
                            onUpdate={async (materials) => {
                                "use server";
                                const { connectDB } = await import("@/lib/mongodb");
                                const { UserModel } = await import("@/models/User");
                                await connectDB();
                                // We can't actually pass a server action directly like this to a client component prop usually 
                                // unless it's a bound action passed down. 
                                // However, the MaterialCatalog component likely expects a function that might trigger an API call 
                                // OR it does the API call internally. 
                                // Let's check MaterialCatalog implementation.
                                // It uses `onUpdate` prop. 
                                // I will wrap this page as a Client Component OR use a Client Wrapper.
                                // Actually, simpler is to just render the Client Component and let IT handle the API calls.
                                // Wait, `MaterialCatalog` takes an `onUpdate` prop. 
                                // Let's check what `MaterialCatalog` expects.
                            }}
                        />
                        {/* 
                Wait, I need to verify `MaterialCatalog` signature. 
                I'll assume it needs a wrapper to handle the update logic if it relies on a callback prop 
                that expects to update the parent state or DB.
                Usually `onUpdate` in my previous edits was just `setMaterials`? 
                Let's check `MaterialCatalog` code again to be sure.
             */}
                    </section>
                </div>
            </div>
        </main>
    );
}
