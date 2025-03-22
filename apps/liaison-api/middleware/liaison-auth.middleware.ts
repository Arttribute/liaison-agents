import { type MiddlewareHandler } from "hono";
import { eq } from "drizzle-orm";
import { database } from "../services/database.service.js";
import { agent } from "../models/schema.js";
import { HTTPException } from "hono/http-exception";
import crypto from "crypto";

function hashKey(key: string) {
  return crypto.createHash("sha256").update(key).digest("hex");
}

export const verifyLiaisonKey: MiddlewareHandler = async (c, next) => {
  const { agentId } = await c.req.json();
  if (!agentId) {
    throw new HTTPException(400, { message: "Missing agentId" });
  }
  console.log("Agent ID", agentId);
  const key = c.req.header("x-api-key");
  if (!key) {
    throw new HTTPException(401, { message: "Missing X-API-KEY" });
  }
  console.log("Key", key);

  const row = await database.query.agent.findFirst({
    where: (t) => eq(t.agentId, agentId),
  });
  if (!row) {
    throw new HTTPException(404, { message: "Agent not found" });
  }

  if (!row.isLiaison) {
    throw new HTTPException(403, {
      message: "Not a liaison agent",
    });
  }
  if (!row.liaisonKeyHash) {
    throw new HTTPException(403, {
      message: "No liaison key set for agent",
    });
  }

  const hashed = hashKey(key);
  if (hashed !== row.liaisonKeyHash) {
    throw new HTTPException(401, { message: "Invalid liaison key" });
  }

  await next();
};
