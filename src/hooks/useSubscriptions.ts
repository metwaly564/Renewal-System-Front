import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  getStats,
  triggerRenewalCheck,
  type CreateSubscriptionPayload,
  type UpdateSubscriptionPayload,
} from '../services/subscriptions';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  list: () => [...subscriptionKeys.all, 'list'] as const,
  stats: () => [...subscriptionKeys.all, 'stats'] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useSubscriptions() {
  return useQuery({
    queryKey: subscriptionKeys.list(),
    queryFn: () => listSubscriptions(),
    staleTime: 30_000,
  });
}

export function useSubscriptionStats() {
  return useQuery({
    queryKey: subscriptionKeys.stats(),
    queryFn: getStats,
    staleTime: 30_000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSubscriptionPayload) => createSubscription(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSubscriptionPayload }) =>
      updateSubscription(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSubscription(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}

export function useTriggerRenewalCheck() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: triggerRenewalCheck,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
}
