"use client";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "@/lib/networks";
import { useViemWalletClient } from "@/hooks/use-viem-wallet-client";

export function usePrivyViemClients(eip1193Provider: any) {
  // public client (just for reads)
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(baseSepolia.rpcUrls.default.http[0]),
  });

  // wallet client from the user’s EIP-1193
  const walletClient = useViemWalletClient(eip1193Provider);

  return { publicClient, walletClient };
}
