'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, MoreHorizontal, Search, User, Mail, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  coa_number?: string;
  status: 'pending' | 'active' | 'rejected' | 'banned';
  createdAt: string;
};

const FILTERS = ['All', 'Active', 'Pending', 'Rejected', 'Banned'] as const;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export default function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data.users ?? []);
    } catch (error) {
      toast({
        title: 'Unable to load users',
        description: error instanceof Error ? error.message : 'Please retry shortly.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const pendingArchitects = useMemo(
    () => users.filter((user) => user.status === 'pending' && user.category === 'Architect'),
    [users]
  );

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => (filter === 'All' ? true : user.status === filter.toLowerCase()))
      .filter((user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, filter, searchTerm]);

  const handleDecision = async (userId: string, action: 'approve' | 'reject' | 'ban' | 'unban') => {
    setPendingAction(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? 'Unable to update status');
      }

      const updatedUser = await response.json();
      setUsers((prev) =>
        prev.map((user) =>
          user._id === updatedUser.user._id ? { ...user, status: updatedUser.user.status } : user
        )
      );

      toast({
        title: 'Status Updated',
        description: `User has been ${action === 'ban' ? 'banned' : action === 'unban' ? 'unbanned' : action + 'ed'}.`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) return;

    setPendingAction(userId);
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove user');
      }

      setUsers((prev) => prev.filter((user) => user._id !== userId));

      toast({
        title: 'User Removed',
        description: 'The user has been permanently removed from the database.',
      });
    } catch (error) {
      toast({
        title: 'Removal failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setPendingAction(null);
    }
  };

  const handleCopyCoa = (coa: string) => {
    if (!coa) return;
    navigator.clipboard.writeText(coa);
    toast({
      title: "Copied to clipboard",
      description: `COA Number ${coa} copied.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Admin</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">User Management</h1>
        </div>
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading} className="border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
          Refresh
        </Button>
      </div>

      <Card className="mb-10 bg-white dark:bg-gray-900/70 border-yellow-500/20 shadow-lg rounded-3xl transition-colors duration-300">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.35em] text-yellow-600 dark:text-yellow-200/80">Architect track</p>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Pending Architect Approvals</CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Every architect submission is human reviewed. Approve only when portfolio links have been vetted.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/5">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">COA Number</th>
                  <th className="p-4 font-medium">Signed up</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading architect queue…
                      </div>
                    </td>
                  </tr>
                ) : pendingArchitects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-500 dark:text-slate-400">
                      No pending architect submissions right now.
                    </td>
                  </tr>
                ) : (
                  pendingArchitects.map((user) => (
                    <tr key={user._id} className="border-t border-slate-200 dark:border-white/5 text-slate-900 dark:text-white">
                      <td className="p-4 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-white/10 text-base font-semibold uppercase text-slate-700 dark:text-white">
                          {user.name[0]}
                        </span>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-white/60">{user.category}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200">
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className="font-mono text-sm text-cyan-600 dark:text-cyan-400 cursor-pointer hover:underline"
                          onClick={() => user.coa_number && handleCopyCoa(user.coa_number)}
                          title="Click to copy"
                        >
                          {user.coa_number || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-300">{formatDate(user.createdAt)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleDecision(user._id, 'approve')}
                            size="icon"
                            variant="secondary"
                            className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-500/30"
                            disabled={pendingAction === user._id}
                          >
                            {pendingAction === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check />}
                          </Button>
                          <Button
                            onClick={() => handleDecision(user._id, 'reject')}
                            size="icon"
                            variant="ghost"
                            className="text-rose-500 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/10"
                            disabled={pendingAction === user._id}
                          >
                            {pendingAction === user._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900/70 border-slate-200 dark:border-gray-700/40 shadow-lg rounded-3xl transition-colors duration-300">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Directory</p>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">All Users</CardTitle>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-50 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-slate-50 dark:bg-gray-800/80 border-slate-200 dark:border-gray-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800">
                    Filter: {filter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white border-slate-200 dark:border-gray-700">
                  {FILTERS.map((option) => (
                    <DropdownMenuItem key={option} onSelect={() => setFilter(option)} className="focus:bg-slate-100 dark:focus:bg-gray-800 cursor-pointer">
                      {option}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/5">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-300">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">COA Number</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 dark:text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading directory…
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 dark:text-slate-400">
                      No users found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-t border-slate-200 dark:border-white/5 text-slate-900 dark:text-white">
                      <td className="p-4 flex items-center gap-3">
                        <User className="h-5 w-5 text-slate-500 dark:text-white/70" />
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-white/60">{formatDate(user.createdAt)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-200">
                          {user.phone || '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20">
                          {user.category}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span
                          className="font-mono text-sm text-cyan-600 dark:text-cyan-400 cursor-pointer hover:underline"
                          onClick={() => user.coa_number && handleCopyCoa(user.coa_number)}
                          title="Click to copy"
                        >
                          {user.coa_number || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={cn(
                            'text-white',
                            user.status === 'active' && 'bg-emerald-500/80 dark:bg-emerald-500/20 text-white dark:text-emerald-300',
                            user.status === 'pending' && 'bg-amber-500/80 dark:bg-amber-500/20 text-white dark:text-amber-300',
                            user.status === 'rejected' && 'bg-rose-500/80 dark:bg-rose-500/20 text-white dark:text-rose-300',
                            user.status === 'banned' && 'bg-red-600/80 dark:bg-red-600/20 text-white dark:text-red-400'
                          )}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="text-slate-500 dark:text-white hover:bg-slate-100 dark:hover:bg-gray-800">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-white dark:bg-gray-900 text-slate-900 dark:text-white border-slate-200 dark:border-gray-700">
                            {user.status === 'banned' ? (
                              <DropdownMenuItem
                                className="text-green-600 dark:text-green-400 focus:text-green-700 dark:focus:text-green-400 focus:bg-green-50 dark:focus:bg-green-900/20 cursor-pointer"
                                onClick={() => handleDecision(user._id, 'unban')}
                              >
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                                onClick={() => handleDecision(user._id, 'ban')}
                              >
                                Ban User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                              onClick={() => handleRemove(user._id)}
                            >
                              Remove User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
