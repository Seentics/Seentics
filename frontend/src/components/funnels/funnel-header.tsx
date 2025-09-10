'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react';

interface FunnelHeaderProps {
  websiteId: string;
  funnelName: string;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onPreview: () => void;
  isSaving: boolean;
  isPreviewMode: boolean;
}

export function FunnelHeader({
  websiteId,
  funnelName,
  onNameChange,
  onSave,
  onPreview,
  isSaving,
  isPreviewMode
}: FunnelHeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button and breadcrumb */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/websites/${websiteId}/funnels`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Funnels
              </Link>
            </Button>
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/websites/${websiteId}`}>Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/websites/${websiteId}/funnels`}>Funnels</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbPage>Edit Funnel</BreadcrumbPage>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Center - Funnel name input */}
          <div className="flex-1 max-w-md mx-8">
            <Input
              value={funnelName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter funnel name..."
              className="text-center font-medium"
            />
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreview}
              disabled={isSaving}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
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
                  Save Funnel
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
