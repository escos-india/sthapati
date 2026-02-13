"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Send, User, MoreVertical, MessageSquare, Check, CheckCheck } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { differenceInMinutes, format } from "date-fns";

interface ChatInterfaceProps {
    currentUser: any;
    initialConversations: any[]; // List of users with last message
}

export function ChatInterface({ currentUser, initialConversations }: ChatInterfaceProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [conversations, setConversations] = useState(initialConversations);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(searchParams.get("userId"));
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter conversations based on search query
    const filteredConversations = conversations.filter((c) =>
        c.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-select if userId in URL
    useEffect(() => {
        const urlUserId = searchParams.get("userId");
        if (urlUserId && urlUserId !== selectedUserId) {
            setSelectedUserId(urlUserId);
        }
    }, [searchParams]);

    // Fetch messages when selected user changes
    useEffect(() => {
        if (!selectedUserId) return;

        const fetchMessages = async () => {
            setLoadingMessages(true);
            try {
                const res = await fetch(`/api/messages/${selectedUserId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();

        // Mark messages as read when opening chat
        const markAsRead = async () => {
            try {
                await fetch(`/api/messages/${selectedUserId}`, { method: "PATCH" });
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        };
        markAsRead();

        // Polling for new messages (simple implementation)
        const interval = setInterval(() => {
            fetchMessages();
            markAsRead();
        }, 5000);
        return () => clearInterval(interval);

    }, [selectedUserId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        const optimisicMessage = {
            _id: Date.now().toString(),
            sender: currentUser._id,
            recipient: selectedUserId,
            content: newMessage,
            createdAt: new Date().toISOString(),
            read: false,
        };

        setMessages(prev => [...prev, optimisicMessage]);
        setNewMessage("");

        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientId: selectedUserId, content: optimisicMessage.content }),
            });

            if (!res.ok) {
                // remove optimistic message on failure? or show error
                console.error("Failed to send message");
            } else {
                // Refresh conversations list to update 'lastMessage'
                // In a real app we'd just update local state
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const selectedUser = conversations.find(c => c.user._id === selectedUserId)?.user
        // If not in conversation list (new chat), we might need to fetch user details or pass them
        // For now we assume if we navigated here, we might need to handle 'not in list' case.
        // Ideally we fetch user details if not found.
        || { name: "User", _id: selectedUserId };

    // Check if we have user details if strictly needed (e.g. from network page)
    // If navigating from Network page, we might not have them in 'initialConversations' if we never chatted.
    // We should probably fetch the user details if missing.
    // SKIP for MVP: display simple placeholder or handle efficiently later.

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">

            {/* Sidebar - Conversations List */}
            <div className={cn(
                "md:col-span-1 border-r border-slate-200 dark:border-slate-800 flex flex-col",
                selectedUserId ? "hidden md:flex" : "flex"
            )}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-lg font-semibold mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search connections"
                            className="pl-9 bg-slate-50 dark:bg-slate-800"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {filteredConversations.length === 0 && (
                            <p className="p-4 text-center text-sm text-muted-foreground">
                                {searchQuery ? "No matches found" : "No conversations yet."}
                            </p>
                        )}
                        {filteredConversations.map((c) => (
                            <button
                                key={c.user._id}
                                onClick={() => router.push(`/messages?userId=${c.user._id}`)}
                                suppressHydrationWarning
                                className={cn(
                                    "flex items-start gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors",
                                    selectedUserId === c.user._id && "bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                                )}
                            >
                                <Avatar>
                                    <AvatarImage src={c.user.image} />
                                    <AvatarFallback>{c.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="font-medium truncate">{c.user.name}</span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                            {c.lastMessage && format(new Date(c.lastMessage.createdAt), "MMM d")}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {c.lastMessage?.sender === currentUser._id && "You: "}
                                        {c.lastMessage?.content}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "md:col-span-3 flex flex-col bg-slate-50/50 dark:bg-slate-900/50",
                !selectedUserId ? "hidden md:flex" : "flex"
            )}>
                {selectedUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.push("/messages")}>
                                    {/* Back arrow */}
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                                </Button>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedUser.image} />
                                    <AvatarFallback>{selectedUser.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">{selectedUser.name || "User"}</h3>
                                    {selectedUser.headline && (
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{selectedUser.headline}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                            {messages.map((msg, i) => {
                                const isMe = msg.sender === currentUser._id;
                                const showAvatar = !isMe && (i === 0 || messages[i - 1].sender !== msg.sender);

                                return (
                                    <div key={msg._id} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                        {!isMe && (
                                            <div className="w-8 shrink-0">
                                                {showAvatar ? (
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={selectedUser.image} />
                                                        <AvatarFallback>{selectedUser.name?.[0]}</AvatarFallback>
                                                    </Avatar>
                                                ) : <div className="w-8" />}
                                            </div>
                                        )}
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm",
                                            isMe ? "bg-cyan-600 text-white rounded-tr-none" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm"
                                        )}>
                                            <p>{msg.content}</p>
                                            <div className={cn("flex items-center justify-end gap-1 mt-1", isMe ? "text-cyan-100" : "text-muted-foreground")}>
                                                <span className="text-[10px] opacity-70">
                                                    {format(new Date(msg.createdAt), "h:mm a")}
                                                </span>
                                                {isMe && (
                                                    msg.read ? (
                                                        <CheckCheck className="h-3.5 w-3.5 text-blue-300" />
                                                    ) : (
                                                        <Check className="h-3.5 w-3.5 opacity-70" />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {messages.length === 0 && !loadingMessages && (
                                <div className="text-center py-10 text-muted-foreground text-sm">
                                    Say hello to start the conversation!
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Write a message..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" disabled={!newMessage.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Your Messages</h3>
                        <p className="max-w-xs text-center">Select a conversation or start a new chat from your connections.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
