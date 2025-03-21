import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createAgent } from "#/handlers/agents.handlers.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/agents", createAgent);

serve(
  {
    fetch: app.fetch,
    port: parseInt(process.env.PORT!) || 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
