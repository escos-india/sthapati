import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterClient from "./register-client";

export default async function RegisterPage() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        const user = session.user as any;
        if (user.status === 'active') {
            redirect("/dashboard");
        } else if (user.status === 'pending' || user.status === 'banned' || user.status === 'rejected') {
            redirect(`/auth/status?state=${user.status}`);
        }
    }

    return <RegisterClient />;
}
