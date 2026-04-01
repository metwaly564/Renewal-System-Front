import { useState } from 'react';
import { format } from 'date-fns';
import { type Subscription } from '@/services/subscriptions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RenewalBadge } from './RenewalBadge';
import { Pencil, Trash2, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  groupByClient: boolean;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
}

function StatusBadge({ status }: { status: Subscription['status'] }) {
  const map = {
    ACTIVE: { variant: 'safe' as const, label: 'Active' },
    PENDING_RENEWAL: { variant: 'warning' as const, label: 'Pending Renewal' },
    EXPIRED: { variant: 'expired' as const, label: 'Expired' },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function SubscriptionRow({
  sub,
  onEdit,
  onDelete,
}: {
  sub: Subscription;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <TableRow className="animate-fade-in">
      <TableCell className="font-medium text-foreground">{sub.clientName}</TableCell>
      <TableCell>{sub.serviceName}</TableCell>
      <TableCell>
        <a
          href={sub.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-primary hover:underline max-w-[180px] truncate"
        >
          {sub.url.replace(/^https?:\/\//, '')}
          <ExternalLink className="h-3 w-3 flex-shrink-0" />
        </a>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs font-mono">
          {sub.billingCycle}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">
        {format(new Date(sub.renewalDate), 'dd MMM yyyy')}
      </TableCell>
      <TableCell>
        <RenewalBadge renewalDate={sub.renewalDate} />
      </TableCell>
      <TableCell>
        <StatusBadge status={sub.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            title="Edit subscription"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            title="Delete subscription"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Grouped View ─────────────────────────────────────────────────────────────

function ClientGroup({
  clientName,
  subscriptions,
  onEdit,
  onDelete,
}: {
  clientName: string;
  subscriptions: Subscription[];
  onEdit: (sub: Subscription) => void;
  onDelete: (sub: Subscription) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <TableRow
        className="cursor-pointer bg-secondary/50 hover:bg-secondary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <TableCell colSpan={8} className="py-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            {clientName}
            <Badge variant="secondary" className="text-xs ml-1">
              {subscriptions.length}
            </Badge>
          </div>
        </TableCell>
      </TableRow>
      {isOpen &&
        subscriptions.map((sub) => (
          <SubscriptionRow
            key={sub.id}
            sub={sub}
            onEdit={() => onEdit(sub)}
            onDelete={() => onDelete(sub)}
          />
        ))}
    </>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────

export function SubscriptionTable({
  subscriptions,
  groupByClient,
  onEdit,
  onDelete,
}: SubscriptionTableProps) {
  const grouped = groupByClient
    ? subscriptions.reduce<Record<string, Subscription[]>>((acc, sub) => {
        if (!acc[sub.clientName]) acc[sub.clientName] = [];
        acc[sub.clientName].push(sub);
        return acc;
      }, {})
    : null;

  const tableHeaders = (
    <TableHeader>
      <TableRow>
        <TableHead>Client</TableHead>
        <TableHead>Service</TableHead>
        <TableHead>URL</TableHead>
        <TableHead>Billing</TableHead>
        <TableHead>Renewal Date</TableHead>
        <TableHead>Days Left</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
        <p className="text-lg font-medium">No subscriptions yet</p>
        <p className="text-sm">Click "Add Subscription" to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      {tableHeaders}
      <TableBody>
        {grouped
          ? Object.entries(grouped).map(([client, subs]) => (
              <ClientGroup
                key={client}
                clientName={client}
                subscriptions={subs}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          : subscriptions.map((sub) => (
              <SubscriptionRow
                key={sub.id}
                sub={sub}
                onEdit={() => onEdit(sub)}
                onDelete={() => onDelete(sub)}
              />
            ))}
      </TableBody>
    </Table>
  );
}

function Database({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('lucide lucide-database', className)}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  );
}
