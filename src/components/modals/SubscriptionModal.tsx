import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { type Subscription, type CreateSubscriptionPayload } from '@/services/subscriptions';
import { useCreateSubscription, useUpdateSubscription } from '@/hooks/useSubscriptions';
import { Loader2 } from 'lucide-react';

// ─── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  serviceName: z.string().min(1, 'Service name is required'),
  url: z.string().url('Must be a valid URL (include https://)'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']),
  renewalDate: z.string().min(1, 'Renewal date is required'),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editTarget?: Subscription | null;
}

export function SubscriptionModal({
  open,
  onOpenChange,
  editTarget,
}: SubscriptionModalProps) {
  const isEditing = !!editTarget;
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billingCycle: 'YEARLY',
      renewalDate: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (editTarget) {
      reset({
        clientName: editTarget.clientName,
        serviceName: editTarget.serviceName,
        url: editTarget.url,
        username: editTarget.credentials.username,
        password: editTarget.credentials.password,
        billingCycle: editTarget.billingCycle,
        renewalDate: format(new Date(editTarget.renewalDate), 'yyyy-MM-dd'),
        notes: editTarget.notes ?? '',
      });
    } else {
      reset({
        billingCycle: 'YEARLY',
        renewalDate: format(new Date(), 'yyyy-MM-dd'),
        clientName: '',
        serviceName: '',
        url: '',
        username: '',
        password: '',
        notes: '',
      });
    }
  }, [editTarget, reset, open]);

  const onSubmit = async (values: FormValues) => {
    const payload: CreateSubscriptionPayload = {
      clientName: values.clientName,
      serviceName: values.serviceName,
      url: values.url,
      credentials: { username: values.username, password: values.password },
      billingCycle: values.billingCycle,
      renewalDate: new Date(values.renewalDate).toISOString(),
      notes: values.notes,
    };

    if (isEditing && editTarget) {
      await updateMutation.mutateAsync({ id: editTarget.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '✏️ Edit Subscription' : '➕ Add Subscription'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Client & Service */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                placeholder="Tarsiyah"
                {...register('clientName')}
                className={errors.clientName ? 'border-destructive' : ''}
              />
              {errors.clientName && (
                <p className="text-xs text-destructive">{errors.clientName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                placeholder="Hetzner"
                {...register('serviceName')}
                className={errors.serviceName ? 'border-destructive' : ''}
              />
              {errors.serviceName && (
                <p className="text-xs text-destructive">{errors.serviceName.message}</p>
              )}
            </div>
          </div>

          {/* URL */}
          <div className="space-y-1.5">
            <Label htmlFor="url">Service URL</Label>
            <Input
              id="url"
              placeholder="https://console.hetzner.cloud"
              type="url"
              {...register('url')}
              className={errors.url ? 'border-destructive' : ''}
            />
            {errors.url && <p className="text-xs text-destructive">{errors.url.message}</p>}
          </div>

          {/* Credentials */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">
              🔐 Credentials (stored encrypted)
            </Label>
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="space-y-1.5">
                <Label htmlFor="username">Username / Email</Label>
                <Input
                  id="username"
                  placeholder="admin@company.com"
                  autoComplete="off"
                  {...register('username')}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className="text-xs text-destructive">{errors.username.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...register('password')}
                  className={errors.password ? 'border-destructive' : ''}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Billing Cycle & Renewal Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Controller
                name="billingCycle"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="billingCycle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="renewalDate">Renewal Date</Label>
              <Input
                id="renewalDate"
                type="date"
                {...register('renewalDate')}
                className={errors.renewalDate ? 'border-destructive' : ''}
              />
              {errors.renewalDate && (
                <p className="text-xs text-destructive">{errors.renewalDate.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about this subscription..."
              rows={2}
              {...register('notes')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                'Save Changes'
              ) : (
                'Add Subscription'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
