"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MaterialCardProps {
    material: any;
}

export function MaterialCard({ material }: MaterialCardProps) {
    // No interactive dialog needed for materials yet based on previous code, 
    // but separating it allows adding "Add to Cart" or "View Details" easily.
    return (
        <Card
            className="rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col overflow-hidden"
        >
            <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                {material.photos && material.photos[0] ? (
                    <img src={material.photos[0].url} alt={material.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                        <Package className="h-10 w-10 text-slate-300 dark:text-gray-600" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge className="bg-orange-500 text-white border-0 shadow-sm text-sm">
                        {material.price} Rs.
                    </Badge>
                </div>
                {material.quantity && (
                    <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="backdrop-blur-md bg-white/80 dark:bg-black/60">
                            In Stock: {material.quantity}
                        </Badge>
                    </div>
                )}
            </div>
            <CardContent className="p-4 flex-1 flex flex-col">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg truncate">{material.name}</h4>
                <p className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2">{material.type}</p>
                <p className="text-sm text-slate-500 dark:text-gray-400 line-clamp-3 mb-4 flex-1">{material.description}</p>
            </CardContent>
        </Card>
    );
}
