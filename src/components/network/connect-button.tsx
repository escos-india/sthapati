"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Clock, UserCheck, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConnectButtonProps {
    userId: string;
    initialStatus?: "none" | "pending" | "connected" | "received"; // received means I have a request FROM them
    onStatusChange?: (status: string) => void;
}

export function ConnectButton({ userId, initialStatus = "none", onStatusChange }: ConnectButtonProps) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Ideally, we might want to fetch status on mount if not provided, 
    // but usually parent component passes it. 
    // For now we assume parent passes initial status or we default to none.

    const handleConnect = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/connections/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientId: userId }),
            });

            if (res.ok) {
                setStatus("pending");
                if (onStatusChange) onStatusChange("pending");
            } else {
                const data = await res.json();
                alert(data.message || "Failed to send request");
            }
        } catch (error) {
            console.error("Error sending request:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        // This is tricky because we need the requestId. 
        // If the status is 'received', the parent should probably provide the Request ID 
        // OR the button needs to fetch pending requests to find it.
        // For simplicity in this isolated component, let's assume if it's "received" 
        // we might need to handle it in the Notifications/Network page primarily.
        // BUT, if we want "Connect" -> "Accept" here, we need to know the Request ID.
        // Let's implement a quick lookup or just simplified "Connect" sending for now.
        // IF we are strictly following LinkedIn style, looking at a profile of someone who sent YOU a request
        // shows "Accept".

        // We defer Acceptance to the Network page for MVP robustness, 
        // OR we'd need to fetch the request ID here.
        // Let's stick to "Connect" (Send) and "Message" (Connected) and "Pending" (Sent).
        // If "received", we can redirect to Network page.
        router.push("/network");
    };

    if (status === "connected") {
        return (
            <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push(`/messages?userId=${userId}`)}
            >
                <MessageSquare className="h-4 w-4" />
                Message
            </Button>
        );
    }

    if (status === "pending") {
        return (
            <Button variant="ghost" className="gap-2 text-muted-foreground" disabled>
                <Clock className="h-4 w-4" />
                Pending
            </Button>
        );
    }

    if (status === "received") {
        return (
            <Button variant="default" className="gap-2" onClick={handleAccept}>
                <UserCheck className="h-4 w-4" />
                Respond
            </Button>
        );
    }

    return (
        <Button
            variant="default"
            className="gap-2"
            onClick={handleConnect}
            disabled={loading}
        >
            <UserPlus className="h-4 w-4" />
            Connect
        </Button>
    );
}
