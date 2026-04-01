import { differenceInCalendarDays } from 'date-fns';

export type RenewalStatus = 'safe' | 'warning' | 'expired';

export interface DaysToRenewalResult {
  days: number;
  status: RenewalStatus;
  label: string;
}

/**
 * Calculates days until renewalDate and returns a status for color coding.
 * - expired:  date is in the past
 * - warning:  1–7 days remaining
 * - safe:     8+ days remaining
 */
export function getDaysToRenewal(renewalDate: string | Date): DaysToRenewalResult {
  const target = typeof renewalDate === 'string' ? new Date(renewalDate) : renewalDate;
  const days = differenceInCalendarDays(target, new Date());

  if (days < 0) {
    return { days, status: 'expired', label: `${Math.abs(days)}d overdue` };
  }
  if (days === 0) {
    return { days, status: 'warning', label: 'Today!' };
  }
  if (days <= 7) {
    return { days, status: 'warning', label: `${days}d left` };
  }
  return { days, status: 'safe', label: `${days}d left` };
}
