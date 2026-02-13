"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { HIRING_ELIGIBLE_CATEGORIES } from "@/lib/constants";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  createdAt: string;
  applicationCount?: number; // Optional count
};

type Application = {
  _id: string;
  job: string;
  applicant: {
    _id: string;
    name: string;
    image?: string;
    headline?: string;
    category?: string;
  };
  resume: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  createdAt: string;
};
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Building2,
  Users,
  FileText,
  Image as ImageIcon,
  Search,
  Plus,
  Loader2,
  MapPin,
  Trash2,
  ChevronRight,
  Package,
  GraduationCap
} from "lucide-react";
import type { IUser } from "@/types/user";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface DashboardRightPanelProps {
  user: IUser;
  readOnly?: boolean;
}

interface SimplePost {
  _id: string;
  content: string;
  author: {
    name: string;
    image?: string;
    headline?: string;
  };
  createdAt: string;
  image?: string;
}



interface SearchUser {
  _id: string;
  name: string;
  image?: string;
  headline?: string;
  category: string;
}



const jobSchema = z.object({
  title: z.string().min(3, { message: "Job title is required." }),
  company: z.string().min(2, { message: "Company name is required." }),
  location: z.string().min(2, { message: "Location is required." }),
  type: z.string(),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  salary_range: z.string().optional(),
});

