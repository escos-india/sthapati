import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import * as React from 'react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    // Double check session (though parent checked it)
    if (!session?.user) redirect("/login");

    if (!(session.user as any).isAdmin) {
        redirect("/login");
    }

    return <>{children}</>;
}
