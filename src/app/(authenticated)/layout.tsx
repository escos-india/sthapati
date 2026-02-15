import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import * as React from 'react';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    const user = session.user as any;
    const status = user.status;

    if (status === 'pending') {
        redirect('/auth/status?state=pending');
    }
    if (status === 'banned') {
        redirect('/auth/status?state=banned');
    }
    if (status === 'rejected') {
        redirect('/auth/status?state=rejected');
    }

    // Active users proceed
    return <>{children}</>;
}