export function DashboardRightPanel({ user, readOnly = false }: DashboardRightPanelProps) {
  const router = useRouter();
  const [recentPosts, setRecentPosts] = useState<SimplePost[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  // Job Creation State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isPostingJob, setIsPostingJob] = useState(false);

  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      description: "",
      salary_range: "",
    },
  });

  // Article View State
  const [selectedArticle, setSelectedArticle] = useState<SimplePost | null>(null);

  const isStudent = user.category === 'Student';
  const isJobSeeker = ['Student', 'Professional'].includes(user.category);

  // Associates State
  const [myAssociates, setMyAssociates] = useState<SearchUser[]>([]);
  const [associatesTab, setAssociatesTab] = useState<'discover' | 'my'>('discover');
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  // Job Management State
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isApplicationsDialogOpen, setIsApplicationsDialogOpen] = useState(false);

  const isHiringRole = (HIRING_ELIGIBLE_CATEGORIES as readonly string[]).includes(user.category);

  useEffect(() => {
    fetchPosts();
    fetchJobs();
    fetchAssociates();
    fetchMyAssociates();
    if (isHiringRole) {
      fetchMyJobs();
    }
  }, [user._id, readOnly]);

  const fetchMyJobs = async () => {
    try {
      const res = await fetch(`/api/jobs?userId=${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setMyJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  };

  const fetchApplications = async (jobId: string) => {
    setLoadingApplications(true);
    setSelectedJobId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
        setIsApplicationsDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch applications", error);
    } finally {
      setLoadingApplications(false);
    }
  };

  const fetchPosts = async () => {
    try {
      // In read-only mode, fetch only the user's posts
      const url = readOnly ? `/api/posts?userId=${user._id}` : "/api/posts";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        // Filter out posts with missing authors and take the first 5
        const validPosts = data.filter((post: any) => post.author && post.author.name);
        setRecentPosts(validPosts.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch posts", error);
    }
  };

  const fetchJobs = async () => {
    try {
      // In read-only mode, always fetch the user's jobs
      // Otherwise: If job seeker, fetch all active jobs (suggestions); If job poster, fetch their own jobs
      const url = readOnly
        ? `/api/jobs?userId=${user._id}`
        : (isJobSeeker ? "/api/jobs" : `/api/jobs?userId=${user._id}`);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    }
  }

  const fetchAssociates = async (query = "") => {
    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error("Failed to fetch associates", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounce or just fetch
    fetchAssociates(query);
  }

  const handleAddAssociate = async (targetId: string) => {
    setIsAdding(targetId);
    try {
      const response = await fetch("/api/associates/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId })
      });

      if (response.ok) {
        toast.success("Associate added successfully");
        // Remove from discover list
        setSearchResults(prev => prev.filter(p => p._id !== targetId));
        // Refresh my list
        fetchMyAssociates();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to add associate");
      }
    } catch (error) {
      toast.error("Error adding associate");
    } finally {
      setIsAdding(null);
    }
  };

  const fetchMyAssociates = async () => {
    try {
      const response = await fetch("/api/associates");
      if (response.ok) {
        setMyAssociates(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch my associates", error);
    }
  };

  const handleRemoveAssociate = async (targetId: string) => {
    setIsRemoving(targetId);
    try {
      const response = await fetch("/api/associates", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId })
      });

      if (response.ok) {
        toast.success("Associate removed");
        setMyAssociates(prev => prev.filter(p => p._id !== targetId));
        // Refresh discover list if active
        if (associatesTab === 'discover') fetchAssociates(searchQuery);
      } else {
        toast.error("Failed to remove associate");
      }
    } catch (error) {
      toast.error("Error removing associate");
    } finally {
      setIsRemoving(null);
    }
  };

  const handleCreateJob = async (values: z.infer<typeof jobSchema>) => {
    setIsPostingJob(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success("Job posted successfully!");
        setIsJobModalOpen(false);
        form.reset();
        fetchJobs(); // Refresh list
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to post job");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsPostingJob(false);
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs?id=${jobId}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Job deleted successfully");
        setJobs(jobs.filter(j => j._id !== jobId));
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete job");
      }
    } catch (error) {
      toast.error("Error deleting job");
    }
  }

  return (
    <div className="space-y-6">
      {/* Student Specialization Section */}
      {isStudent && user.specialization && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Specialization</h3>
                  <p className="text-slate-600 dark:text-gray-400">{user.specialization}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Resume Section */}
      {isStudent && user.resume && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Professional Resume</h3>
                    <p className="text-sm text-slate-500 dark:text-gray-400">PDF Document • Ready for applications</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-pink-200 dark:border-pink-900/50 hover:bg-pink-50 dark:hover:bg-pink-950/30 text-pink-600 dark:text-pink-400"
                  asChild
                >
                  <a href={user.resume} target="_blank" rel="noopener noreferrer">
                    View Resume
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Material Catalog Section (For Material Suppliers) */}
      {user.category === 'Material Supplier' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300 overflow-hidden group cursor-pointer"
            onClick={() => router.push(readOnly ? `/profile/${user._id}/materials` : '/dashboard/catalog')}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">My Catalog</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Manage your materials</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-orange-600 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Gallery Section - Hide for Students */}
      {!isStudent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300 overflow-hidden group cursor-pointer" onClick={() => router.push(readOnly ? `/profile/${user._id}/gallery` : '/dashboard/gallery')}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-lg">View Gallery</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">Browse your collection</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-slate-400 group-hover:text-cyan-600 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

      )}

      {/* Articles Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Articles</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300" onClick={() => router.push(readOnly ? `/profile/${user._id}/articles` : '/dashboard/articles')}>
              View All
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPosts.length > 0 ? (
              recentPosts.map((post, idx) => (
                <Dialog key={post._id}>
                  <DialogTrigger asChild>
                    <div
                      className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                      onClick={() => setSelectedArticle(post)}
                    >
                      <div className="flex flex-col gap-1 flex-1 min-w-0 mr-3">
                        <span className="text-sm font-semibold text-slate-900 dark:text-gray-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors block">
                          {post.content.replace(/<[^>]*>?/gm, '')}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          {post.author.name} · {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-gray-800 text-slate-900 dark:text-gray-300 flex-shrink-0">
                        Read
                      </Badge>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">{post.author.name}'s Article</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar>
                          <AvatarImage src={post.author.image} />
                          <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.author.name}</p>
                          <p className="text-sm text-slate-500">{post.author.headline}</p>
                        </div>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-gray-300">
                        {post.content}
                      </p>
                      {post.image && (
                        <img src={post.image} alt="Article attachment" className="rounded-lg w-full object-contain max-h-[400px]" />
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-gray-400">No articles yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Job Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                {isJobSeeker ? "Job Suggestions" : "My Job Posts"}
              </CardTitle>
            </div>
            {!isJobSeeker && !readOnly && (
              <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="h-8 w-8 bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm rounded-lg">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create Job Post</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateJob)} className="space-y-4 py-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Senior Architect" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Company Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl>
                                <Input placeholder="City, Country" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Full-time">Full-time</SelectItem>
                                  <SelectItem value="Part-time">Part-time</SelectItem>
                                  <SelectItem value="Contract">Contract</SelectItem>
                                  <SelectItem value="Freelance">Freelance</SelectItem>
                                  <SelectItem value="Internship">Internship</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="salary_range"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Salary Range (in )</FormLabel>
                              <FormControl>
                                <Input required placeholder="e.g. $50k - $80k" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Job description and requirements..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                        disabled={isPostingJob}
                      >
                        {isPostingJob ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Post Job"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length > 0 ? (
              jobs.map((job, idx) => (
                <div key={idx} className="group relative p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-gray-800">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{job.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-gray-400 flex items-center gap-2">
                      <Building2 className="h-3 w-3" /> {job.company}
                      <MapPin className="h-3 w-3 ml-2" /> {job.location}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs border-slate-200 dark:border-gray-700 text-slate-600 dark:text-gray-400">
                        {job.type}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions for Job Owner */}
                  {!isJobSeeker && !readOnly && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs h-8 border-cyan-200 dark:border-cyan-900 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                        onClick={() => fetchApplications(job._id)}
                      >
                        <Users className="h-3 w-3 mr-1.5" /> View Applications
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteJob(job._id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-gray-400 text-center py-4">
                {isJobSeeker ? "No job suggestions found." : "You haven't posted any jobs yet."}
              </p>
            )}
            <Button
              variant="ghost"
              className="w-full text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
              onClick={() => router.push('/jobs')}
            >
              See all jobs
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Our Associates (Search) - Only display for logged in user view and NOT for students */}
      {!readOnly && !isStudent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 backdrop-blur-xl shadow-lg transition-colors duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-500" />
                  <h4 className="font-semibold text-slate-900 dark:text-white">Associates</h4>
                </div>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setAssociatesTab('my')}
                    className={`text-xs px-2 py-1 rounded-md transition-all ${associatesTab === 'my' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    My List
                  </button>
                  <button
                    onClick={() => setAssociatesTab('discover')}
                    className={`text-xs px-2 py-1 rounded-md transition-all ${associatesTab === 'discover' ? 'bg-white dark:bg-slate-700 shadow-sm font-medium text-cyan-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                  >
                    Discover
                  </button>
                </div>
              </div>

              {associatesTab === 'discover' ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search new associates..."
                      className="pl-9 bg-white/50 dark:bg-gray-900/50 border-slate-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 transition-colors"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>

                  <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {searchResults.length > 0 ? (
                      searchResults.map((person) => (
                        <div
                          key={person._id}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${person._id}`)}>
                            <Avatar className="h-8 w-8 border border-white/50 dark:border-gray-700">
                              <AvatarImage src={person.image} />
                              <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs">
                                {person.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{person.name}</p>
                              <p className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[140px]">{person.headline || person.category}</p>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-100/50"
                            onClick={() => handleAddAssociate(person._id)}
                            disabled={isAdding === person._id}
                          >
                            {isAdding === person._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No new suggestions found.</p>
                    )}
                  </div>

                  {isSearching && (
                    <div className="flex justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-4 space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {myAssociates.length > 0 ? (
                    myAssociates.map((person) => (
                      <div
                        key={person._id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/profile/${person._id}`)}>
                          <Avatar className="h-8 w-8 border border-white/50 dark:border-gray-700">
                            <AvatarImage src={person.image} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs">
                              {person.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{person.name}</p>
                            <p className="text-xs text-slate-500 dark:text-gray-400 truncate max-w-[140px]">{person.headline || person.category}</p>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100/50"
                          onClick={() => handleRemoveAssociate(person._id)}
                          disabled={isRemoving === person._id}
                        >
                          {isRemoving === person._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-slate-500 mb-2">No associates added yet.</p>
                      <Button variant="link" onClick={() => setAssociatesTab('discover')} className="text-cyan-600 text-xs">
                        Find people to add
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Applications Dialog */}
      <Dialog open={isApplicationsDialogOpen} onOpenChange={setIsApplicationsDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Applications</DialogTitle>
            <DialogDescription>
              Reviewing applications for your job posting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {loadingApplications ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No applications received yet.</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app._id} className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                    {app.applicant?.image ? (
                      <img src={app.applicant.image} alt={app.applicant.name} className="object-cover h-full w-full" />
                    ) : (
                      <Users className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate text-slate-900 dark:text-white">{app.applicant?.name || 'Unknown'}</h4>
                    <p className="text-xs text-muted-foreground truncate">
                      {app.applicant?.headline || app.applicant?.category || 'No headline'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-auto">
                        {app.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={app.resume} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3 w-3 mr-1" /> Resume
                    </a>
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}
