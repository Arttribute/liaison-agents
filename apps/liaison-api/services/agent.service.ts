import { baseSepolia } from "#/lib/baseSepolia";
import { Wallet } from "@coinbase/coinbase-sdk";
import { HDKey } from "@scure/bip32";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { COMMON_TOKEN_ADDRESS } from "lib/addresses";
import { createWalletClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { database as db } from "./database.service";
import { HTTPException } from "hono/http-exception";
import { publicClient } from "#/services/coinbase.service";

class AgentService {
  public seedToPrivateKey(seed: string) {
    const seedBuffer = Buffer.from(seed, "hex");
    const hmac = crypto.createHmac("sha512", "Bitcoin seed");
    hmac.update(seedBuffer);

    const node = HDKey.fromMasterSeed(seedBuffer);
    const childNode = node.derive("m/44'/60'/0'/0/0"); // Standard Ethereum path
    const privateKey = Buffer.from(childNode.privateKey!).toString("hex");
    return privateKey;
  }

  async purchaseCommons(props: { agentId: string; amountInCommon: string }) {
    const { agentId, amountInCommon } = props;
    const agent = await db.query.agent.findFirst({
      where: (t) => eq(t.agentId, agentId),
    });

    if (!agent) {
      throw new HTTPException(400, { message: "Agent not found" });
    }

    const amountInWei = BigInt(parseUnits(amountInCommon, 18)) / 100000n;

    // Hack to get transaction to work
    // Since transaction on CDP had limited gas, transaction was always failing
    // Needed to use another provider to send the transaction

    const privateKey = this.seedToPrivateKey(agent.wallet.seed);

    const wallet = createWalletClient({
      account: privateKeyToAccount(`0x${privateKey}` as `0x${string}`),
      chain: baseSepolia,
      transport: http(),
    });
    const txHash = await wallet.sendTransaction({
      to: COMMON_TOKEN_ADDRESS.toLowerCase() as `0x${string}`,
      value: amountInWei,
      chain: undefined,
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });
  }

  async checkCommonsBalance(props: { agentId: string }) {
    const { agentId } = props;

    const agent = await db.query.agent.findFirst({
      where: (t) => eq(t.agentId, agentId),
    });

    if (!agent) {
      throw new HTTPException(400, { message: "Agent not found" });
    }

    const wallet = await Wallet.import(agent.wallet);
    const commonsBalance = await wallet.getBalance(COMMON_TOKEN_ADDRESS);

    return commonsBalance.toNumber();
  }

  async getAgent(props: { agentId: string }) {
    const agent = await db.query.agent.findFirst({
      where: (t) => eq(t.agentId, props.agentId),
    });

    if (!agent) {
      throw new HTTPException(400, { message: "Agent not found" });
    }

    return agent;
  }

  //get agent by id
  async getAgentById(agentId: string) {
    const agent = await db.query.agent.findFirst({
      where: (t) => eq(t.agentId, agentId),
    });
    if (!agent) {
      throw new HTTPException(400, { message: "Agent not found" });
    }
    return agent;
  }

  //get all agents
  async getAgents() {
    const agents = await db.query.agent.findMany();
    return agents;
  }
}

export const agentService = new AgentService();
