import { type Context } from "hono";
import { eq, desc } from "drizzle-orm";
import { database as db } from "../services/database.service.js";
import * as schema from "../models/schema.js";
import { HTTPException } from "hono/http-exception";

export async function createLogEntry(props: {
  agentId: string;
  sessionId?: string;
  action: string; // short label
  message: string; // longer text
  status: string; // success/error/warning/pending
  responseTime?: number;
  tools?: Array<{
    name: string;
    status: string;
    summary?: string;
    duration?: number;
  }>;
}) {
  await db.insert(schema.agentLog).values({
    agentId: props.agentId,
    sessionId: props.sessionId,
    action: props.action,
    message: props.message,
    status: props.status,
    responseTime: props.responseTime || 0,
    tools: props.tools || [],
  });
}

export async function getAllAgentLogs(c: Context) {
  const agentId = c.req.param("agentId");
  if (!agentId) {
    throw new HTTPException(400, { message: "Missing agentId" });
  }
  const logs = await db.query.agentLog.findMany({
    where: (t) => eq(t.agentId, agentId),
    orderBy: (t) => [desc(t.createdAt)],
    limit: 200,
  });
  const out = logs.map((l) => ({
    id: l.logId,
    action: l.action || "",
    status: l.status || "info",
    message: l.message || "",
    timestamp: l.createdAt.toISOString(),
    responseTime: l.responseTime || 0,
    agent: agentId,
    sessionId: l.sessionId || "",
    tools: l.tools || [],
  }));
  return c.json(out);
}
