import { FileText, Search, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
  return (
    <div className="module-page">
      <PageHeader title="Audit Logs" description="Track all user actions and changes" icon={FileText}>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
      </PageHeader>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search logs..." className="pl-9" />
      </div>

      <div className="data-table-wrapper">
        <EmptyState icon={FileText} title="No audit logs" description="All user actions — logins, data changes, and system events — will be recorded here." />
      </div>
    </div>
  );
}
