import { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { SubscriptionTable } from '@/components/dashboard/SubscriptionTable';
import { SubscriptionModal } from '@/components/modals/SubscriptionModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSubscriptions, useSubscriptionStats } from '@/hooks/useSubscriptions';
import { type Subscription } from '@/services/subscriptions';
import {
  Plus,
  LayoutList,
  Users,
  Search,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export function DashboardPage() {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [groupByClient, setGroupByClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Subscription | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subscription | null>(null);

  // ─── Data ──────────────────────────────────────────────────────────────────
  const { data: subscriptions = [], isLoading, isError, refetch } = useSubscriptions();
  const { data: stats, isLoading: statsLoading } = useSubscriptionStats();

  // ─── Filtered subscriptions ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return subscriptions;
    const q = searchQuery.toLowerCase();
    return subscriptions.filter(
      (s) =>
        s.clientName.toLowerCase().includes(q) ||
        s.serviceName.toLowerCase().includes(q) ||
        s.url.toLowerCase().includes(q)
    );
  }, [subscriptions, searchQuery]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleEdit = (sub: Subscription) => setEditTarget(sub);
  const handleDelete = (sub: Subscription) => setDeleteTarget(sub);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Asset Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Manage client subscriptions and track renewal dates
            </p>
          </div>
          <Button
            onClick={() => setAddModalOpen(true)}
            className="sm:ml-auto gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </Button>
        </div>

        {/* Stats cards */}
        <StatsCards
          stats={stats ?? { total: 0, active: 0, expiringSoon: 0, expired: 0 }}
          isLoading={statsLoading}
        />

        {/* Table container */}
        <div className="rounded-xl border border-border bg-card shadow-sm animate-fade-in">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border-b border-border">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by client, service, URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>

            {/* Group toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-secondary/50">
              <Button
                variant={groupByClient ? 'ghost' : 'secondary'}
                size="sm"
                onClick={() => setGroupByClient(false)}
                className="h-7 text-xs gap-1.5"
              >
                <LayoutList className="h-3.5 w-3.5" />
                Flat
              </Button>
              <Button
                variant={groupByClient ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setGroupByClient(true)}
                className="h-7 text-xs gap-1.5"
              >
                <Users className="h-3.5 w-3.5" />
                By Client
              </Button>
            </div>

            {/* Results count */}
            <span className="text-xs text-muted-foreground ml-auto hidden sm:block">
              {filtered.length} of {subscriptions.length} subscriptions
            </span>
          </div>

          {/* Table content */}
          <div className="p-4">
            {isLoading ? (
              <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                <RefreshCw className="h-6 w-6 animate-spin opacity-50" />
                <p className="text-sm">Loading subscriptions...</p>
              </div>
            ) : isError ? (
              <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
                <AlertCircle className="h-8 w-8 text-destructive opacity-70" />
                <p className="text-sm font-medium">Failed to load subscriptions</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Try again
                </Button>
              </div>
            ) : (
              <SubscriptionTable
                subscriptions={filtered}
                groupByClient={groupByClient}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SubscriptionModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        editTarget={null}
      />
      <SubscriptionModal
        open={!!editTarget}
        onOpenChange={(open) => { if (!open) setEditTarget(null); }}
        editTarget={editTarget}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        target={deleteTarget}
      />
    </div>
  );
}
