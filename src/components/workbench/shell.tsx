"use client";

import { Suspense, useState } from "react";
import { Sidebar } from "./sidebar";
import { UserMenu } from "@/components/thread/user-menu";
import { Breadcrumbs } from "./breadcrumbs";
import { OrgSwitcher } from "./org-switcher";
import { useStreamContext } from "@/providers/Stream";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Thread } from "@/components/thread";
import { MessageSquare, Map as MapIcon, Workflow, Activity, ChevronRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useQueryState } from "nuqs";
import { ProjectSwitcher } from "./project-switcher";
import { cn } from "@/lib/utils";

export function WorkbenchShell({ children }: { children: React.ReactNode }) {
    const stream = useStreamContext();
    const activeAgent = (stream as any)?.values?.active_agent || "supervisor";
    const [viewMode, setViewMode] = useQueryState("view", { defaultValue: "map" });
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {/* Top Header */}
                <header className="h-14 border-b flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-20">
                    <div className="flex items-center gap-6">
                        <Suspense fallback={<div className="h-4 w-24 bg-muted animate-pulse rounded" />}>
                            <Breadcrumbs />
                        </Suspense>

                        <div className="h-6 w-[1px] bg-zinc-800" />

                        {/* Workflow Status */}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 shadow-sm">
                            <Activity className={cn(
                                "w-3.5 h-3.5",
                                stream.isLoading ? "text-amber-500 animate-pulse" : "text-emerald-500"
                            )} />
                            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                                Mode:
                            </span>
                            <span className="text-xs font-semibold text-zinc-200 capitalize">
                                {activeAgent}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-7 px-2.5 gap-1.5 transition-all text-xs",
                                            viewMode === "map" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                        onClick={() => setViewMode("map")}
                                    >
                                        <MapIcon className="w-3.5 h-3.5" />
                                        Map
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Knowledge Graph View</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-7 px-2.5 gap-1.5 transition-all text-xs",
                                            viewMode === "workflow" ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                                        )}
                                        onClick={() => setViewMode("workflow")}
                                    >
                                        <Workflow className="w-3.5 h-3.5" />
                                        Workflow
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Process Orientation View</TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="h-6 w-[1px] bg-zinc-800 mx-1" />

                        <ProjectSwitcher />

                        <div className="h-6 w-[1px] bg-zinc-800 mx-1" />

                        <OrgSwitcher />

                        <div className="h-6 w-[1px] bg-zinc-800 mx-1" />

                        {/* Chat Sidebar Trigger */}
                        <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SheetTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={cn(
                                                "h-9 w-9 border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 relative transition-all",
                                                isChatOpen && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            )}
                                        >
                                            <MessageSquare className="w-4 h-4 text-zinc-400" />
                                            {stream.isLoading && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                                </span>
                                            )}
                                        </Button>
                                    </SheetTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Contextual Agent Chat</TooltipContent>
                            </Tooltip>
                            <SheetContent side="right" className="w-[450px] sm:w-[540px] p-0 border-l-zinc-800 bg-zinc-950">
                                <Thread embedded hideArtifacts />
                            </SheetContent>
                        </Sheet>

                        <div className="h-6 w-[1px] bg-zinc-800 mx-1" />

                        <UserMenu />
                    </div>
                </header>

                {/* Content Stage */}
                <main className="flex-1 overflow-auto relative bg-[#0a0a0a]">
                    <div className="h-full w-full custom-scrollbar">
                        {children}
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
