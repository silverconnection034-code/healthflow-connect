import { useEffect, useState, useCallback } from 'react';
import { FileText, Search, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    if (!user?.hospital_id) return;
    const { data } = await supabase.from('audit_logs').select('*').eq('hospital_id', user.hospital_id).order('created_at', { ascending: false }).limit(100);
    setLogs(data || []);
  }, [user?.hospital_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = logs.filter(l => l.action.toLowerCase().includes(search.toLowerCase()) || l.entity_type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="module-page">
      <PageHeader title="Audit Logs" description="Track all user actions and changes" icon={FileText}>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search logs..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="data-table-wrapper">
        {filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No audit logs" description="All user actions will be recorded here." />
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Details</TableHead><TableHead>Time</TableHead></TableRow></TableHeader>
            <TableBody>{filtered.map(l => (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.action}</TableCell>
                <TableCell>{l.entity_type}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{l.details || '—'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}</TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
