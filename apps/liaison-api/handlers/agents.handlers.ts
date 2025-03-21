import { baseSepolia } from "#/lib/baseSepolia";
import * as schema from "#/models/schema";
import { Wallet } from "@coinbase/coinbase-sdk";
import {
  eq,
  inArray,
  type InferInsertModel,
  type InferSelectModel,
  sql,
} from "drizzle-orm";
import type { Context } from "hono";
import { AGENT_REGISTRY_ABI } from "lib/abis/AgentRegistryABI";
import { AGENT_REGISTRY_ADDRESS, COMMON_TOKEN_ADDRESS } from "lib/addresses";
import { find, first, map, omit } from "lodash-es";
import type { Except } from "type-fest";
import { createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { database as db } from "#/services/database.service";
import { publicClient } from "#/services/coinbase.service";
import typia from "typia";
import type { CDPTool } from "#/tools/cdp.tool";
import dedent from "dedent";
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionCreateParamsNonStreaming,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources.mjs";
import { HTTPException } from "hono/http-exception";
import { sessionService } from "#/services/session.service";
import { openai } from "#/services/openai.service";
import type { GraphQLTool } from "#/tools/graphql.tool";

const app = typia.llm.application<CDPTool & GraphQLTool, "chatgpt">();

export async function createAgent(c: Context) {
  const props = (await c.res.json()) as {
    value: Except<InferInsertModel<typeof schema.agent>, "wallet" | "agentId">;
    commonsOwned?: boolean;
  };
  const wallet = await Wallet.create();
  const faucetTx = await wallet.faucet();
  await faucetTx.wait();

  const agentId = (await wallet.getDefaultAddress())?.getId().toLowerCase();
  let agentOwner = "0xD9303DFc71728f209EF64DD1AD97F5a557AE0Fab";
  if (!props.commonsOwned) {
    agentOwner = props.value.owner as string;
  }

  const agentEntry = await db
    .insert(schema.agent)
    .values({
      ...props.value,
      agentId,
      owner: agentOwner,
      wallet: wallet.export(),
    })
    .returning()
    .then(first<InferSelectModel<typeof schema.agent>>);

  if (props.commonsOwned) {
    const commonsWallet = createWalletClient({
      account: privateKeyToAccount(
        process.env.WALLET_PRIVATE_KEY! as `0x${string}`
      ),
      chain: baseSepolia,
      transport: http(),
    });

    const contract = getContract({
      abi: AGENT_REGISTRY_ABI,
      address: AGENT_REGISTRY_ADDRESS,

      client: commonsWallet,
    });

    const metadata =
      "https://coral-abstract-dolphin-257.mypinata.cloud/ipfs/bafkreiewjk5fizidkxejplpx34fjva7f6i6azcolanwgtzptanhre6twui";

    const isCommonAgent = true;

    const txHash = await contract.write.registerAgent([
      agentId,
      metadata,
      isCommonAgent,
    ]);

    await publicClient.waitForTransactionReceipt({ hash: txHash });
  }

  // TODO: Work on interval
  // @ts-expect-error
  const interval = props.interval || 10;

  //   await db.execute(
  //     sql`SELECT cron.schedule(FORMAT('agent:%s:schedule', ${agentEntry?.agentId}),'*/${interval} * * * *', FORMAT('SELECT trigger_agent(%L)', ${agentEntry?.agentId}))`
  //   );

  return c.json(agentEntry);
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
  const props = (await c.res.json()) as {
    agentId: string;
    messages?: ChatCompletionMessageParam[];
    sessionId?: string;
  };
  const { agentId, sessionId } = props;

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

  const commonsBalance = await wallet.getBalance(COMMON_TOKEN_ADDRESS);

  if (commonsBalance.lte(0)) {
    throw new HTTPException(400, { message: "Agent has no tokens" });
  }

  console.log(commonsBalance);

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

  const tx = await wallet.createTransfer({
    amount: 1,
    assetId: COMMON_TOKEN_ADDRESS,
    destination: "0xd9303dfc71728f209ef64dd1ad97f5a557ae0fab",
  });

  await tx.wait();

  return c.json({
    ...chatGPTResponse.choices[0].message,
    sessionId: session?.sessionId,
  });
}
