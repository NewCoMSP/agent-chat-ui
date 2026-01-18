"use client";

import { Sidebar } from "./sidebar";
import { UserMenu } from "@/components/thread/user-menu";
import { Breadcrumbs } from "./breadcrumbs";

export function WorkbenchShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
                {/* Top Header */}
                <header className="h-14 border-b flex items-center justify-between px-6 bg-background/50 backdrop-blur-md z-20">
                    <div className="flex items-center gap-4">
                        <Breadcrumbs />
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Placeholder for project context context selector later */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-xs font-semibold text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Active Project: Daikin Phase 1
                        </div>
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
