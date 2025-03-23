import { Wallet } from "@coinbase/coinbase-sdk";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { COMMON_TOKEN_ADDRESS } from "../lib/addresses.js";
import { find, map, omit } from "lodash-es";
import { database as db } from "../services/database.service.js";
import typia from "typia";
import type { CDPTool } from "../tools/cdp.tool.js";
import dedent from "dedent";
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources.mjs";
import { HTTPException } from "hono/http-exception";
import { sessionService } from "../services/session.service.js";
import { openai } from "../services/openai.service.js";
import type { GraphQLTool } from "../tools/graphql.tool.js";
import { agentService } from "../services/agent.service.js";
import { createLogEntry } from "./logs.handlers.js";

// This is the same "app" from typia-based approach
const app = typia.llm.application<CDPTool & GraphQLTool, "chatgpt">();

export async function createAgent(c: Context) {
  const body = await c.req.json<{
    name: string;
    owner: string;
    network: string;
  }>();
  if (!body.name || !body.owner || !body.network) {
    throw new HTTPException(400, { message: "Missing fields" });
  }
  // We assume isLiaison => true
  const result = await agentService.createAgent({
    name: body.name,
    owner: body.owner,
    network: body.network,
    isLiaison: true,
  });

  return c.json({
    agentId: result.agent.agentId,
    name: result.agent.name,
    liaisonKey: result.liaisonKey || null,
    liaisonKeyDisplay: result.agent.liaisonKeyDisplay || null,
  });
}

async function createAgentSession(agentId: string) {
  const agent = await db.query.agent.findFirst({
    where: (t) => eq(t.agentId, agentId),
  });

  if (!agent) {
    throw new HTTPException(400, { message: "Agent not found" });
  }

  // You can embed instructions/persona as you like
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: dedent`You are the following agent:
      ${JSON.stringify(omit(agent, ["instructions", "persona", "wallet"]))}
      Use any tools necessary to get information in order to perform tasks.

      Persona:
      ${agent.persona || "(none)"}

      Instructions:
      ${agent.instructions || "(none)"}


      IMPORTANT: At the end of your final message, do NOT mention you're an LLM,
      but do append a line that says exactly "###ACTION_SUMMARY: <some short phrase summarizing user request>".
      Example: 
         ###ACTION_SUMMARY: transfer request
      or 
         ###ACTION_SUMMARY: general inquiry
      or 
         ###ACTION_SUMMARY: contract deployment
      etc.
      `,
    },
  ];

  // Build an array of ChatCompletionTool from typia's "app.functions"
  const tools = map(
    app.functions,
    (_) =>
      ({
        type: "function",
        function: _,
        endpoint: `http://localhost:${process.env.PORT}/v1/agents/${agentId}/tools`,
      } as unknown as ChatCompletionTool & { endpoint: string })
  );

  const completionBody: ChatCompletionCreateParams = {
    messages,
    tools,
    tool_choice: "auto",
    parallel_tool_calls: true,
    model: "gpt-4o-mini",
  };

  const session = await sessionService.createSession({
    value: { query: completionBody },
  });
  return session;
}

