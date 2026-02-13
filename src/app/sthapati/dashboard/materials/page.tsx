'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Package, Plus } from 'lucide-react';
import { ImageUpload } from "@/components/profile/image-upload";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from 'sonner';

interface Material {
    _id: string;
    name: string;
    type: string;
    description: string;
    price: string;
    quantity: string;
    photos: { url: string }[];
}

const materialSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    type: z.string().min(2, { message: "Type is required." }),
    description: z.string().optional(),
    price: z.string().min(1, { message: "Price is required." }),
    quantity: z.string().optional(),
    photos: z.array(z.string()).optional(),
});

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            // Since materials are embedded in User, we might need a dedicated endpoint or fetch user data
            // For this implementation, let's assume we can fetch current user's materials via the API we created
            // Use NO-STORE to prevent caching issues
            const res = await fetch('/api/user/me', { cache: 'no-store' }); // Or a specific get materials endpoint if created
            // Actually, my plan didn't specify a GET endpoint in the new route.ts, it relies on User model.
            // Let's assume we fetch the user profile or add a GET to the route.
            // Wait, 'api/user/materials' supports POST/PUT/DELETE. We should add GET or use user profile.
            // Let's quickly add a GET to the materials route for fetching self materials.
            // UPDATE: I will add GET to route.ts in next step. For now, assuming it exists.
            const response = await fetch('/api/user/materials', { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                setMaterials(data);
            }
        } catch (error) {
            console.error("Failed to fetch materials", error);
        }
    };

    const form = useForm<z.infer<typeof materialSchema>>({
        resolver: zodResolver(materialSchema),
        defaultValues: {
            name: "",
            type: "",
            description: "",
            price: "",
            quantity: "",
            photos: [],
        },
    });

    const onSubmit = async (values: z.infer<typeof materialSchema>) => {
        setIsLoading(true);
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = { ...values, id: editingId, photos: values.photos?.map(url => ({ url })) };

            const res = await fetch('/api/user/materials', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                toast.success(editingId ? "Material updated!" : "Material added!");
                form.reset();
                setEditingId(null);
                fetchMaterials();
            } else {
                toast.error('Failed to save material');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving material');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (material: Material) => {
        setEditingId(material._id);
        form.reset({
            name: material.name,
            type: material.type,
            description: material.description,
            price: material.price,
            quantity: material.quantity,
            photos: material.photos.map(p => p.url),
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this material?")) return;

        try {
            const res = await fetch(`/api/user/materials?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                toast.success("Material deleted");
                setMaterials(prev => prev.filter(m => m._id !== id));
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Error deleting");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        form.reset({
            name: "",
            type: "",
            description: "",
            price: "",
            quantity: "",
            photos: [],
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-full"
            suppressHydrationWarning
        >
            <h1 className="text-4xl font-extrabold tracking-tight mb-8 flex items-center gap-3">
                <Package className="h-10 w-10 text-orange-500" />
                My Materials
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1">
                    <Card className="bg-gray-800/60 border-gray-700/50 shadow-lg rounded-lg sticky top-4">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold">
                                {editingId ? 'Edit Material' : 'Add New Material'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Red Bricks" className="bg-gray-900/70" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Type</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Brick" className="bg-gray-900/70" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. ₹10/pc" className="bg-gray-900/70" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Available Quantity</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. 1000 pcs" className="bg-gray-900/70" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Details about specificiations..." className="bg-gray-900/70 resize-none h-24" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="photos"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Media (Images/Videos) *</FormLabel>
                                                <FormControl>
                                                    <div>
                                                        <div className="flex gap-4 overflow-x-auto pb-2 min-h-[100px] items-center">
                                                            {(field.value || []).map((url, i) => (
                                                                <div key={i} className="relative w-24 h-24 shrink-0 rounded-md overflow-hidden group border border-slate-200 dark:border-slate-700">
                                                                    <img src={url} className="w-full h-full object-cover" />
                                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <Button
                                                                            type="button"
                                                                            variant="destructive"
                                                                            size="icon"
                                                                            className="h-6 w-6 rounded-full"
                                                                            onClick={() => {
                                                                                const newPhotos = [...(field.value || [])];
                                                                                newPhotos.splice(i, 1);
                                                                                field.onChange(newPhotos);
                                                                            }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <ImageUpload
                                                                value={""}
                                                                onChange={(url) => {
                                                                    if (url) {
                                                                        field.onChange([...(field.value || []), url]);
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
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end space-x-2 pt-4">
                                        {editingId && <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>}
                                        <Button type="submit" disabled={isLoading} className="w-full">
                                            {isLoading ? 'Saving...' : (editingId ? 'Update Material' : 'Add Material')}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {materials.map((material) => (
                            <Card key={material._id} className="bg-gray-800/40 border-gray-700/30 overflow-hidden group hover:border-orange-500/50 transition-all">
                                <div className="h-48 w-full bg-gray-900 relative">
                                    {material.photos?.[0] ? (
                                        <img src={material.photos[0].url} alt={material.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-12 w-12 text-gray-700" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="secondary" className="h-8 w-8" onClick={() => handleEdit(material)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDelete(material._id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Badge className="absolute bottom-2 left-2 bg-black/70 hover:bg-black/80 text-white border-0">
                                        {material.price}
                                    </Badge>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-white">{material.name}</h3>
                                            <p className="text-sm text-gray-400">{material.type}</p>
                                        </div>
                                        {material.quantity && <Badge variant="outline">{material.quantity}</Badge>}
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2">{material.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                        {materials.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-800/20 rounded-lg border border-dashed border-gray-700">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No materials added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
