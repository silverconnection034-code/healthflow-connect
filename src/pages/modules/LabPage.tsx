import { useState } from 'react';
import { FlaskConical, Search, ClipboardCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function LabPage() {
  const [showResult, setShowResult] = useState(false);

  return (
    <div className="module-page">
      <PageHeader title="Laboratory" description="Test requests & results" icon={FlaskConical} />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search tests..." className="pl-9" />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Tests</TabsTrigger>
          <TabsTrigger value="progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <div className="data-table-wrapper">
            <EmptyState icon={FlaskConical} title="No pending tests" description="Lab test requests from doctors will appear here." />
          </div>
        </TabsContent>
        <TabsContent value="progress">
          <div className="data-table-wrapper">
            <EmptyState icon={FlaskConical} title="No tests in progress" description="Tests you're currently processing will appear here." />
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="data-table-wrapper">
            <EmptyState icon={ClipboardCheck} title="No completed tests" description="Completed test results will be listed here." />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display">Enter Lab Results</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Test</Label><Input disabled placeholder="Test name" /></div>
            <div className="space-y-2"><Label>Results</Label><Textarea placeholder="Enter test results..." rows={5} /></div>
          </div>
          <Button className="w-full mt-2" disabled>Submit Results (Connect Cloud)</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
