"use client";

import React from "react";
import { viewRegistry } from "@/lib/view-registry";
import { HeroDemoScene, type HeroDemoSceneGraphData } from "@/components/demo/HeroDemoScene";

/** Register map content views (graph, artifacts, simulate). Called once when workbench loads. */
function registerMapViews() {
    viewRegistry.register("map", {
        label: "Map",
        render: (props) => props.graphContent ?? null,
    });

    viewRegistry.register("artifacts", {
        label: "Artifacts",
        render: (props) => props.artifactsContent ?? null,
    });

    viewRegistry.register("simulate", {
        label: "Simulate",
        render: (props) => (
            <div className="h-full w-full flex flex-col overflow-hidden">
                <HeroDemoScene
                    initialGraph={(props.initialGraphForSimulate ?? undefined) as HeroDemoSceneGraphData | undefined}
                    phaseId={props.scope?.phaseId ?? undefined}
                    projectId={props.scope?.projectId ?? undefined}
                    orgId={props.scope?.orgId ?? undefined}
                    threadId={props.scope?.threadId ?? undefined}
                />
            </div>
        ),
    });
}

registerMapViews();
