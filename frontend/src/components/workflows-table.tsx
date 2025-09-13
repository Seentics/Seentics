
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { deleteWorkflow, getWorkflows, updateWorkflow, type Workflow } from '@/lib/workflow-api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, Eye, FileJson, Loader2, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Switch } from './ui/switch';


interface WorkflowsTableProps {
  siteId: string | null | undefined;
}

export function WorkflowsTable({ siteId }: WorkflowsTableProps) {

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const params = useParams();
  const websiteId = params.websiteId as string;
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Paused' | 'Draft'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const { data: workflowsData, isLoading } = useQuery<Workflow[]>({
    queryKey: ['workflows', siteId],
    queryFn: () => getWorkflows(siteId as string),
    enabled: !!siteId,
  });

  // Ensure workflows is always an array (normalize different API shapes)
  const rawWorkflows: any = workflowsData as any;
  const workflows: Workflow[] = Array.isArray(rawWorkflows)
    ? rawWorkflows
    : Array.isArray(rawWorkflows?.workflows)
      ? rawWorkflows.workflows
      : Array.isArray(rawWorkflows?.data)
        ? rawWorkflows.data
        : [];

  console.log("Workflows data", workflows)

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const wf of workflows) {
      if (wf?.category) set.add(wf.category);
    }
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [workflows]);

  const filteredWorkflows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return workflows.filter((wf: Workflow) => {
      const matchesSearch = !q || wf.name.toLowerCase().includes(q) || (wf.category || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || wf.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || (wf.category || '') === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [workflows, searchQuery, statusFilter, categoryFilter]);

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteWorkflow(id);
      await queryClient.invalidateQueries({ queryKey: ['workflows', siteId] });
      toast({
        title: 'Workflow Deleted',
        description: `"${name}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete workflow.',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (workflow: Workflow, newStatus: 'Active' | 'Paused') => {
    try {
      await updateWorkflow(workflow.id, { status: newStatus });
      toast({
        title: 'Workflow Updated',
        description: `"${workflow.name}" is now ${newStatus.toLowerCase()}.`,
      });
      await queryClient.invalidateQueries({ queryKey: ['workflows', siteId] });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update workflow status.`,
        variant: 'destructive',
      });
    }
  };

  const handleExportJson = (workflow: Workflow) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      name: workflow.name,
      category: workflow.category,
      nodes: workflow.nodes,
      edges: workflow.edges
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${workflow.name.replace(/\s+/g, '_')}_${workflow.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const contextualizeUrl = (url: string) => {
    // Handle different URL patterns
    if (url === '/websites') {
      return `/websites/${websiteId}`;
    }
    if (url.startsWith('workflows/')) {
      return `/websites/${websiteId}/workflows/${url.split('workflows/')[1]}`;
    }
    if (url.startsWith('/websites/')) {
      return url; // Already properly formatted
    }
    // For other URLs, add siteId as query parameter
    return `${url}${siteId ? `?siteId=${siteId}` : ''}`;
  }

  if (!siteId) {
    return null;
  }

  return (
    <Card className="bg-card shadow-md rounded-none  overflow-hidden">
      <CardHeader className="pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-foreground">Workflows</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">Manage and monitor your automated workflows.</CardDescription>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative md:w-64">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                className="pl-9"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('All'); setCategoryFilter('All'); }}>Clear</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="w-[30%] font-semibold text-foreground">Name</TableHead>
                <TableHead className="font-semibold text-foreground">Status</TableHead>
                <TableHead className="text-center font-semibold text-foreground">Active</TableHead>
                <TableHead className="font-semibold text-foreground">Total Triggers</TableHead>
                <TableHead className="font-semibold text-foreground">Completion Rate</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  </TableCell>
                </TableRow>
              ) : !siteId ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Please select a website to view its workflows.
                  </TableCell>
                </TableRow>
              ) : workflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No workflows found. <Link href={`/websites/${websiteId}/workflows/edit/new`} className="text-primary hover:underline">Create one now!</Link>
                  </TableCell>
                </TableRow>
              ) : Array.isArray(workflows) && filteredWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No workflows match your search or filters.
                  </TableCell>
                </TableRow>
              ) : Array.isArray(filteredWorkflows) ? (
                filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <Link href={contextualizeUrl(`workflows/${workflow.id}`)} className="font-medium hover:underline text-foreground">
                        {workflow.name}
                      </Link>
                      <div className="text-sm text-muted-foreground mt-1">
                        {workflow.category}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          workflow.status === 'Active'
                            ? 'default'
                            : workflow.status === 'Paused'
                              ? 'secondary'
                              : 'outline'
                        }
                        className={
                          workflow.status === 'Active'
                            ? 'bg-green-600/20 text-green-700 dark:bg-green-400/10 dark:text-green-400 border-transparent hover:bg-green-600/30'
                            : ''
                        }
                      >
                        {workflow.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        id={`status-switch-${workflow.id}`}
                        checked={workflow.status === 'Active'}
                        onCheckedChange={(isChecked) => handleStatusChange(workflow, isChecked ? 'Active' : 'Paused')}
                        aria-label="Activate workflow"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{(workflow.totalTriggers || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{workflow.completionRate}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem asChild>
                                <Link href={contextualizeUrl(`workflows/edit/${workflow.id}`)}>
                                  <Pencil />
                                  <span>Edit</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/websites/${websiteId}/workflows/${workflow.id}`} target="_blank">
                                  <Eye />
                                  <span>Preview</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy />
                                <span>Duplicate</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleExportJson(workflow)}>
                                <FileJson />
                                <span>Export JSON</span>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the workflow &quot;{workflow.name}&quot;.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(workflow.id, workflow.name)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
