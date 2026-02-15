import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export default async function LoginPage() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        // If user is already logged in, redirect them based on status
        const user = session.user as any;
        if (user.status === 'active') {
            redirect("/dashboard");
        } else if (user.status === 'pending' || user.status === 'banned' || user.status === 'rejected') {
            redirect(`/auth/status?state=${user.status}`);
        }
    }

    return <LoginClient />;
}
