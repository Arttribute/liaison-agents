import { agentService } from "../services/agent.service.js";
import { applyDefaults, CDPToolEngine } from "../tools/cdp.tool.js";
import { GraphQLToolEngine } from "../tools/graphql.tool.js";
import { Wallet } from "@coinbase/coinbase-sdk";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { merge } from "lodash-es";
import type { ChatCompletionMessageToolCall } from "openai/resources.mjs";

export async function makeAgentToolCall(c: Context) {
  const params = (await c.req.json()) as {
    toolCall: ChatCompletionMessageToolCall;
    metadata: any;
  };
  const { metadata, toolCall } = params;
  const args = JSON.parse(toolCall.function.arguments);

  const { agentId } = metadata;

  const agent = await agentService.getAgent(agentId);

  if (!agent) {
    throw new HTTPException(400, { message: "Agent not found" });
  }

  const privateKey = agentService.seedToPrivateKey(agent.wallet.seed);
  const wallet = await Wallet.import(agent.wallet);
  merge(metadata, { privateKey });

  console.log("Tool Call", { toolCall, toolCallArgs: args });

  const toolWithMethod = [
    applyDefaults(new CDPToolEngine(wallet), wallet),
    new GraphQLToolEngine(),
    // this.commonToolService,
    // this.ethereumToolService,
    // @ts-expect-error
  ].find((tool) => tool[toolCall.function.name]);

  // console.log('Tool with method', toolWithMethod);

  // @ts-expect-error
  const data = await toolWithMethod[toolCall.function.name](args, metadata);

  return data;
}
