import { defineChain } from "viem";
import type { Chain } from "viem";

// Predefined chain definitions
const mainnet = defineChain({
  id: 1,
  name: "Ethereum Mainnet",
  network: "homestead",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.ankr.com/eth"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
});

const arbitrum = defineChain({
  id: 42161,
  name: "Arbitrum One",
  network: "arbitrum",
  nativeCurrency: { name: "Arbitrum ETH", symbol: "AETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://arb1.arbitrum.io/rpc"] } },
  blockExplorers: {
    default: { name: "Arbitrum Explorer", url: "https://explorer.arbitrum.io" },
  },
});

const polygon = defineChain({
  id: 137,
  name: "Polygon Mainnet",
  network: "polygon",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.ankr.com/polygon"] } },
  blockExplorers: {
    default: { name: "Polygonscan", url: "https://polygonscan.com" },
  },
});

const baseSepolia = defineChain({
  id: 84532,
  name: "Base Sepolia",
  network: "base-sepolia",
  nativeCurrency: { name: "Base ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.ankr.com/base_sepolia"] } },
  blockExplorers: {
    default: { name: "BaseScan", url: "https://sepolia.basescan.org" },
  },
});

// Add more networks as needed

const chainMap: Record<string, Chain> = {
  ethereum: mainnet,
  arbitrum,
  polygon,
  base: baseSepolia, // "base" => base sepolia testnet
};

export function getChainByName(name: string): Chain {
  const chain = chainMap[name];
  if (!chain) {
    // default fallback or throw
    throw new Error(`Unsupported chain name: ${name}`);
  }
  return chain;
}
