import React from 'react';
import { Node, Edge } from 'reactflow';
import { CustomNodeData } from './flow/custom-node';

interface WorkflowDiagramProps {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
  className?: string;
}

export function WorkflowDiagram({ nodes, edges, className = '' }: WorkflowDiagramProps) {
  // Sort nodes by their position to maintain workflow order
  const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
  
  if (sortedNodes.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 text-muted-foreground ${className}`}>
        <div className="text-center">
          <div className="text-lg font-medium">No workflow steps defined</div>
          <div className="text-sm">Add nodes to your workflow to see the preview</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Workflow Flow */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {sortedNodes.map((node, index) => {
          // Determine node color and icon based on type
          let nodeColor = 'bg-slate-100 text-slate-700 border-slate-300';
          let icon = '⚪';
          
          if (node.data.type === 'Trigger') {
            nodeColor = 'bg-emerald-100 text-emerald-700 border-emerald-300';
            icon = '🚀';
          } else if (node.data.type === 'Condition') {
            nodeColor = 'bg-amber-100 text-amber-700 border-amber-300';
            icon = '❓';
          } else if (node.data.type === 'Action') {
            nodeColor = 'bg-violet-100 text-violet-700 border-violet-300';
            icon = '⚡';
          }
          
          return (
            <React.Fragment key={node.id}>
              {/* Node */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium max-w-32 ${nodeColor} shadow-sm hover:shadow-md transition-shadow`}>
                <span className="text-base">{icon}</span>
                <span className="truncate">{node.data.title}</span>
              </div>
              
              {/* Arrow connector (except for last node) */}
              {index < sortedNodes.length - 1 && (
                <div className="flex items-center">
                  <div className="w-4 h-0.5 bg-slate-300"></div>
                  <div className="w-0 h-0 border-l-2 border-l-slate-300 border-t-1 border-t-transparent border-b-1 border-b-transparent ml-0.5"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Node Type Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>🚀</span>
          <span>Trigger</span>
        </div>
        <div className="flex items-center gap-1">
          <span>⚡</span>
          <span>Action</span>
        </div>
        <div className="flex items-center gap-1">
          <span>❓</span>
          <span>Condition</span>
        </div>
      </div>
    </div>
  );
}
