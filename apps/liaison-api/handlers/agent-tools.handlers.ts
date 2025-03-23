import { agentService } from "../services/agent.service.js";
import { applyDefaults, CDPToolEngine } from "../tools/cdp.tool.js";
import { GraphQLToolEngine } from "../tools/graphql.tool.js";
import { ContractToolEngine } from "../tools/contract.tool.js"; // Updated import
import { IpfsToolEngine } from "../tools/ipfs.tool.js"; // Updated import
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
    new ContractToolEngine(agent.network ?? ""),
    new IpfsToolEngine(),
    new GraphQLToolEngine(),
    applyDefaults(new CDPToolEngine(wallet), wallet),
    // this.commonToolService,
    // this.ethereumToolService,
    // @ts-expect-error
  ].find((tool) => tool[toolCall.function.name]);

  if (!toolWithMethod) {
    throw new HTTPException(400, {
      message: `No matching tool found for method: ${toolCall.function.name}`,
    });
  }

  // @ts-expect-error - dynamic method call
  const data = await toolWithMethod[toolCall.function.name](args, metadata);

  return data;
}
