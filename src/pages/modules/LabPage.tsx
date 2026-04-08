import { useState, useEffect, useCallback } from 'react';
import { FlaskConical, Search, ClipboardCheck, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function LabPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tests, setTests] = useState<any[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);

  const hospitalId = user?.hospital_id;

  const fetchData = useCallback(async () => {
    if (!hospitalId) return;
    const { data } = await supabase.from('lab_tests').select('*, patients(full_name)').eq('hospital_id', hospitalId).order('created_at', { ascending: false });
    setTests(data || []);
  }, [hospitalId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const submitResults = async () => {
    if (!selectedTest || !results) return;
    setLoading(true);
    await supabase.from('lab_tests').update({
      status: 'completed', results, technician_id: user?.id, completed_at: new Date().toISOString(),
    }).eq('id', selectedTest.id);
    toast({ title: 'Results submitted' });
    setShowResult(false);
    setResults('');
    fetchData();
    setLoading(false);
  };

  const startTest = async (test: any) => {
    await supabase.from('lab_tests').update({ status: 'in_progress', technician_id: user?.id }).eq('id', test.id);
    fetchData();
  };

  const pending = tests.filter(t => t.status === 'requested');
  const inProgress = tests.filter(t => t.status === 'in_progress');
  const completed = tests.filter(t => t.status === 'completed');

  const statusBadge = (s: string) => {
    if (s === 'completed') return 'bg-success/10 text-success';
    if (s === 'in_progress') return 'bg-primary/10 text-primary';
    return 'bg-warning/10 text-warning';
  };

  const renderTable = (items: any[], showActions = false) => items.length === 0 ? null : (
    <Table>
      <TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Test</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>{showActions && <TableHead></TableHead>}</TableRow></TableHeader>
      <TableBody>{items.map(t => (
        <TableRow key={t.id}>
          <TableCell className="font-medium">{(t as any).patients?.full_name}</TableCell>
          <TableCell>{t.test_name}</TableCell>
          <TableCell><Badge className={statusBadge(t.status)}>{t.status}</Badge></TableCell>
          <TableCell className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
          {showActions && <TableCell className="space-x-2">
            {t.status === 'requested' && <Button size="sm" variant="outline" onClick={() => startTest(t)}>Start</Button>}
            {t.status === 'in_progress' && <Button size="sm" onClick={() => { setSelectedTest(t); setShowResult(true); }}>Enter Results</Button>}
          </TableCell>}
        </TableRow>
      ))}</TableBody>
    </Table>
  );

  return (
    <div className="module-page">
      <PageHeader title="Laboratory" description="Test requests & results" icon={FlaskConical} />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="progress">In Progress ({inProgress.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <div className="data-table-wrapper">
            {pending.length === 0 ? <EmptyState icon={FlaskConical} title="No pending tests" description="Lab requests from doctors appear here." /> : renderTable(pending, true)}
          </div>
        </TabsContent>
        <TabsContent value="progress">
          <div className="data-table-wrapper">
            {inProgress.length === 0 ? <EmptyState icon={FlaskConical} title="No tests in progress" description="Tests you're processing appear here." /> : renderTable(inProgress, true)}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="data-table-wrapper">
            {completed.length === 0 ? <EmptyState icon={ClipboardCheck} title="No completed tests" description="Completed results listed here." /> : renderTable(completed)}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Enter Lab Results</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Test</Label><Input disabled value={selectedTest?.test_name || ''} /></div>
            <div className="space-y-2"><Label>Results *</Label><Textarea placeholder="Enter test results..." rows={5} value={results} onChange={e => setResults(e.target.value)} /></div>
          </div>
          <Button className="w-full mt-2" onClick={submitResults} disabled={loading || !results}>
            {loading ? 'Submitting...' : 'Submit Results'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
