'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Save, Play, Loader2 } from 'lucide-react';

interface WorkflowHeaderProps {
  websiteId: string;
  workflowName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onTest: () => void;
  isSaving: boolean;
  isTesting: boolean;
}

export function WorkflowHeader({
  websiteId,
  workflowName,
  onNameChange,
  onSave,
  onTest,
  isSaving,
  isTesting
}: WorkflowHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button and breadcrumb */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/websites/${websiteId}/workflows`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Workflows
              </Link>
            </Button>
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/websites/${websiteId}`}>Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/websites/${websiteId}/workflows`}>Workflows</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbPage>Edit Workflow</BreadcrumbPage>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Center - Workflow name input */}
          <div className="flex-1 max-w-md mx-8">
            <Input
              value={workflowName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter workflow name..."
              className="text-center font-medium"
            />
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTest}
              disabled={isSaving || isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Test
                </>
              )}
            </Button>
            
            <Button
              onClick={onSave}
              disabled={isSaving}
              size="sm"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Workflow
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
