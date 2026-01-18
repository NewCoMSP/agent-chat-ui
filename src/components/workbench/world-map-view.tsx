"use client";

import React from "react";
import { Search, Filter, Layers, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorldMapView() {
    return (
        <div className="h-full w-full flex flex-col bg-[#050505]">
            {/* Toolbar */}
            <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-white/5 rounded-md p-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-3 bg-white/10 text-white">Full Map</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-3 text-muted-foreground">Focus</Button>
                    </div>
                    <div className="h-4 w-px bg-white/10 ml-2" />
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-white">
                        <Layers className="h-3.5 w-3.5" />
                        <span className="text-xs">Layers</span>
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            placeholder="Search nodes..."
                            className="bg-white/5 border border-white/10 rounded-md py-1 pl-8 pr-3 text-xs focus:outline-none focus:border-primary/50 transition-all w-48"
                        />
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-20">
                {/* Decorative background grid */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

                {/* Empty State / Initial View */}
                <div className="relative z-10 text-center max-w-md animate-in fade-in zoom-in duration-700">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                        <Layers className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">Project World Map</h2>
                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                        The Knowledge Graph visualizes the interconnected methodology, artifacts, and সোহম of your project.
                        Engage with the agent to populate your map!
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="bg-white/5 border-white/10 text-xs py-5 h-auto flex flex-col gap-2 hover:bg-white/10">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Load Recent
                        </Button>
                        <Button variant="outline" className="bg-white/5 border-white/10 text-xs py-5 h-auto flex flex-col gap-2 hover:bg-white/10">
                            <Filter className="h-4 w-4 text-blue-500" />
                            Filter Paths
                        </Button>
                    </div>
                </div>

                {/* Aesthetic Glows */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            </div>
        </div>
    );
}
