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
  // Assume we want a liaison agent
  // or you can do: let isLiaison = !!body.isLiaison
  const result = await agentService.createAgent({
    name: body.name,
    owner: body.owner,
    network: body.network,
    isLiaison: true,
  });

  // Return once
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

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: dedent`You are the following agent:
      ${JSON.stringify(omit(agent, ["instructions", "persona", "wallet"]))}
      Use any tools nessecary to get information in order to perform the task.

      The following is the persona you are meant to adopt:
      ${agent.persona}

      The following are the instructions you are meant to follow:
      ${agent.instructions}`,
    },
    // ...(props.messages || []),
  ];

  const tools = map(
    app.functions,
    (_) =>
      ({
        type: "function",
        function: _,
        endpoint: `http://localhost:${process.env.PORT}/v1/agents/tools`, // should be a self endpoint
      } as unknown as ChatCompletionTool & { endpoint: string })
  );

  const completionBody: ChatCompletionCreateParams = {
    messages,
    // ...body,
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
  console.log("Running agent");
  const body = await c.req.json<{
    agentId: string;
    messages?: ChatCompletionMessageParam[];
    sessionId?: string;
  }>();
  const props = body;
  const { agentId, sessionId } = props;
  console.log("Sent data:", props);

  const agent = await db.query.agent.findFirst({
    where: (t) => eq(t.agentId, agentId),
  });

  if (!agent) {
    throw new HTTPException(400, { message: "Agent not found" });
  }

  // Check if the agent has tokens

  const wallet = await Wallet.import(agent.wallet).catch((e) => {
    console.log(e);
    throw e;
  });

  //const commonsBalance = await wallet.getBalance(COMMON_TOKEN_ADDRESS);

  //if (commonsBalance.lte(0)) {
  //  throw new HTTPException(400, { message: "Agent has no tokens" });
  //}

  //console.log(commonsBalance);

  let session;
  if (!sessionId) {
    session = await createAgentSession(agentId);
  } else {
    session = await sessionService.getSession({ id: sessionId });
  }

  const completionBody: ChatCompletionCreateParamsNonStreaming = {
    ...(session?.query as ChatCompletionCreateParamsNonStreaming),
    model: "gpt-4o-mini",
  };

  completionBody.messages = completionBody.messages.concat(
    props.messages || []
  );

  console.log(app.functions[0]);

  const tools = map(
    app.functions,
    (_) =>
      ({
        type: "function",
        function: _,
        endpoint: `http://localhost:${process.env.PORT}/v1/agents/tools`, // should be a self endpoint
      } as unknown as ChatCompletionTool & { endpoint: string })
  );

  let chatGPTResponse: ChatCompletion;
  // let sessionId: string | undefined = body.sessionId;

  do {
    // Execute the tools
    console.log("Prompt", completionBody);
    chatGPTResponse = await openai.chat.completions.create(completionBody);

    const toolCalls = chatGPTResponse.choices[0].message.tool_calls;

    completionBody.messages.push(chatGPTResponse.choices[0].message);

    if (toolCalls?.length) {
      console.log("Tool Calls", toolCalls);

      completionBody.messages.push(chatGPTResponse.choices[0].message);
      await Promise.all(
        toolCalls.map(async (toolCall) => {
          if (toolCall.type === "function") {
            const args = JSON.parse(toolCall.function.arguments);
            const metadata = { agentId };

            console.log("Tool Call", { toolCall, toolCallArgs: args });

            const rawToolCall = find(tools, {
              function: { name: toolCall.function.name },
            });

            if (!rawToolCall?.endpoint) {
              throw new HTTPException(400, {
                message: "Tool endpoint not found",
              });
            }

            const response = await fetch(rawToolCall?.endpoint, {
              method: "POST",
              body: JSON.stringify({ toolCall, metadata }),
              headers: {
                "Content-Type": "application/json",
              },
            });

            const toolCallResponse = await response.json();

            return toolCallResponse;
          }
          return null;
        })
      );
    }

    await sessionService.updateSession({
      id: session!.sessionId,
      delta: { query: completionBody },
    });
  } while (chatGPTResponse.choices[0].message.tool_calls?.length);

  // Charge for running the agent

  //const tx = await wallet.createTransfer({
  //  amount: 1,
  //  assetId: COMMON_TOKEN_ADDRESS,
  //  destination: "0xd9303dfc71728f209ef64dd1ad97f5a557ae0fab",
  //});

  //await tx.wait();

  return c.json({
    ...chatGPTResponse.choices[0].message,
    sessionId: session?.sessionId,
  });
}

export async function getAllAgents(c: Context) {
  const rows = await agentService.getAgents();
  // Filter only isLiaison
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
