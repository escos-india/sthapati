"use client";

import { MaterialCatalog } from "@/components/profile/material-catalog";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DashboardCatalogClient({ user }: { user: any }) {
    const [materials, setMaterials] = useState(user.materials || []);
    const router = useRouter();

    const handleUpdate = async (updatedMaterials: any[]) => {
        try {
            // Optimistic update
            setMaterials(updatedMaterials);

            const response = await fetch("/api/user/materials", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ materials: updatedMaterials }),
            });

            if (!response.ok) {
                throw new Error("Failed to update materials");
            }

            toast.success("Catalog updated successfully");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update catalog");
            // Revert state if necessary, but for now relying on refresh/optimism
        }
    };

    return (
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">My Material Catalog</h1>
            <p className="text-slate-500 dark:text-gray-400 mb-6">Manage the materials you supply</p>
            <MaterialCatalog
                materials={materials}
                onUpdate={handleUpdate}
            />
        </div>
    );
}
