"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Package, Plus, X, Upload, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/profile/image-upload";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Material {
    _id?: string;
    name: string;
    type: string;
    price: string;
    quantity?: string; // Added quantity
    photos: { url: string }[];
}

interface MaterialCatalogProps {
    materials?: Material[];
    onUpdate: (materials: Material[]) => void;
}

export function MaterialCatalog({ materials = [], onUpdate }: MaterialCatalogProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newMaterial, setNewMaterial] = useState<Material>({
        name: "",
        type: "",
        price: "",
        quantity: "",
        photos: [],
    });
    const [photoUrl, setPhotoUrl] = useState("");

    const handleAddMaterial = () => {
        if (!newMaterial.name || !newMaterial.type || !newMaterial.price || newMaterial.photos.length === 0) {
            return;
        }

        // We don't add _id here to avoid Mongoose CastErrors with temporary IDs
        onUpdate([...materials, newMaterial]);
        setNewMaterial({ name: "", type: "", price: "", quantity: "", photos: [] });
        setPhotoUrl("");
        setIsDialogOpen(false);
    };

    const handleAddPhoto = () => {
        if (photoUrl.trim()) {
            setNewMaterial({
                ...newMaterial,
                photos: [...newMaterial.photos, { url: photoUrl }],
            });
            setPhotoUrl("");
        }
    };

    const handleRemovePhoto = (index: number) => {
        setNewMaterial({
            ...newMaterial,
            photos: newMaterial.photos.filter((_, i) => i !== index),
        });
    };

    const handleRemoveMaterial = (index: number) => {
        onUpdate(materials.filter((_, i) => i !== index));
    };

    return (
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Material Catalog</CardTitle>
                            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                                Add materials you supply
                            </p>
                        </div>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Material
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Material</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Material Name *</Label>
                                    <Input
                                        placeholder="e.g., Premium Marble Tiles"
                                        value={newMaterial.name}
                                        onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Material Type *</Label>
                                    <Input
                                        placeholder="e.g., Flooring, Tiles, Cement"
                                        value={newMaterial.type}
                                        onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Price *</Label>
                                        <Input
                                            placeholder="e.g., ₹500/sq.ft"
                                            value={newMaterial.price}
                                            onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Quantity</Label>
                                        <Input
                                            placeholder="e.g., 500 pcs"
                                            value={newMaterial.quantity}
                                            onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Photos * (at least 1)</Label>
                                    <div className="flex gap-4 overflow-x-auto pb-2 min-h-[100px] items-center">
                                        {newMaterial.photos.map((photo, idx) => (
                                            <div key={idx} className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden group border border-slate-200 dark:border-slate-700">
                                                <img
                                                    src={photo.url}
                                                    alt={`Material ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemovePhoto(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        <ImageUpload
                                            value={""}
                                            onChange={(url) => {
                                                if (url) {
                                                    setNewMaterial({
                                                        ...newMaterial,
                                                        photos: [...newMaterial.photos, { url }],
                                                    });
                                                }
                                            }}
                                            label="Add Media"
                                            className="w-24 h-24 shrink-0"
                                            showPreview={false}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        JPG, PNG up to 5MB. At least 1 image required.
                                    </p>
                                </div>
                                <Button
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white"
                                    onClick={handleAddMaterial}
                                    disabled={!newMaterial.name || !newMaterial.type || !newMaterial.price || newMaterial.photos.length === 0}
                                >
                                    Add Material
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                {materials.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map((material, index) => (
                            <Card key={index} className="group relative overflow-hidden">
                                <div className="relative h-40 overflow-hidden">
                                    {material.photos[0] && (
                                        <img
                                            src={material.photos[0].url}
                                            alt={material.name}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveMaterial(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold text-slate-900 dark:text-white">{material.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{material.type}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                            {material.price}
                                        </p>
                                        {material.quantity && (
                                            <span className="text-xs text-slate-500 dark:text-gray-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm">
                                                Qty: {material.quantity}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500 dark:text-gray-400">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No materials added yet. Click "Add Material" to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
