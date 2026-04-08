import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setNotifications(data || []);
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markAllRead = async () => {
    if (!user?.id) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    toast({ title: 'All marked as read' });
    fetchData();
  };

  const typeIcon = (t: string) => {
    if (t === 'success') return 'bg-success/10 text-success';
    if (t === 'warning') return 'bg-warning/10 text-warning';
    if (t === 'error') return 'bg-destructive/10 text-destructive';
    return 'bg-primary/10 text-primary';
  };

  return (
    <div className="module-page">
      <PageHeader title="Notifications" description="Alerts & system notifications" icon={Bell}>
        <Button variant="outline" size="sm" onClick={markAllRead}><CheckCheck className="h-4 w-4 mr-2" />Mark All Read</Button>
      </PageHeader>

      {notifications.length === 0 ? (
        <div className="data-table-wrapper">
          <EmptyState icon={Bell} title="No notifications" description="You'll receive alerts for appointments, lab results, payments, and system events." />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`glass-panel rounded-lg p-4 flex items-start gap-3 ${!n.is_read ? 'border-l-4 border-l-primary' : ''}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${typeIcon(n.type)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
