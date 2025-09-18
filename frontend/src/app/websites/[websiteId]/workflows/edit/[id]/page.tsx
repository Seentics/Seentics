"use client";

import Link from "next/link";
import React, {
  useState,
  useCallback,
  useRef,
  DragEvent,
  useEffect,
} from "react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
  NodeTypes,
  Connection,
  useReactFlow,
  ReactFlowProvider,
  MiniMap,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Save,
  Eye,
  Loader2,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Target,
  Settings,
  Palette,
  Layers,
  Code,
  Lightbulb,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Logo } from '@/components/ui/logo';
import { NodePalette } from "@/components/flow/node-palette";
import { addWorkflow, getWorkflow, updateWorkflow } from "@/lib/workflow-api";
import { getWorkflowTemplateById } from "@/lib/workflow-templates";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomNode, CustomNodeData } from "@/components/flow/custom-node";
import { SettingsPanel } from "@/components/flow/settings-panel";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";

const nodeTypes: NodeTypes = { custom: CustomNode };
const getId = () => `dnd-node_${Date.now()}_${Math.random()}`;



function WorkflowGuideModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            Welcome to the Workflow Builder!
          </DialogTitle>
          <DialogDescription className="text-base">
            Learn how to create powerful automation workflows in just a few steps. This guide will help you build effective workflows that engage your visitors.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-8 py-6 flex-1 overflow-y-auto pr-2">
          {/* Step 1 */}
          <div className="flex gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-lg flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Add Components
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Drag triggers, conditions, and actions from the left panel onto the canvas. Start with a trigger (like "Page Visit" or "Button Click"), add conditions to check specific criteria, and then add actions (like "Show Modal" or "Send Email").
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>💡 Tip:</strong> Popular triggers include "Page View", "Scroll Depth", and "Element Click". These are great starting points for most workflows.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-lg flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Connect Your Workflow
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Click and drag from the bottom handle of one node to the top handle of another to create connections. You can create complex flows with multiple conditions and actions. Each connection defines the sequence of your automation.
              </p>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>🔗 Pro Tip:</strong> Use conditions to create branching logic. For example, show different content to mobile vs desktop users, or create different paths for new vs returning visitors.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-lg flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Configure Settings
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Click on any node to select it. The settings panel on the right will show configuration options for that specific component. Configure conditions, set up action parameters, and customize triggers.
              </p>
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  <strong>⚙️ Advanced:</strong> Many actions support custom HTML, CSS, and JavaScript. You can also use placeholders like <code className="bg-white dark:bg-gray-800 px-1 rounded">&#123;&#123;visitor.email&#125;&#125;</code> to personalize content.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold text-lg flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Eye className="h-5 w-5 text-orange-600" />
                Save & Test
              </h4>
              <p className="text-base text-muted-foreground leading-relaxed mb-3">
                Click "Save Workflow" to name and save your automation. Use "Preview" to test how it works before activating it on your website. The preview mode lets you see exactly how your workflow will behave.
              </p>
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>🧪 Testing:</strong> Always preview your workflow before saving. This helps catch configuration errors and ensures the user experience is smooth.
                </p>
              </div>
            </div>
          </div>

          {/* Complex Workflows */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-blue-600" />
              Building Complex Workflows
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h5 className="font-medium text-blue-900 dark:text-blue-100">Multiple Conditions</h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Add several condition nodes to create branching logic. For example, check if a user is on a specific page AND has been on the site for more than 30 seconds.
                </p>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-blue-900 dark:text-blue-100">Multiple Actions</h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Chain multiple actions together. Show a popup, then send an email, then redirect to another page.
                </p>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-blue-900 dark:text-blue-100">Parallel Paths</h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Create different workflows for different user segments or behaviors using A/B split and branch split nodes.
                </p>
              </div>
              <div className="space-y-3">
                <h5 className="font-medium text-blue-900 dark:text-blue-100">Advanced Logic</h5>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Use join nodes to wait for multiple conditions, frequency caps to prevent spam, and time windows for scheduling.
                </p>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Pro Tips & Best Practices
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Workflow Structure</h5>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Every workflow needs at least one trigger and one action</li>
                  <li>• Use descriptive names for your workflows</li>
                  <li>• Test on different devices and browsers</li>
                  <li>• Keep workflows focused on a single goal</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Performance & UX</h5>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Use frequency caps to avoid overwhelming users</li>
                  <li>• Test timing and delays for optimal engagement</li>
                  <li>• Ensure mobile-friendly content and interactions</li>
                  <li>• Monitor analytics to optimize performance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button onClick={onClose} size="lg" className="px-8">
            Got It! Let's Build
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



function WorkflowBuilder() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  console.log("WorkflowBuilder params:", params);
  console.log("WorkflowBuilder searchParams:", searchParams);

  const siteId = params?.websiteId as string;
  const workflowId = params.id as string;

  console.log("Extracted siteId:", siteId);
  console.log("Extracted workflowId:", workflowId);

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView } = useReactFlow();

  const isNewWorkflow = workflowId === "new";
  const templateId = searchParams.get('template');
  const funnelContext = searchParams.get('context');
  const funnelId = searchParams.get('funnelId');
  const funnelName = searchParams.get('funnelName');
  const eventType = searchParams.get('eventType');
  const defaultWorkflowData = searchParams.get('defaultWorkflow');
  
  console.log("=== Workflow Edit Page Debug ===");
  console.log("workflowId:", workflowId);
  console.log("isNewWorkflow:", isNewWorkflow);
  console.log("templateId:", templateId);
  console.log("funnelContext:", funnelContext);
  console.log("funnelId:", funnelId);
  console.log("funnelName:", funnelName);
  console.log("eventType:", eventType);
  console.log("user:", user);
  console.log("siteId:", siteId);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(
    null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!isNewWorkflow);
  const [error, setError] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Templates are now centralized in lib/workflow-templates

  useEffect(() => {
    console.log("=== useEffect triggered ===");
    console.log("user:", user);
    console.log("isNewWorkflow:", isNewWorkflow);
    console.log("workflowId:", workflowId);
    
    // For new workflows, load template immediately without blocking on user
    if (isNewWorkflow) {
      console.log("New workflow, checking for template");
      
      if (templateId) {
        const tpl = getWorkflowTemplateById(templateId);
        if (tpl) {
          console.log("Loading template:", templateId);
          setWorkflowName(tpl.name);
          setNodes(tpl.nodes);
          setEdges(tpl.edges);
        } else {
          console.log("No template or invalid template, setting up empty state");
          setNodes([]);
          setEdges([]);
          setWorkflowName("New Workflow");
        }
        // Fit view to loaded template - use a ref to avoid dependency issues
        setTimeout(() => {
          try { 
            if (reactFlowWrapper.current) {
              fitView({ padding: 0.2, duration: 300 }); 
            }
          } catch (e) {
            console.log("Fit view error:", e);
          }
        }, 100);
        toast({
          title: "Template Loaded",
          description: tpl ? `"${tpl.name}" template has been loaded. Customize it to fit your needs.` : 'Customize your workflow.',
        });
      } else if (funnelContext === 'funnel' && defaultWorkflowData) {
        // Load funnel workflow from URL parameters
        try {
          const workflow = JSON.parse(decodeURIComponent(defaultWorkflowData));
          console.log("Loading funnel workflow:", workflow);
          setWorkflowName(workflow.name);
          setNodes(workflow.nodes);
          setEdges(workflow.edges);
          
          // Fit view to loaded workflow
          setTimeout(() => {
            try { 
              if (reactFlowWrapper.current) {
                fitView({ padding: 0.2, duration: 300 }); 
              }
            } catch (e) {
              console.log("Fit view error:", e);
            }
          }, 100);
          
          toast({
            title: "Funnel Workflow Created",
            description: `"${workflow.name}" has been created for your ${funnelName} funnel. Customize the settings to match your needs.`,
          });
        } catch (error) {
          console.error("Error parsing funnel workflow:", error);
          // Fallback to empty state
          setNodes([]);
          setEdges([]);
          setWorkflowName(`${funnelName || 'Funnel'} Workflow`);
        }
      } else {
        console.log("No template specified, setting up empty state");
        setNodes([]);
        setEdges([]);
        setWorkflowName("New Workflow");
      }
      
      setIsLoading(false);
      return;
    }

    // For existing workflows, require user to fetch
    if (!user) {
      console.log("No user, returning");
      return;
    }

    // Guard against undefined workflowId for existing workflows
    if (!workflowId) {
      console.log("Workflow ID is undefined, skipping fetch");
      return;
    }

    const fetchWorkflow = async () => {
      console.log("Fetching existing workflow with ID:", workflowId);
      setIsLoading(true);
      
      try {
        console.log("Current user ID:", user._id);

        const fetchedWorkflow = await getWorkflow(workflowId);
        console.log("Fetched workflow:", fetchedWorkflow);

        if (fetchedWorkflow) {
          console.log("Workflow user ID:", fetchedWorkflow.userId);
          console.log("User ID match:", fetchedWorkflow.userId === user._id);
          console.log("User ID (id):", user.id);
          console.log("User ID (_id):", user._id);
        }

        if (
          fetchedWorkflow &&
          (fetchedWorkflow.userId === user._id ||
            fetchedWorkflow.userId === user.id)
        ) {
          setWorkflowName(fetchedWorkflow.name);
          setNodes(fetchedWorkflow.nodes || []);
          setEdges(fetchedWorkflow.edges || []);
          
          // Fit view after setting nodes/edges
          setTimeout(() => {
            try { 
              if (reactFlowWrapper.current) {
                fitView({ padding: 0.2, duration: 300 }); 
              }
            } catch (e) {
              console.log("Fit view error:", e);
            }
          }, 200);
        } else {
          console.error("Permission denied or workflow not found");
          console.error("Fetched workflow:", fetchedWorkflow);
          console.error("User ID (_id):", user._id);
          console.error("User ID (id):", user.id);
          toast({
            title: "Error",
            description: "Workflow not found or permission denied.",
            variant: "destructive",
          });
          router.push(`/websites/${siteId}/workflows`);
        }
      } catch (error) {
        console.error("Error fetching workflow:", error);
        setError("Failed to fetch workflow. Please try again.");
        toast({
          title: "Error",
          description: "Failed to fetch workflow. Please try again.",
          variant: "destructive",
        });
        // Don't redirect on error, just show the error
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflow();
  }, [workflowId, user, isNewWorkflow, router, siteId, toast, templateId]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      const selectionChange = changes.find((c) => c.type === 'select');
      if (selectionChange && 'selected' in selectionChange) {
        if (selectionChange.selected) {
          const newlySelectedNode = nodes.find((n) => n.id === selectionChange.id) as Node<CustomNodeData> | undefined;
          setSelectedNode(newlySelectedNode || null);
        } else if (selectedNode?.id === selectionChange.id) {
          setSelectedNode(null);
        }
      }
    },
    [nodes, selectedNode]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback((connection: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...connection,
          animated: true,
          style: {
            strokeWidth: 3,
            stroke: "hsl(var(--primary))",
            strokeDasharray: "5,5",
          },
        },
        eds
      )
    );
  }, []);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node<CustomNodeData>) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleEdgeDoubleClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    const currentLabel = (edge as any).label || (edge.data && (edge.data as any).label) || '';
    const next = typeof window !== 'undefined' ? window.prompt('Set edge label (e.g., A, B, C or custom)', currentLabel as string) : null;
    if (next === null) return;
    const label = String(next).trim();
    setEdges((existing) => existing.map((e) => (
      e.id === edge.id
        ? { ...e, label, data: { ...(e.data || {}), label } }
        : e
    )));
  }, []);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow-node-data');
      const nodeDataString = event.dataTransfer.getData('application/reactflow-node-full-data');
      if (typeof type === 'undefined' || !type) return;
      const nodeData: CustomNodeData = JSON.parse(nodeDataString);

      // Calculate the center of the canvas in SCREEN coordinates
      const centerScreenX = reactFlowBounds.left + reactFlowBounds.width / 2;
      const centerScreenY = reactFlowBounds.top + reactFlowBounds.height / 2;

      // Convert to FLOW coordinates
      const centerFlowPos = screenToFlowPosition({ x: centerScreenX, y: centerScreenY });

      const verticalGap = 100;
      const newPosition = { ...centerFlowPos } as { x: number; y: number };

      // If there are existing nodes, place directly below the last node, centered horizontally
      if (nodes.length > 0) {
        const lastNode = nodes[nodes.length - 1];
        newPosition.y = lastNode.position.y + verticalGap;
        // keep x centered on canvas
        newPosition.x = centerFlowPos.x;
      }

      const newNode: Node = {
        id: getId(),
        type: 'custom',
        position: newPosition,
        data: { ...nodeData },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, nodes]
  );

  const handleSave = async (navigateToPreview: boolean = true) => {
    if (!user) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to save.",
        variant: "destructive",
      });
      return { success: false };
    }
    if (!workflowName) {
      toast({ title: "Workflow name required", variant: "destructive" });
      return { success: false };
    }

    const hasTrigger = nodes.some((node) => node.data.type === "Trigger");
    const hasAction = nodes.some((node) => node.data.type === "Action");

    // Preflight validation
    const issues: string[] = [];
    if (!hasTrigger) issues.push('Add at least one Trigger node.');
    if (!hasAction) issues.push('Add at least one Action node.');
    const graph = new Map<string, string[]>();
    edges.forEach(e => {
      if (!graph.has(e.source)) graph.set(e.source, []);
      graph.get(e.source)!.push(e.target);
    });
    const triggerIds = nodes.filter(n => n.data.type === 'Trigger').map(n => n.id);
    const reachable = new Set<string>();
    const dfs = (id: string) => {
      if (reachable.has(id)) return;
      reachable.add(id);
      (graph.get(id) || []).forEach(dfs);
    };
    triggerIds.forEach(dfs);
    const orphanNodes = nodes.filter(n => !reachable.has(n.id));
    if (orphanNodes.length > 0) issues.push(`${orphanNodes.length} node(s) are not reachable from any Trigger.`);
    // Basic per-node checks
    nodes.forEach(n => {
      const t = n.data.title;
      const s: any = n.data.settings || {};
      if (t === 'Element Click' && !s.selector) issues.push('Element Click: selector is required.');
      if (t === 'Insert Section' && !s.selector) issues.push('Insert Section: target selector is required.');
      if (t === 'Frequency Cap' && !(s.cooldownSeconds > 0)) issues.push('Frequency Cap: set a cooldown (seconds).');
      if (t === 'A/B Split' && !(s.variantAPercent >= 0)) issues.push('A/B Split: set Variant A percent.');
      if (t === 'Branch Split' && !(s.variantAPercent >= 0 && s.variantBPercent >= 0)) issues.push('Branch Split: set A/B (and C if used) percents.');
      if (t === 'Funnel' && !s.funnelId) issues.push('Funnel: select a funnel.');
      if (t === 'Funnel' && !s.eventType) issues.push('Funnel: select an event type.');
    });
    if (issues.length > 0) {
      toast({ title: 'Fix before saving', description: issues.join('\n'), variant: 'destructive' });
      return { success: false };
    }

    if (!hasTrigger) {
      toast({
        title: "Incomplete Workflow",
        description: "Please add at least one Trigger node.",
        variant: "destructive",
      });
      return { success: false };
    }
    if (!hasAction) {
      toast({
        title: "Incomplete Workflow",
        description: "Please add at least one Action node.",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsSaving(true);
    let success = false;
    let savedWorkflowId = isNewWorkflow ? undefined : workflowId;
    try {
      if (!isNewWorkflow) {
        await updateWorkflow(
          workflowId,
          { name: workflowName, nodes, edges },
          user._id
        );
        toast({
          title: "Workflow Updated",
          description: `"${workflowName}" has been saved.`,
        });
        success = true;
        savedWorkflowId = workflowId; // Set this for funnel trigger handling
      } else {
        console.log("Creating new workflow with siteId:", siteId);
        console.log("User ID:", user._id);
        console.log("Workflow data:", {
          name: workflowName,
          category: "Custom",
          status: "Draft",
          completionRate: "0%",
          nodes,
          edges,
          siteId: siteId,
        });

        if (!siteId) {
          toast({
            title: "Error",
            description: "A site must be selected to save a new workflow.",
            variant: "destructive",
          });
          setIsSaving(false);
          return { success: false };
        }
        const newWorkflow = await addWorkflow(
          {
            name: workflowName,
            category: "Custom",
            status: "Draft",
            completionRate: "0%",
            nodes,
            edges,
            siteId: siteId,
          },
          user._id
        );
        savedWorkflowId = newWorkflow.id;
        toast({ title: "Workflow Created", description: `Saved as a draft.` });
        await queryClient.invalidateQueries({
          queryKey: ["workflows", user._id, siteId],
        });
        success = true;
      }

      // Handle funnel triggers after workflow is saved
      if (success && savedWorkflowId) {
        await handleFunnelTriggers(savedWorkflowId);
      }

      setSaveDialogOpen(false);
      if (navigateToPreview) {
        const targetId = savedWorkflowId || workflowId;
        if (typeof window !== 'undefined' && targetId) {
          window.open(`/preview/${targetId}`,'_blank','noopener,noreferrer');
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save workflow.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
    return { success, workflowId: savedWorkflowId };
  };

  // Handle funnel triggers for the workflow
  const handleFunnelTriggers = async (workflowId: string) => {
    if (!user) {
      console.error('User not available for funnel trigger creation');
      return;
    }

    try {
      // Funnel triggers are now embedded in workflow definitions
      // No need to create separate trigger records
      console.log('Funnel triggers are now embedded in workflow definitions - no separate API calls needed');
    } catch (error) {
      console.error('Error handling funnel triggers:', error);
    }
  };

  const onSettingsChange = (nodeId: string, newSettings: any) => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, settings: newSettings } };
        }
        return node;
      })
    );
    setSelectedNode((prev) =>
      prev ? { ...prev, data: { ...prev.data, settings: newSettings } } : null
    );
  };

  const handlePreview = async () => {
    // For preview, we don't need to force a save first if the workflow already exists.
    if (!isNewWorkflow) {
      if (typeof window !== 'undefined') {
        window.open(`/preview/${workflowId}`,'_blank','noopener,noreferrer');
      }
      return;
    }

    // For new workflows, we still need to save them first, but avoid double-navigation here.
    const { success, workflowId: savedWorkflowId } = await handleSave(false);
    if (success && savedWorkflowId && typeof window !== 'undefined') {
      window.open(`/preview/${savedWorkflowId}`,'_blank','noopener,noreferrer');
    }
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    toast({
      title: "Canvas Reset",
      description: "All nodes have been cleared from the canvas.",
    });
  };

  if (isLoading || (!user && !isNewWorkflow)) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex h-screen flex-col bg-white dark:bg-slate-950">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Link href="/" className="shrink-0 rounded-md bg-primary/10 p-1.5">
            <Logo size="md" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              {isNewWorkflow ? "Create Workflow" : workflowName}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isNewWorkflow ? "Build your automation workflow" : "Edit your workflow"}
            </p>
          </div>
        </div>
        
        {/* Workflow Health Indicator */}
        <div className="flex items-center gap-4">
        
          <ThemeToggle />
          {/* Navigation & Actions Group */}
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
            Back <ArrowLeft className="h-4 w-4 mr-2" /> 
            </Button>
          </div>

        

          {/* Save Controls Group */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={isSaving} onClick={() => setSaveDialogOpen(true)}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90" disabled={isSaving} onClick={() => setSaveDialogOpen(true)}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
              Save & Preview
            </Button>
          </div>
        </div>
      </header>

        {/* Save Dialog */}
        <Dialog open={isSaveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isNewWorkflow ? "Save New Workflow" : "Save Changes"}
              </DialogTitle>
              <DialogDescription>
                Give your workflow a name to save it.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={async () => {
                  const { success } = await handleSave(false);
                  if (success) {
                    // Navigate to workflows list for this site
                    router.push(`/websites/${siteId}/workflows`);
                  }
                }}
              >
                {isSaving && <Loader2 className="mr-2 animate-spin" />}
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90"
                disabled={isSaving}
                onClick={() => handleSave(true)}
              >
                {isSaving && <Loader2 className="mr-2 animate-spin" />}
                {isSaving ? "Saving..." : "Save & Preview"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>





            {/* Error Display */}
            {error && (
              <div className="col-span-full mb-4">
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                        <span className="text-white text-xs">!</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-red-900 dark:text-red-100">Error Loading Workflow</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setError(null);
                        // Retry fetching the workflow
                        if (!isNewWorkflow && user) {
                          const fetchWorkflow = async () => {
                            setIsLoading(true);
                            try {
                              const fetchedWorkflow = await getWorkflow(workflowId);
                              if (fetchedWorkflow && (fetchedWorkflow.userId === user._id || fetchedWorkflow.userId === user.id)) {
                                setWorkflowName(fetchedWorkflow.name);
                                setNodes(fetchedWorkflow.nodes || []);
                                setEdges(fetchedWorkflow.edges || []);
                                setError(null);
                              } else {
                                setError("Workflow not found or permission denied.");
                              }
                            } catch (error) {
                              setError("Failed to fetch workflow. Please try again.");
                            } finally {
                              setIsLoading(false);
                            }
                          };
                          fetchWorkflow();
                        }
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_1fr] xl:grid-cols-[400px_1fr_360px] gap-4 relative px-4 sm:px-6 lg:px-8 py-4 pb-8 overflow-hidden">
        {/* Mobile Node Palette - Collapsible */}
        <aside className="lg:hidden">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full mb-2">
                <Palette className="h-4 w-4 mr-2" />
                Components
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mb-4">
                <NodePalette />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </aside>

        {/* Desktop Node Palette */}
        <aside className="h-full hidden lg:block min-w-[360px] xl:min-w-[400px] lg:-ml-4 xl:-ml-6 overflow-y-auto">
          <NodePalette />
        </aside>

        {/* Main Canvas */}
        <main className="min-w-0 h-full overflow-hidden" ref={reactFlowWrapper}>
          <div
            style={{ height: "100%" }}
            className="rounded-lg border bg-gradient-to-br from-background to-muted/20 shadow-lg relative"
          >
            {/* Workflow Progress Indicator */}
            {/* <div className="absolute top-4 left-4 z-10">
              <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-xs font-medium text-muted-foreground">Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {nodes.filter(n => n.data.type === 'Trigger').length} Triggers
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {nodes.filter(n => n.data.type === 'Action').length} Actions
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {edges.length} Connections
                    </Badge>
                  </div>
                </div>
                {nodes.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">Workflow Health</span>
                      <span className="text-xs font-medium">
                        {(() => {
                          const hasTrigger = nodes.some(n => n.data.type === 'Trigger');
                          const hasAction = nodes.some(n => n.data.type === 'Action');
                          const hasConnections = edges.length > 0;
                          const orphanNodes = nodes.filter(n => !edges.some(e => e.source === n.id || e.target === n.id));
                          
                          if (!hasTrigger || !hasAction) return 'Incomplete';
                          if (orphanNodes.length > 0) return 'Has Orphans';
                          if (!hasConnections) return 'No Connections';
                          return 'Good';
                        })()}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(() => {
                            const hasTrigger = nodes.some(n => n.data.type === 'Trigger');
                            const hasAction = nodes.some(n => n.data.type === 'Action');
                            const hasConnections = edges.length > 0;
                            const orphanNodes = nodes.filter(n => !edges.some(e => e.source === n.id || e.target === n.id));
                            
                            let score = 0;
                            if (hasTrigger) score += 25;
                            if (hasAction) score += 25;
                            if (hasConnections) score += 25;
                            if (orphanNodes.length === 0) score += 25;
                            return score;
                          })()}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div> */}

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onEdgeDoubleClick={handleEdgeDoubleClick}
              fitView
              className="[&_.react-flow__edge-path]:stroke-primary"
              proOptions={{ hideAttribution: true }}
            >
              <Controls className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg" />
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                className="opacity-30"
              />
              {/* <MiniMap
                className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg"
                nodeColor="hsl(var(--primary))"
                maskColor="hsl(var(--background) / 0.1)"
              /> */}
              {/* <Panel
                position="top-right"
                className="bg-background/80 backdrop-blur-sm border rounded-lg shadow-lg p-2"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="text-xs">
                    {nodes.length} nodes
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {edges.length} connections
                  </Badge>
                </div>
              </Panel> */}
            </ReactFlow>
          </div>
        </main>

        {/* Settings Panel - Always visible when node is selected */}
        <aside className="relative h-full overflow-y-auto">
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SettingsPanel
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  onSettingsChange={onSettingsChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
          {!selectedNode && (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground bg-gradient-to-br from-background to-muted/20 border rounded-xl p-6">
              <div className="space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Settings className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Node Settings</h3>
                  <p className="mt-2 text-sm">
                    Click on any node to configure its settings
                  </p>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Quick Actions
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowGuideModal(true)}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      <span className="text-xs">View Guide</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleReset}
                      className="h-auto p-3 flex flex-col items-center gap-2"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span className="text-xs">Reset Canvas</span>
                    </Button>
                  </div>
                </div>
                
                {/* Workflow Tips */}
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Pro Tips
                  </h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>• Start with a Trigger node to begin your workflow</li>
                    <li>• Use Conditions to create branching logic</li>
                    <li>• Every workflow needs at least one Action</li>
                    <li>• Connect nodes by dragging from output to input</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
      
      {/* Workflow Guide Modal */}
      <WorkflowGuideModal 
        isOpen={showGuideModal} 
        onClose={() => setShowGuideModal(false)} 
      />
    </div>
  );
}

export default function EditBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilder />
    </ReactFlowProvider>
  );
}
