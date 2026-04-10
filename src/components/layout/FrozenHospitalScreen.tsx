import { AlertTriangle, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function FrozenHospitalScreen() {
  const { logout, hospital } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, hsl(210 35% 55%), hsl(210 30% 65%), hsl(210 25% 60%))' }}>
      <div className="w-full max-w-md">
        <div className="rounded-lg overflow-hidden shadow-2xl border border-white/30">
          <div className="px-6 py-4 text-center" style={{ background: 'linear-gradient(180deg, hsl(0 70% 50%), hsl(0 75% 40%))' }}>
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-300" />
              <h1 className="text-xl font-bold text-white font-display">Account Suspended</h1>
            </div>
          </div>
          <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 space-y-6 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
            <div>
              <h2 className="text-lg font-bold font-display mb-2">Hospital Access Restricted</h2>
              <p className="text-sm text-muted-foreground">
                Your hospital account <strong>({hospital?.name})</strong> has been suspended due to an expired or unpaid subscription.
              </p>
            </div>
            <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
              <p className="text-sm font-medium text-destructive">All hospital operations are disabled until the subscription is renewed.</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Please contact your hospital administrator or platform support:</p>
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4" />
                <span>0728825152 / 01116679286</span>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={logout}>Sign Out</Button>
            <p className="text-xs text-muted-foreground">Powered by Abancool Technology</p>
          </div>
        </div>
      </div>
    </div>
  );
}
