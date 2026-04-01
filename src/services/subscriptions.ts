import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BillingCycle = 'MONTHLY' | 'YEARLY';
export type SubscriptionStatus = 'ACTIVE' | 'PENDING_RENEWAL' | 'EXPIRED';

export interface Credentials {
  username: string;
  password: string;
}

export interface Subscription {
  id: number;
  clientName: string;
  serviceName: string;
  url: string;
  credentials: Credentials;
  billingCycle: BillingCycle;
  renewalDate: string;
  status: SubscriptionStatus;
  notes: string | null;
  lastRenewedAt: string | null;
  reminderSent: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  expiringSoon: number;
  expired: number;
}

export interface CreateSubscriptionPayload {
  clientName: string;
  serviceName: string;
  url: string;
  credentials: Credentials;
  billingCycle: BillingCycle;
  renewalDate: string;
  status?: SubscriptionStatus;
  notes?: string;
}

export type UpdateSubscriptionPayload = Partial<CreateSubscriptionPayload>;

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function listSubscriptions(groupBy?: 'client'): Promise<Subscription[]> {
  const params = groupBy ? { groupBy } : {};
  const { data } = await api.get<{ data: Subscription[] | Record<string, Subscription[]> }>(
    '/subscriptions',
    { params }
  );
  // Always return flat array; grouping is handled in the UI
  if (Array.isArray(data.data)) return data.data;
  return Object.values(data.data).flat();
}

export async function getStats(): Promise<SubscriptionStats> {
  const { data } = await api.get<{ data: SubscriptionStats }>('/subscriptions/stats');
  return data.data;
}

export async function createSubscription(
  payload: CreateSubscriptionPayload
): Promise<Subscription> {
  const { data } = await api.post<{ data: Subscription }>('/subscriptions', payload);
  return data.data;
}

export async function updateSubscription(
  id: number,
  payload: UpdateSubscriptionPayload
): Promise<Subscription> {
  const { data } = await api.put<{ data: Subscription }>(`/subscriptions/${id}`, payload);
  return data.data;
}

export async function deleteSubscription(id: number): Promise<void> {
  await api.delete(`/subscriptions/${id}`);
}

export async function triggerRenewalCheck(): Promise<void> {
  await api.post('/subscriptions/trigger-check');
}
