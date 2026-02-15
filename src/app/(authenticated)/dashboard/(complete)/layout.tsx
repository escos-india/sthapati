import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import * as React from 'react';

export default async function DashboardCompleteLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) redirect("/login");

    const user = session.user as any;

    if (!user.isProfileComplete) {
        redirect('/dashboard/edit-profile');
    }

    return <>{children}</>;
}