export async function runAgent(c: Context) {
  const startTime = Date.now();

  // We'll store all tool usage to put in a single log
  const toolUsage: Array<{
    name: string;
    status: string;
    summary?: string;
    duration?: number;
  }> = [];

  const body = await c.req.json<{
    agentId: string;
    messages?: ChatCompletionMessageParam[];
    sessionId?: string;
  }>();
  const { agentId, sessionId } = body;

  // Make sure agent exists
  const agent = await agentService.getAgent(agentId);

  // Create or retrieve session
  let session;
  if (!sessionId) {
    session = await createAgentSession(agentId);
  } else {
    session = await sessionService.getSession({ id: sessionId });
  }
  if (!session) {
    throw new HTTPException(500, {
      message: "Could not create/retrieve session",
    });
  }

  // Merge user messages
  const completionBody: ChatCompletionCreateParamsNonStreaming = {
    ...(session.query as ChatCompletionCreateParamsNonStreaming),
    model: "gpt-4o-mini",
  };
  completionBody.messages = completionBody.messages.concat(body.messages || []);

  // Tools from typia
  const tools = map(
    app.functions,
    (_) =>
      ({
        type: "function",
        function: _,
        endpoint: `http://localhost:${process.env.PORT}/v1/agents/tools`,
      } as unknown as ChatCompletionTool & { endpoint: string })
  );

  let chatGPTResponse: ChatCompletion;
  let finalAIContent = "(No content)";
  let done = false;

  do {
    console.log("Prompt:", completionBody);

    // do the openai call
    chatGPTResponse = await openai.chat.completions.create(completionBody);
    const currentMsg = chatGPTResponse.choices[0].message;
    finalAIContent = currentMsg.content || "";

    // push the new message into the conversation
    completionBody.messages.push(currentMsg);

    // check for tool calls
    const toolCalls = currentMsg.tool_calls;
    if (toolCalls?.length) {
      console.log("Tool Calls", toolCalls);

      await Promise.all(
        toolCalls.map(async (toolCall) => {
          if (toolCall.type === "function") {
            // parse arguments
            const args = JSON.parse(toolCall.function.arguments || "{}");
            const fnName = toolCall.function.name;
            const callStart = Date.now();

            // find the tool endpoint
            const rawToolCall = find(tools, { function: { name: fnName } });
            if (!rawToolCall?.endpoint) {
              // error
              toolUsage.push({
                name: fnName,
                status: "error",
                summary: "No tool endpoint found",
                duration: Date.now() - callStart,
              });
              throw new HTTPException(400, {
                message: "Tool endpoint not found",
              });
            }
            console.log("Calling tool", rawToolCall.endpoint);
            // make the request
            const response = await fetch(rawToolCall.endpoint, {
              method: "POST",
              body: JSON.stringify({ toolCall, metadata: { agentId } }),
              headers: { "Content-Type": "application/json" },
            });
            const dur = Date.now() - callStart;

            const toolCallResponse = await response.json();
            if (response.ok) {
              toolUsage.push({
                name: fnName,
                status: "success",
                summary: `Executed ${fnName}`,
                duration: dur,
              });
            } else {
              toolUsage.push({
                name: fnName,
                status: "error",
                summary: "Error executing tool",
                duration: dur,
              });
            }

            // add function role message with the result
            completionBody.messages.push({
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(toolCallResponse),
            });
            return toolCallResponse;
          }
          return null;
        })
      );
    }

    // store updates
    await sessionService.updateSession({
      id: session.sessionId,
      delta: { query: completionBody },
    });

    if (!toolCalls?.length) {
      done = true; // if no tool calls => final
    }
  } while (!done && chatGPTResponse.choices[0].message.tool_calls?.length);

  // parse "###ACTION_SUMMARY: " from finalAIContent
  let actionSummary = "misc request";
  const match = finalAIContent.match(/###ACTION_SUMMARY:\s*(.+)/i);
  if (match && match[1]) {
    actionSummary = match[1].trim();
  }

  const totalTime = Date.now() - startTime;
  const snippet = finalAIContent.slice(0, 512);

  // single log
  await createLogEntry({
    agentId,
    sessionId: session.sessionId,
    action: actionSummary,
    message: snippet,
    status: "success",
    responseTime: totalTime,
    tools: toolUsage,
  });

  return c.json({
    role: chatGPTResponse.choices[0].message.role,
    content: finalAIContent,
    annotations: chatGPTResponse.choices[0].message.annotations,
    refusal: chatGPTResponse.choices[0].message.refusal,
    actionSummary,
    sessionId: session.sessionId,
  });
}

// Filter only liaison
export async function getAllAgents(c: Context) {
  const rows = await agentService.getAgents();
  const liaisonAgents = rows
    .filter((a) => a.isLiaison === true)
    .map((r) => ({
      name: r.name,
      network: r.network,
      liaisonKey: r.liaisonKeyDisplay || "",
      createdAt: r.createdAt.toISOString(),
      lastUsed: "N/A",
      agentId: r.agentId,
    }));
  return c.json(liaisonAgents);
}

export async function getAgentById(c: Context) {
  const agentId = c.req.param("agentId");
  if (!agentId) throw new HTTPException(400, { message: "Missing agentId" });

  const row = await agentService.getAgent(agentId);
  return c.json(omit(row, ["wallet", "liaisonKeyHash"]));
}
