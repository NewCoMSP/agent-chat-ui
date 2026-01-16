"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import releaseNotes from "@/data/release-notes.json";

interface ReleaseNote {
    id: string;
    version: string;
    date: string;
    title: string;
    description: string;
    features: {
        name: string;
        description: string;
        recording_path?: string;
    }[];
}

export function ReleaseNotesTab() {
    const releases = releaseNotes as ReleaseNote[];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">What's New in Reflexion</h2>
                <p className="text-muted-foreground">
                    Stay up to date with the latest features and improvements
                </p>
            </div>

            <div className="space-y-8">
                {releases.map((release) => (
                    <div key={release.id} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{release.title}</h3>
                            <Badge variant="secondary">v{release.version}</Badge>
                            <span className="text-sm text-muted-foreground">{release.date}</span>
                        </div>

                        <p className="text-muted-foreground">{release.description}</p>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-sm">New Features</h4>
                            {release.features.map((feature, idx) => (
                                <div key={idx} className="border-l-2 border-primary pl-4 py-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">
                                            {feature.name}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {feature.description}
                                    </p>
                                    {feature.recording_path && (
                                        <p className="text-xs text-muted-foreground italic mt-1">
                                            Interactive demo available (rrweb playback coming soon)
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
