"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Image as ImageIcon,
  Send,
  MessageCircle,
  Share2,
  MoreHorizontal,
  ThumbsUp,
  Loader2,
  Trash2,
  X,
  Package,
  GraduationCap,
  FileText,
  User,
  BriefcaseBusiness,
  Plus,
  Pencil,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { IUser } from "@/types/user";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

import { HIRING_ELIGIBLE_CATEGORIES } from "@/lib/constants";
import { PostCard } from "@/components/feed/post-card";

interface DashboardFeedProps {
  user: IUser;
  readOnly?: boolean;
  filterUserId?: string; // Add filter prop
}

interface Post {
  _id: string;
  author: {
    _id: string;
    name: string;
    image?: string;
    category: string;
    headline?: string;
  };
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
}

const HIRING_ROLES = HIRING_ELIGIBLE_CATEGORIES as unknown as string[];

export function DashboardFeed({ user, readOnly = false, filterUserId }: DashboardFeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);

  const [openToWork, setOpenToWork] = useState(user.isOpenToWork || false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [jobPostCount, setJobPostCount] = useState(0);
  const [selectedProject, setSelectedProject] = useState<any>(null); // State for selected project view

  // Experience State
  const [experienceList, setExperienceList] = useState<any[]>(user.experience || []);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [isSavingExperience, setIsSavingExperience] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<number | null>(null);
  const [experienceData, setExperienceData] = useState({
    title: "",
    organization: "",
    start_date: "",
    end_date: "",
    description: "",
    is_current: false
  });

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingExperience(true);
    try {
      const newList = [...experienceList];
      if (editingExperienceIndex !== null) {
        newList[editingExperienceIndex] = experienceData;
      } else {
        newList.push(experienceData);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: newList })
      });

      if (response.ok) {
        setExperienceList(newList);
        toast.success(editingExperienceIndex !== null ? "Experience updated" : "Experience added");
        setIsExperienceModalOpen(false);
        setEditingExperienceIndex(null);
        setExperienceData({ title: "", organization: "", start_date: "", end_date: "", description: "", is_current: false });
        router.refresh();
      } else {
        toast.error("Failed to save experience");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSavingExperience(false);
    }
  };

  const handleDeleteExperience = async (index: number) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      const newList = experienceList.filter((_, i) => i !== index);
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: newList })
      });

      if (response.ok) {
        setExperienceList(newList);
        toast.success("Experience deleted");
        router.refresh();
      }
    } catch (error) {
      toast.error("Error deleting experience");
    }
  };

  const openAddExperience = () => {
    setEditingExperienceIndex(null);
    setExperienceData({ title: "", organization: "", start_date: "", end_date: "", description: "", is_current: false });
    setIsExperienceModalOpen(true);
  };

  const openEditExperience = (exp: any, index: number) => {
    setEditingExperienceIndex(index);
    setExperienceData({
      title: exp.title || "",
      organization: exp.organization || "",
      start_date: exp.start_date ? new Date(exp.start_date).toISOString().split('T')[0] : "",
      end_date: exp.end_date ? new Date(exp.end_date).toISOString().split('T')[0] : "",
      description: exp.description || "",
      // Check if current roughly by checking if end date is missing or future (simplified)
      is_current: exp.is_current || !exp.end_date
    });
    setIsExperienceModalOpen(true);
  };

  const handleStatusUpdate = async (checked: boolean) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('/api/user/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpenToWork: checked })
      });

      if (response.ok) {
        setOpenToWork(checked);
        toast.success(checked ? "You are now Open to Work!" : "Status updated");
        router.refresh();
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  useEffect(() => {
    setOpenToWork(user.isOpenToWork || false);
  }, [user.isOpenToWork]);

  // Fetch job post count for hiring badge
  useEffect(() => {
    const fetchJobCount = async () => {
      try {
        const res = await fetch(`/api/jobs?userId=${user._id}&count=true`);
        if (res.ok) {
          const data = await res.json();
          setJobPostCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch job count', error);
      }
    };

    if (HIRING_ROLES.includes(user.category)) {
      fetchJobCount();
    }
  }, [user._id, user.category]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [user._id, readOnly, filterUserId]);

  const fetchPosts = async () => {
    try {
      // Logic update:
      // If filterUserId is provided, fetch posts for that user (Private Dashboard Mode)
      // If readOnly is true, fetch posts for that user (Public Profile Mode)
      // Else fetches global feed (Community Feed - if we had one separate)

      let url = "/api/posts";
      if (filterUserId) {
        url = `/api/posts?userId=${filterUserId}`;
      } else if (readOnly) {
        url = `/api/posts?userId=${user._id}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts?id=${postId}`, { method: "DELETE" });
      if (response.ok) {
        setPosts(posts.filter(p => p._id !== postId));
        toast.success("Post deleted");
        // Refresh page to update article count
        router.refresh();
      } else {
        toast.error("Failed to delete post");
      }
    } catch (error) {
      toast.error("Error deleting post");
    }
  };

  const toggleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post._id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">


      {/* Project Details Modal */}
      <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="text-2xl font-bold">{selectedProject?.title}</DialogTitle>
            {selectedProject?.role && (
              <p className="text-sm text-muted-foreground font-medium">{selectedProject.role}</p>
            )}
          </DialogHeader>

          <div className="space-y-6 mt-4 text-center">
            {/* Project Media */}
            {selectedProject?.media && selectedProject.media.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4">
                {selectedProject.media.map((media: any, i: number) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full md:w-[45%] h-64">
                    <img
                      src={media.url}
                      alt={`${selectedProject.title} - ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">About this project</h4>
              <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-gray-300">
                {selectedProject?.description}
              </p>
            </div>

            {/* Tools */}
            {selectedProject?.tools && selectedProject.tools.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tools Used</h4>
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedProject.tools.map((tool: string, i: number) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Experience Modal */}
      <Dialog open={isExperienceModalOpen} onOpenChange={setIsExperienceModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingExperienceIndex !== null ? 'Edit Experience' : 'Add Experience'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveExperience} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. Senior Architect"
                  required
                  value={experienceData.title}
                  onChange={(e) => setExperienceData({ ...experienceData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org">Organization</Label>
                <Input
                  id="org"
                  placeholder="e.g. ABC Solutions"
                  required
                  value={experienceData.organization}
                  onChange={(e) => setExperienceData({ ...experienceData, organization: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Start Date</Label>
                  <Input
                    id="start"
                    type="date"
                    required
                    value={experienceData.start_date}
                    onChange={(e) => setExperienceData({ ...experienceData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end">End Date</Label>
                  <Input
                    id="end"
                    type="date"
                    value={experienceData.end_date}
                    onChange={(e) => setExperienceData({ ...experienceData, end_date: e.target.value })}
                  />
                  <p className="text-[10px] text-muted-foreground">Leave blank if current</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (Optional)</Label>
                <Textarea
                  id="desc"
                  placeholder="Describe your role and achievements..."
                  value={experienceData.description}
                  onChange={(e) => setExperienceData({ ...experienceData, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsExperienceModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSavingExperience}>
                {isSavingExperience ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Availability Widget (Open to Work) - Only show if NOT readOnly (Owner View in Dashboard) AND not restricted category */}
      {
        !readOnly && !['Educational Institute', 'Material Supplier'].includes(user.category) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Work Availability</h3>
                      <p className="text-sm text-slate-500 dark:text-gray-400">Manage your meaningful work status.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="open-work" className="font-medium cursor-pointer text-slate-700 dark:text-gray-200">Open to Work</Label>
                    <Switch
                      id="open-to-work"
                      checked={openToWork}
                      onCheckedChange={handleStatusUpdate}
                      disabled={isUpdatingStatus || readOnly}
                      suppressHydrationWarning
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* Hiring Status Widget (For Professionals) */}
      {
        HIRING_ROLES.includes(user.category) && jobPostCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 backdrop-blur-xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BriefcaseBusiness className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Hiring</h3>
                    <p className="text-sm text-slate-600 dark:text-gray-300">You have {jobPostCount} active job {jobPostCount === 1 ? 'post' : 'posts'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* Experience Section - For Non-Students */}
      {
        user.category !== 'Student' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <BriefcaseBusiness className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Experience</h3>
                      {experienceList.length === 0 && (
                        <p className="text-sm text-slate-500 dark:text-gray-400">Add your work history (optional)</p>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <Button variant="outline" size="sm" onClick={openAddExperience}>
                      <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {experienceList.map((exp, idx) => (
                    <div key={idx} className="relative group p-4 rounded-xl border border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/30 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">{exp.title}</h4>
                          <p className="text-sm font-medium text-slate-700 dark:text-gray-300">{exp.organization}</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                            {new Date(exp.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} -{' '}
                            {exp.end_date ? new Date(exp.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Present'}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-slate-600 dark:text-gray-400 mt-2 line-clamp-2">{exp.description}</p>
                          )}
                        </div>
                        {!readOnly && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-slate-100 dark:border-gray-800 p-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEditExperience(exp, idx)}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteExperience(idx)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      }

      {/* Student Education Section */}
      {
        user.category === 'Student' && user.education && user.education.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Education</h3>
                </div>
                <div className="space-y-4">
                  {user.education.map((edu: any, index: number) => (
                    <div key={edu._id || index} className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-800 border border-slate-100 dark:border-gray-700">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{edu.institution}</h4>
                        <p className="text-sm text-slate-600 dark:text-gray-400">{edu.degree}, {edu.field_of_study}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {edu.is_current && edu.current_year && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                              Year {edu.current_year}
                            </Badge>
                          )}
                          {edu.is_current && edu.duration && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                              {edu.duration} Course
                            </Badge>
                          )}
                          {edu.is_current && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800">
                              Currently Pursuing
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      }





      {/* My Projects Section */}
      {
        user.projects && user.projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Projects</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300"
                onClick={() => router.push(`/profile/${user._id}/projects`)}
              >
                View All
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {user.projects.map((project: any, idx: number) => (
                <Card
                  key={idx}
                  className="min-w-[280px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
                    {project.media && project.media[0] ? (
                      <img src={project.media[0].url} alt={project.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-slate-300 dark:text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{project.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{project.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )
      }
      {/* My Materials Section (For Material Suppliers) */}
      {
        user.category === 'Material Supplier' && user.materials && user.materials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Materials</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                onClick={() => router.push(readOnly ? `/profile/${user._id}/materials` : '/dashboard/catalog')}
              >
                View Catalog
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {user.materials.map((material: any, idx: number) => (
                <Card
                  key={idx}
                  className="min-w-[280px] rounded-2xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(readOnly ? `/profile/${user._id}/materials/${material._id}` : `/dashboard/catalog/${material._id}`)}
                >
                  <div className="relative h-40 w-full overflow-hidden rounded-t-2xl">
                    {material.photos && material.photos[0] ? (
                      <img src={material.photos[0].url} alt={material.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="h-full w-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-300 dark:text-gray-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-orange-500 text-white border-0 shadow-sm">
                        {material.price}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-slate-900 dark:text-white truncate">{material.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{material.type}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )
      }

      {/* Posts Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Articles</h3>
          <Button asChild variant="outline" size="sm" className="hidden sm:flex">
            <a href="/dashboard/articles/new">
              <FileText className="mr-2 h-4 w-4" />
              Write Article
            </a>
          </Button>
        </div>
        {posts.map((post, idx) => {
          if (!post.author) return null;
          return (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <PostCard
                post={post}
                user={user}
                isOwner={user._id === post.author._id}
                onDelete={handleDeletePost}
              // onLikeUpdate is handled internally by PostCard for optimistic UI, 
              // but we can pass it if we want to sync parent state. 
              // For now, let PostCard manage its immediate state.
              />
            </motion.div>
          );
        })}
      </div>
    </div >
  );
}




