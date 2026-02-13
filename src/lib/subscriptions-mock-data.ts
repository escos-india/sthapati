export type SubscriptionTier = 'Free' | 'Silver' | 'Gold' | 'Platinum';
export type SubscriptionStatus = 'Active' | 'Expired' | 'Expiring Soon' | 'Pending Renewal';

export interface Subscription {
  id: string;
  userName: string;
  userEmail: string;
  subscriptionTier: SubscriptionTier;
  startDate: string;
  expiryDate: string;
  renewalDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  lastPaymentId: string;
  status: SubscriptionStatus;
  autoRenew: boolean;
}

export const mockSubscriptions: Subscription[] = [];
