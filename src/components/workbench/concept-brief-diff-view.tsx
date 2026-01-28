"use client";

import { useState } from "react";
import { ConceptBriefDiffView as ConceptBriefDiffViewType } from "@/lib/diff-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConceptBriefDiffViewProps {
  diffData?: ConceptBriefDiffViewType;
  onApprove?: (selectedOptionIndex: number) => void;
  onReject?: () => void;
  isLoading?: boolean;
}

export function ConceptBriefDiffView({
  diffData,
  onApprove,
  onReject,
  isLoading = false,
}: ConceptBriefDiffViewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!diffData) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Concept Brief Data Available</h3>
          <p className="text-sm text-muted-foreground">
            Waiting for concept brief proposal data. This view will display when the concept agent
            generates options and awaits your approval.
          </p>
        </div>
      </div>
    );
  }

  const { options, recommended_index, metadata } = diffData;
  const effectiveSelected = selectedIndex ?? recommended_index;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{metadata.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{metadata.description}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {metadata.num_options} option{metadata.num_options !== 1 ? "s" : ""} · recommended option {recommended_index + 1}
          </div>
        </div>
      </div>

      {/* Option cards */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {options.map((opt, i) => {
          const isRecommended = i === recommended_index;
          const isSelected = i === effectiveSelected;
          return (
            <Card
              key={i}
              className={cn(
                "cursor-pointer transition-colors",
                isSelected && "ring-2 ring-primary",
                !isSelected && "hover:bg-muted/50"
              )}
              onClick={() => setSelectedIndex(i)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    Option {i + 1}
                    {isRecommended && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200">
                        <Star className="h-3 w-3" />
                        Recommended
                      </span>
                    )}
                  </CardTitle>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      (opt.compliance_score ?? 0) >= 0.8
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                        : (opt.compliance_score ?? 0) >= 0.5
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                    )}
                  >
                    {(opt.compliance_score ?? 0) * 100}% compliance
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm whitespace-pre-wrap font-normal">
                  {opt.summary}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      {(onApprove || onReject) && (
        <div className="border-t p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {selectedIndex !== null
              ? `Option ${selectedIndex + 1} selected`
              : `Using recommended option ${recommended_index + 1}`}
          </p>
          <div className="flex items-center gap-2">
            {onReject && (
              <Button variant="outline" onClick={onReject} disabled={isLoading}>
                Reject
              </Button>
            )}
            {onApprove && (
              <Button
                onClick={() => onApprove(effectiveSelected)}
                disabled={isLoading}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve option {effectiveSelected + 1}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
