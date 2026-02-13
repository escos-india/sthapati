import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ConnectionRequestModel } from "@/models/ConnectionRequest";
import { UserModel } from "@/models/User";
import { getUserByEmail } from "@/lib/users";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, UserCheck, UserX, Clock, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import { InvitationsList } from "@/components/network/invitations-list";

export default async function NetworkPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        redirect("/login");
    }

    await connectDB();
    const user = await getUserByEmail(session.user.email);
    if (!user) redirect("/login");

    // Fetch Pending Requests
    const pendingRequests = await ConnectionRequestModel.find({
        recipient: user._id,
        status: "pending"
    }).populate("sender", "name headline image category location cover_image").lean();

    // Fetch Connections
    // user.connections contains objectIds. We need to fetch full details.
    const userWithConnections = await UserModel.findById(user._id).populate({
        path: 'connections',
        select: 'name headline image category location cover_image',
        strictPopulate: false
    }).lean();

    const connections = userWithConnections?.connections || [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black/20 p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Invitations Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Invitations</h2>
                    {pendingRequests.length === 0 ? (
                        <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                                <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <Clock className="h-6 w-6" />
                                </div>
                                <p>No pending invitations</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <InvitationsList requests={JSON.parse(JSON.stringify(pendingRequests))} />
                        </div>
                    )}
                </div>

                {/* My Connections Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">My Connections</h2>
                    {connections.length === 0 ? (
                        <Card className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <UserX className="h-8 w-8" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No connections yet</h3>
                                <p className="mb-6 max-w-sm mx-auto">Connect with professionals, students, and businesses to grow your network.</p>
                                <Button asChild>
                                    <Link href="/dashboard">Find People</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {connections.map((conn: any) => (
                                <Card key={conn._id} className="overflow-hidden hover:shadow-md transition-shadow group">
                                    <div className="h-20 relative bg-gradient-to-r from-cyan-500 to-blue-600">
                                        {conn.cover_image && (
                                            <Image
                                                src={conn.cover_image}
                                                alt="Cover"
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="p-4 pt-12 relative flex flex-col items-center text-center">
                                        <Link href={`/profile/${conn._id}`} className="absolute -top-10 h-20 w-20">
                                            <Image
                                                src={conn.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                                alt={conn.name}
                                                fill
                                                className="rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md"
                                            />
                                        </Link>
                                        <Link href={`/profile/${conn._id}`} className="hover:underline">
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white truncate w-full">{conn.name}</h3>
                                        </Link>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 truncate w-full px-4">{conn.headline || conn.category}</p>

                                        {conn.location?.city && (
                                            <div className="flex items-center text-xs text-muted-foreground mb-4">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {conn.location.city}, {conn.location.country}
                                            </div>
                                        )}

                                        <div className="w-full mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                            <Button variant="outline" className="flex-1" asChild>
                                                <Link href={`/profile/${conn._id}`}>View Profile</Link>
                                            </Button>
                                            <Button className="flex-1 gap-2" asChild>
                                                <Link href={`/messages?userId=${conn._id}`}>
                                                    <MessageSquare className="h-4 w-4" />
                                                    Message
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
