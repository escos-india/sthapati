'use client';

import { useState } from 'react';
import { mockSubscriptions, Subscription, SubscriptionStatus, SubscriptionTier } from '@/lib/subscriptions-mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertTriangle, Clock, UserPlus, DollarSign, PieChart } from 'lucide-react';
import { SubscriptionDetailDrawer } from '@/components/admin/subscription-detail-drawer';

// --- Badge Color Mappings ---
const statusColors: { [key in SubscriptionStatus]: string } = {
  Active: 'bg-green-500/20 text-green-400 border-green-500/30',
  Expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  'Expiring Soon': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Pending Renewal': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const tierColors: { [key in SubscriptionTier]: string } = {
  Free: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  Silver: 'bg-stone-500/20 text-stone-400 border-stone-500/30',
  Gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Platinum: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
};

const paymentStatusColors: { [key in Subscription['paymentStatus']]: string } = {
  Paid: 'bg-green-500/20 text-green-400',
  Pending: 'bg-yellow-500/20 text-yellow-400',
  Overdue: 'bg-red-500/20 text-red-400',
};

const ITEMS_PER_PAGE = 10;

// --- Main Page Component ---
export default function SubscriptionManagementPage() {
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | 'all'>('all');
  const [filterTier, setFilterTier] = useState<SubscriptionTier | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // --- Filtering Logic ---
  const filteredSubscriptions = mockSubscriptions.filter(sub => {
    const statusMatch = filterStatus === 'all' || sub.status === filterStatus;
    const tierMatch = filterTier === 'all' || sub.subscriptionTier === filterTier;
    return statusMatch && tierMatch;
  });

  // --- Pagination Logic ---
  const totalPages = Math.max(1, Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE));
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  // --- CSV Export Logic ---
  const handleExport = () => {
    if (filteredSubscriptions.length === 0) {
      alert('No subscriptions available to export.');
      return;
    }
    const headers = ['User Name', 'Email', 'Tier', 'Status', 'Payment Status', 'Start Date', 'Expiry Date', 'Auto-Renew'];
    const csvRows = [
        headers.join(','),
        ...filteredSubscriptions.map(sub => [
            `"${sub.userName}"`,
            `"${sub.userEmail}"`,
            sub.subscriptionTier,
            sub.status,
            sub.paymentStatus,
            sub.startDate,
            sub.expiryDate,
            sub.autoRenew ? 'Yes' : 'No',
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'subscription_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- KPI & Chart Data ---
  const kpiData = {
    totalActive: mockSubscriptions.filter(s => s.status === 'Active').length,
    expiringSoon: mockSubscriptions.filter(s => s.status === 'Expiring Soon').length,
    renewalsThisMonth: mockSubscriptions.filter(s => s.status !== 'Expired').length, 
    newSubscriptions: mockSubscriptions.filter(s => new Date(s.startDate) > new Date(new Date().setDate(new Date().getDate() - 30))).length,
    totalRevenue: 5230, // Mock
    expired: mockSubscriptions.filter(s => s.status === 'Expired').length,
  };

  const tierDistribution = mockSubscriptions.reduce((acc, sub) => {
    acc[sub.subscriptionTier] = (acc[sub.subscriptionTier] || 0) + 1;
    return acc;
  }, {} as { [key in SubscriptionTier]: number });

  return (
    <div className="p-4 md:p-8 text-white relative">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Active Subscriptions" value={kpiData.totalActive} icon={<CheckCircle className="text-green-400" />} />
        <KpiCard title="Expired" value={kpiData.expired} icon={<XCircle className="text-red-400" />} />
        <KpiCard title="Expiring Soon" value={kpiData.expiringSoon} icon={<AlertTriangle className="text-yellow-400" />} />
        <KpiCard title="Monthly Revenue" value={`$${kpiData.totalRevenue}`} icon={<DollarSign className="text-purple-400" />} />
        
        {/* Tier Distribution Chart */}
        <Card className="md:col-span-2 lg:col-span-4 bg-gray-800/50 border-gray-700 text-white p-4 flex flex-col">
            <CardTitle className="text-md font-medium text-gray-400 flex items-center mb-4">
                <PieChart className="h-5 w-5 mr-2"/>
                Subscription Tier Distribution
            </CardTitle>
            <CardContent className="flex-grow flex items-center justify-around gap-6">
                <TierPieChart data={tierDistribution} />
                <div className="flex flex-col gap-3">
                    {Object.entries(tierDistribution).length === 0 ? (
                        <p className="text-sm text-gray-400">No tier distribution data.</p>
                    ) : (
                        Object.entries(tierDistribution).map(([tier, count]) => (
                            <div key={tier} className="flex items-center gap-2 text-sm">
                                <span className={`h-3 w-3 rounded-full ${tierColors[tier as SubscriptionTier]}`} />
                                <span className="font-semibold">{tier}</span>
                                <span className="text-gray-400">({count} users)</span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-gray-800/50 border-gray-700 p-4 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
            <FilterDropdown
                label="Status"
                options={['all', 'Active', 'Expired', 'Expiring Soon', 'Pending Renewal']}
                selectedValue={filterStatus}
                onValueChange={setFilterStatus}
            />
            <FilterDropdown
                label="Tier"
                options={['all', 'Free', 'Silver', 'Gold', 'Platinum']}
                selectedValue={filterTier}
                onValueChange={setFilterTier}
            />
            </div>
            <Button className="bg-primary/90 hover:bg-primary text-white disabled:opacity-60 disabled:cursor-not-allowed" onClick={handleExport} disabled={filteredSubscriptions.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export Report (CSV)
            </Button>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Tier</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Payment</TableHead>
                    <TableHead className="text-gray-300">Start Date</TableHead>
                    <TableHead className="text-gray-300">Expiry Date</TableHead>
                    <TableHead className="text-right text-gray-300">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedSubscriptions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-400 py-6">
                            No subscriptions found.
                        </TableCell>
                    </TableRow>
                ) : (
                    paginatedSubscriptions.map(sub => (
                        <TableRow key={sub.id} className="border-gray-800 hover:bg-gray-800/60">
                        <TableCell>
                            <div className="font-medium">{sub.userName}</div>
                            <div className="text-sm text-gray-400">{sub.userEmail}</div>
                        </TableCell>
                        <TableCell><Badge className={`${tierColors[sub.subscriptionTier]} border`}>{sub.subscriptionTier}</Badge></TableCell>
                        <TableCell><Badge className={`${statusColors[sub.status]} border`}>{sub.status}</Badge></TableCell>
                        <TableCell><Badge className={`${paymentStatusColors[sub.paymentStatus]} border-none`}>{sub.paymentStatus}</Badge></TableCell>
                        <TableCell>{sub.startDate}</TableCell>
                        <TableCell>{sub.expiryDate}</TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 text-white border-gray-700">
                                <DropdownMenuItem onClick={() => setSelectedSubscription(sub)}>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Send Renewal Reminder</DropdownMenuItem>
                                 <DropdownMenuSeparator className="bg-gray-700" />
                                <DropdownMenuItem className="text-yellow-400">Change Tier</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-400">Cancel Subscription</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                        </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
          </div>
        </CardContent>
        {/* Pagination Controls */}
        <div className="flex items-center justify-end gap-4 p-4 border-t border-gray-700">
            <span className="text-sm text-gray-400">Page {safeCurrentPage} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safeCurrentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safeCurrentPage >= totalPages}>
                Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
      </Card>

      <SubscriptionDetailDrawer subscription={selectedSubscription} onClose={() => setSelectedSubscription(null)} />
    </div>
  );
}

// --- Sub-Components ---
const KpiCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <Card className="bg-gray-800/50 border-gray-700 text-white">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent><div className="text-2xl font-bold">{value}</div></CardContent>
  </Card>
);

const FilterDropdown = ({ label, options, selectedValue, onValueChange }: { label: string, options: string[], selectedValue: string, onValueChange: (value: any) => void }) => (
    <select
      value={selectedValue}
      onChange={(e) => onValueChange(e.target.value)}
      className="bg-gray-900 border border-gray-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <option value="all">All {label}s</option>
      {options.filter(o => o !== 'all').map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
);

const TierPieChart = ({ data }: { data: { [key in SubscriptionTier]: number } }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    let accumulated = 0;

    const tierColorMap: { [key in SubscriptionTier]: string } = {
        Free: '#9CA3AF', // gray-400
        Silver: '#A8A29E', // stone-400
        Gold: '#FBBF24', // amber-400
        Platinum: '#38BDF8', // sky-400
    };

    if (total === 0) {
        return (
            <div className="relative w-36 h-36 rounded-full flex items-center justify-center border border-dashed border-gray-600 text-gray-400 text-xs text-center p-4">
                No data
            </div>
        );
    }

    // Create the conic-gradient string
    const gradientSegments = Object.entries(data).map(([tier, count]) => {
        const percentage = (count / total) * 100;
        const startAngle = (accumulated / 100) * 360;
        accumulated += percentage;
        const endAngle = (accumulated / 100) * 360;
        return `${tierColorMap[tier as SubscriptionTier]} ${startAngle}deg ${endAngle}deg`;
    });

    return (
        <div className="relative w-36 h-36 rounded-full"
             style={{ background: `conic-gradient(${gradientSegments.join(', ')})` }}
        >
             <div className="absolute inset-2 bg-gray-800 rounded-full"></div>
        </div>
    );
};
