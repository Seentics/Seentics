'use client';

import React, { useCallback } from 'react';
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
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  nodeTypes?: any;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  nodeTypes
}: WorkflowCanvasProps) {
  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50 dark:bg-gray-900"
      >
        <Controls className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
        <MiniMap 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          className="opacity-30"
        />
        <Panel position="top-center">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag nodes from the sidebar to build your workflow
            </p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
