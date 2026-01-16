"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ClientBranding, getBranding } from "@/lib/branding";

interface BrandingContextType {
    branding: ClientBranding;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({
    children,
    client = process.env.NEXT_PUBLIC_CLIENT_NAME || "daikin", // Force daikin as default for demo
}: {
    children: React.ReactNode;
    client?: string;
}) {
    const [branding, setBranding] = useState<ClientBranding>(getBranding(client));

    useEffect(() => {
        // Apply branding styles to CSS variables
        const root = document.documentElement;
        root.style.setProperty("--primary", branding.colors.primary);
        root.style.setProperty("--radius", branding.style.border_radius);
        root.style.setProperty("--radius-button", branding.style.button_radius);

        // We can add more mappings here as needed
        // For OKLCH colors, we might need a converter if the theme expects OKLCH
        // But since we are overriding with hex, standard CSS variables should support it
        // if the tailwind config is set up correctly.
    }, [branding]);

    return (
        <BrandingContext.Provider value={{ branding }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    const context = useContext(BrandingContext);
    if (context === undefined) {
        throw new Error("useBranding must be used within a BrandingProvider");
    }
    return context;
}
