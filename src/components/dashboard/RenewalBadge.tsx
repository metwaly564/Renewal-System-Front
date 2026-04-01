import { cn } from '@/utils/cn';
import { getDaysToRenewal } from '@/utils/daysToRenewal';
import { Badge } from '@/components/ui/Badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface RenewalBadgeProps {
  renewalDate: string | Date;
  className?: string;
}

const icons = {
  safe: <CheckCircle className="h-3 w-3" />,
  warning: <AlertTriangle className="h-3 w-3" />,
  expired: <Clock className="h-3 w-3" />,
};

export function RenewalBadge({ renewalDate, className }: RenewalBadgeProps) {
  const { status, label } = getDaysToRenewal(renewalDate);

  return (
    <Badge variant={status} className={cn('gap-1', className)}>
      {icons[status]}
      {label}
    </Badge>
  );
}
