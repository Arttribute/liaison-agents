import "dotenv/config";
import { createAgent, runAgent } from "../handlers/agents.handlers.js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { showRoutes } from "hono/dev";
import { makeAgentToolCall } from "../handlers/agent-tools.handlers.js";
import { verifyLiaisonKey } from "../middleware/liaison-auth.middleware.js";

const v1 = new Hono().basePath("/v1");

v1.post("/agents", createAgent);

// Liaison key required
v1.post("/agents/run", runAgent);
v1.post("/agents/tools", verifyLiaisonKey, makeAgentToolCall);
const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});
app.route("/", v1);

serve(
  {
    fetch: app.fetch,
    port: parseInt(process.env.PORT!) || 3000,
  },
  (info) => {
    showRoutes(app, { colorize: true, verbose: true });
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
