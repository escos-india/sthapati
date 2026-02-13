"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface Architect {
    _id: string;
    name: string;
    email: string;
    phone: string;
    coa_number: string;
    createdAt: string;
    status: "pending" | "active" | "rejected";
}

export default function ArchitectApprovalPage() {
    const { toast } = useToast();
    const [architects, setArchitects] = useState<Architect[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1000);
    };

    const fetchArchitects = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/architects");
            if (!response.ok) throw new Error("Failed to fetch architects");
            const data = await response.json();
            setArchitects(data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load architect requests",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchArchitects();
    }, []);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        setProcessingId(id);
        try {
            const response = await fetch("/api/admin/architects", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action }),
            });

            if (!response.ok) throw new Error("Failed to update status");

            toast({
                title: "Success",
                description: `Architect ${action}d successfully`,
            });

            // Refresh list
            fetchArchitects();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update architect status",
                variant: "destructive",
            });
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Architect Approvals</h1>
                <Button onClick={fetchArchitects} variant="outline">
                    Refresh
                </Button>
            </div>

            <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded border border-slate-700">
                Every architect submission is human reviewed. Approve only when portfolio links and COA number have been vetted.
            </p>

            <Card className="bg-gray-900 border-slate-800">
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    {architects.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No pending architect requests found.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-300">Name</TableHead>
                                    <TableHead className="text-slate-300">COA Number</TableHead>
                                    <TableHead className="text-slate-300">Contact</TableHead>
                                    <TableHead className="text-slate-300">Date</TableHead>
                                    <TableHead className="text-slate-300">Status</TableHead>
                                    <TableHead className="text-right text-slate-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {architects.map((architect) => (
                                    <TableRow key={architect._id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell className="font-medium text-white">{architect.name}</TableCell>
                                        <TableCell
                                            className="font-mono text-cyan-400 cursor-pointer relative group"
                                            onClick={() => handleCopy(architect.coa_number, architect._id)}
                                        >
                                            {architect.coa_number}
                                            {copiedId === architect._id && (
                                                <span className="absolute -top-8 left-0 bg-black text-white text-xs px-2 py-1 rounded shadow-lg animate-in fade-in zoom-in duration-200">
                                                    Copied
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-sm">
                                                <span className="text-white">{architect.email}</span>
                                                <span className="text-slate-400">{architect.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            {new Date(architect.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                                Pending
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                                onClick={() => handleAction(architect._id, "approve")}
                                                disabled={!!processingId}
                                            >
                                                {processingId === architect._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => handleAction(architect._id, "reject")}
                                                disabled={!!processingId}
                                            >
                                                <XCircle className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
