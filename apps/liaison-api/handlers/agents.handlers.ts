import { baseSepolia } from "#/lib/baseSepolia";
import * as schema from "#/models/schema";
import { Wallet } from "@coinbase/coinbase-sdk";
import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import type { Context } from "hono";
import { AGENT_REGISTRY_ABI } from "lib/abis/AgentRegistryABI";
import { AGENT_REGISTRY_ADDRESS } from "lib/addresses";
import { first } from "lodash-es";
import type { Except } from "type-fest";
import { createWalletClient, getContract, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { database as db } from "#/services/database.service";
import { publicClient } from "#/services/coinbase.service";

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

  await db.execute(
    sql`SELECT cron.schedule(FORMAT('agent:%s:schedule', ${agentEntry?.agentId}),'*/${interval} * * * *', FORMAT('SELECT trigger_agent(%L)', ${agentEntry?.agentId}))`
  );

  return c.json(agentEntry);
}
