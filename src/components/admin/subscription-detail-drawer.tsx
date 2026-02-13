'use client';

import { Subscription, SubscriptionTier, SubscriptionStatus } from '@/lib/subscriptions-mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Calendar, RefreshCw, Edit, Trash2, Bell, Check, Clock } from 'lucide-react';
import { MotionDiv, AnimatePresence } from '@/components/utils/motion-div';

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

interface SubscriptionDetailDrawerProps {
  subscription: Subscription | null;
  onClose: () => void;
}

export function SubscriptionDetailDrawer({ subscription, onClose }: SubscriptionDetailDrawerProps) {
  return (
    <AnimatePresence>
      {subscription && (
        <MotionDiv
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-full max-w-lg bg-gray-900 border-l border-gray-700 shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0">
            <h2 className="text-xl font-bold">Subscription Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-800">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-grow p-6 overflow-y-auto">
            {/* User Info */}
            <div className="mb-8 text-center">
              <div className="inline-block p-1 bg-gradient-to-tr from-primary to-sky-500 rounded-full mb-3">
                 <div className="bg-gray-900 rounded-full p-3">
                    <p className="text-3xl font-bold">{subscription.userName.charAt(0)}</p>
                 </div>
              </div>
              <p className="text-2xl font-bold">{subscription.userName}</p>
              <p className="text-gray-400">{subscription.userEmail}</p>
            </div>

            {/* Subscription Status */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <InfoCard label="Tier" value={subscription.subscriptionTier} badgeClass={`${tierColors[subscription.subscriptionTier]} border`} />
              <InfoCard label="Status" value={subscription.status} badgeClass={`${statusColors[subscription.status]} border`} />
              <InfoCard label="Start Date" value={subscription.startDate} />
              <InfoCard label="Expiry Date" value={subscription.expiryDate} />
            </div>

            {/* Timeline & History (Now Dynamic) */}
            <div className="space-y-8">
              <HistorySection title="Subscription Timeline" icon={<Calendar />}>
                <TimelineEvent date={subscription.startDate} description={`Subscription Started (${subscription.subscriptionTier})`} />
                {subscription.status === 'Expired' && (
                    <TimelineEvent date={subscription.expiryDate} description="Subscription Expired" isLast />
                )}
                 {subscription.status === 'Active' && (
                    <TimelineEvent date={subscription.expiryDate} description="Next Renewal" iconType="clock" isLast />
                )}
              </HistorySection>

              <HistorySection title="Payment History" icon={<RefreshCw />}>
                 {subscription.lastPaymentId !== 'N/A' ? (
                    <PaymentEvent 
                        date={subscription.startDate} 
                        amount="$50.00" // Mock amount
                        transactionId={subscription.lastPaymentId} 
                    />
                 ) : (
                    <p className="text-sm text-gray-500 pl-6">No payment history for this subscription.</p>
                 )}
              </HistorySection>
            </div>
          </div>

          {/* Admin Actions Footer */}
          <div className="p-6 border-t border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
             <h3 className="text-lg font-semibold mb-4 flex items-center"><Edit className="h-5 w-5 mr-2"/> Admin Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300">Change Tier</Button>
              <Button variant="outline" className="border-red-400/50 text-red-400 hover:bg-red-400/10 hover:text-red-300">Cancel</Button>
              <Button variant="outline" className="col-span-2 border-blue-400/50 text-blue-400 hover:bg-blue-400/10 hover:text-blue-300"><Bell className="h-4 w-4 mr-2"/> Send Renewal Reminder</Button>
            </div>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}

// --- Sub-Components for the Drawer ---
const InfoCard = ({ label, value, badgeClass }: { label: string; value: string; badgeClass?: string }) => (
  <div className="bg-gray-800/50 p-4 rounded-lg text-center">
    <p className="text-sm text-gray-400 mb-1">{label}</p>
    {badgeClass ? <Badge className={badgeClass}>{value}</Badge> : <p className="font-semibold text-lg">{value}</p>}
  </div>
);

const HistorySection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        <div className="border-l-2 border-gray-700 ml-2 space-y-6">
            {children}
        </div>
    </div>
);

const TimelineEvent = ({ date, description, iconType = 'check', isLast = false }: { date: string, description: string, iconType?: 'check' | 'clock', isLast?: boolean }) => {
    const Icon = iconType === 'check' ? Check : Clock;
    return (
        <div className="relative">
            <div className={`absolute -left-3.5 top-1 h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center`}>
                <Icon className="h-4 w-4"/>
            </div>
            {!isLast && <div className="absolute -left-[13px] top-8 h-[calc(100%_-_4px)] w-0.5 bg-gray-700"/>}
            <div className="pl-8">
                <p className="text-sm text-gray-400">{date}</p>
                <p className="font-medium">{description}</p>
            </div>
        </div>
    )
};

const PaymentEvent = ({date, amount, transactionId}: {date: string, amount: string, transactionId: string}) => (
    <div className="pl-6">
        <p className="font-semibold text-green-400">{amount} - Successful</p>
        <p className="text-sm text-gray-400">Date: {date}</p>
        <p className="text-xs text-gray-500">Transaction ID: {transactionId}</p>
    </div>
);
