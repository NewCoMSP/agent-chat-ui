"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Simple breadcrumb logic based on path
    const pathParts = pathname.split("/").filter(Boolean);
    const view = pathParts[1] || "overview";

    const viewLabels: Record<string, string> = {
        map: "World Map",
        artifacts: "Project Artifacts",
        backlog: "Smart Backlog",
        discovery: "Product Discovery",
        settings: "Settings",
        overview: "Workbench"
    };

    return (
        <nav className="flex items-center text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
                <Home className="h-4 w-4" />
            </Link>
            <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/40" />
            <Link href="/workbench/map" className="hover:text-foreground transition-colors">
                Workbench
            </Link>
            {view !== "overview" && (
                <>
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/40" />
                    <span className="text-foreground font-semibold">
                        {viewLabels[view] || view.charAt(0).toUpperCase() + view.slice(1)}
                    </span>
                </>
            )}
        </nav>
    );
}
