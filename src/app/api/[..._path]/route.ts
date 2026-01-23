import { initApiPassthrough } from "langgraph-nextjs-api-passthrough";

// This file acts as a proxy for requests to your LangGraph server.
// Read the [Going to Production](https://github.com/langchain-ai/agent-chat-ui?tab=readme-ov-file#going-to-production) section for more information.

// CRITICAL: Do NOT set apiKey here - let it come from the client's request headers
// The LangGraph SDK sends the apiKey as X-Api-Key header, which the passthrough should forward
// If we set apiKey here, it will override the client's JWT token
export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, runtime } =
  initApiPassthrough({
    // Use LANGGRAPH_API_URL if set, otherwise fallback to staging backend URL
    apiUrl: process.env.LANGGRAPH_API_URL ?? "https://reflexion-staging.up.railway.app",
    // DO NOT set apiKey - the client's X-Api-Key or Authorization header should be forwarded
    // The passthrough package should forward all headers from the incoming request
    runtime: "edge", // default
  });
