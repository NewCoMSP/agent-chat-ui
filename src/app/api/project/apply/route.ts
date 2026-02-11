import { NextResponse } from "next/server";
import { getSessionSafe } from "@/auth";
import { getBackendBaseUrl } from "@/lib/backend-proxy";

/**
 * Epic #84: Apply propose_project or project_from_upload.
 * Proxies POST to backend /project/apply with session auth.
 * Body: { proposal_type, decision_id, payload }.
 * Returns: { success, active_agent, kg_version_sha, ... }.
 */
export async function POST(req: Request) {
  try {
    const session = await getSessionSafe();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: {
      proposal_type: string;
      decision_id: string;
      payload: Record<string, unknown>;
    };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.decision_id) {
      return NextResponse.json({ error: "decision_id is required" }, { status: 400 });
    }
    if (!body.proposal_type) {
      return NextResponse.json({ error: "proposal_type is required" }, { status: 400 });
    }
    if (!body.payload || typeof body.payload !== "object") {
      return NextResponse.json({ error: "payload is required" }, { status: 400 });
    }

    const baseUrl = getBackendBaseUrl();
    const targetUrl = `${baseUrl}/project/apply`;

    const orgContext = req.headers.get("X-Organization-Context");

    const headers: Record<string, string> = {
      Authorization: `Bearer ${session.user.idToken}`,
      "Content-Type": "application/json",
    };

    if (orgContext) {
      headers["X-Organization-Context"] = orgContext;
    }

    const resp = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        proposal_type: body.proposal_type,
        decision_id: body.decision_id,
        payload: body.payload,
      }),
    });

    const text = await resp.text();
    if (!resp.ok) {
      try {
        const err = JSON.parse(text);
        return NextResponse.json(err, { status: resp.status });
      } catch {
        return NextResponse.json({ error: text || "Backend error" }, { status: resp.status });
      }
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid backend response" }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("[PROXY] Project apply failed:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
