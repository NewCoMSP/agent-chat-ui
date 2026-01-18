"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileText,
    Settings,
    CheckSquare,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROJECT_LINKS = [
    { name: "World Map", href: "/workbench/map", icon: LayoutDashboard },
    { name: "Artifacts", href: "/workbench/artifacts", icon: FileText },
];

const PRODUCT_LINKS = [
    { name: "Smart Backlog", href: "/workbench/backlog", icon: CheckSquare },
    { name: "Discovery", href: "/workbench/discovery", icon: Search },
];

export function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const userRole = session?.user?.role;

    // Check if user is Reflexion Admin (keys are reflexion_admin or admin)
    const isAdmin = userRole === "reflexion_admin" || userRole === "admin";

    return (
        <aside className="w-64 border-r bg-muted/20 flex flex-col h-full overflow-y-auto transition-all duration-300">
            <div className="p-6">
                <Link href="/" className="inline-block transition-transform hover:scale-105">
                    <h2 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-sm">R</span>
                        Reflexion
                    </h2>
                </Link>
            </div>

            <nav className="flex-1 space-y-6 px-4 py-2">
                {/* Project Section */}
                <div className="space-y-3">
                    <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        Project Workspace
                    </h3>
                    <div className="space-y-1">
                        {PROJECT_LINKS.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all",
                                        isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("mr-3 h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Product Section - Admin Only */}
                {isAdmin && (
                    <div className="space-y-3 pt-2">
                        <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            Reflexion Product
                        </h3>
                        <div className="space-y-1">
                            {PRODUCT_LINKS.map((link) => {
                                const Icon = link.icon;
                                const isActive = pathname === link.href;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={cn(
                                            "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all",
                                            isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                        )}
                                    >
                                        <Icon className={cn("mr-3 h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground")} />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {/* Bottom Footer Section */}
            <div className="p-4 mt-auto border-t bg-muted/10">
                <Link
                    href="/workbench/settings"
                    className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent/50 hover:text-foreground text-muted-foreground",
                        pathname === "/workbench/settings" ? "bg-primary/10 text-primary shadow-sm" : ""
                    )}
                >
                    <Settings className="mr-3 h-4 w-4 transition-transform group-hover:rotate-45" />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
