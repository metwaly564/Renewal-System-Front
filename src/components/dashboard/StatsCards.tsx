import { type SubscriptionStats } from '@/services/subscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Activity, AlertTriangle, Clock, Database } from 'lucide-react';

interface StatsCardsProps {
  stats: SubscriptionStats;
  isLoading: boolean;
}

const statItems = [
  {
    key: 'total' as const,
    label: 'Total Subscriptions',
    icon: Database,
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    key: 'active' as const,
    label: 'Active',
    icon: Activity,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    key: 'expiringSoon' as const,
    label: 'Expiring Soon',
    icon: AlertTriangle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    key: 'expired' as const,
    label: 'Expired',
    icon: Clock,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
];

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-4 bg-muted rounded w-24" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-12" />
      </CardContent>
    </Card>
  );
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map(({ key, label, icon: Icon, color, bg, border }) => (
        <Card
          key={key}
          className={`border ${border} transition-all duration-200 hover:shadow-lg animate-fade-in`}
        >
          <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${color}`}>{stats[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
