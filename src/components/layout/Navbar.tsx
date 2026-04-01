import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { RefreshCw, LogOut, Shield } from 'lucide-react';
import { useTriggerRenewalCheck } from '@/hooks/useSubscriptions';

export function Navbar() {
  const { admin, logout } = useAuth();
  const triggerCheck = useTriggerRenewalCheck();

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40 flex items-center px-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-auto">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <span className="text-sm font-semibold text-foreground">Renewal System</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Internal Asset Management
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => triggerCheck.mutate()}
          disabled={triggerCheck.isPending}
          title="Manually run renewal check & send alerts"
          className="gap-1.5 text-xs"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${triggerCheck.isPending ? 'animate-spin' : ''}`}
          />
          <span className="hidden sm:inline">Run Check</span>
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground border-l border-border pl-3">
          <span className="hidden sm:inline text-xs">{admin?.email}</span>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="h-8 w-8">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
