import { createWalletClient, http, getContract } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { getChainByName } from "#/lib/chains.js";
import { publicClient } from "#/services/coinbase.service.js";
import { SolcService } from "#/services/solc.service.js";
import { fetchAbiFromExplorer } from "#/services/etherscan.service.js";

export class ContractTool {
  constructor(private network: string) {}

  public async callContract(
    args: {
      privateKey: string;
      contractAddress: string;
      abi: any;
      method: string;
      methodArgs?: any[];
      isWrite?: boolean;
    },
    _metadata: any
  ) {
    const chain = getChainByName(this.network);
    const walletClient = createWalletClient({
      account: privateKeyToAccount(`0x${args.privateKey}` as `0x${string}`),
      chain,
      transport: http(),
    });

    const contract = getContract({
      address: args.contractAddress as `0x${string}`,
      abi: args.abi,
      client: walletClient,
    });

    if (!args.isWrite) {
      const data = await contract.read[args.method](
        ...((args.methodArgs as [any, ...any[]]) || [])
      );
      return { status: "success", result: data };
    } else {
      const hash = await contract.write[args.method](
        ...((args.methodArgs as [any, ...any[]]) || [])
      );
      await publicClient.waitForTransactionReceipt({ hash });
      return { status: "success", txHash: hash };
    }
  }

  public async compileAndDeploy(
    args: {
      privateKey: string;
      sourceCode: string;
      contractName?: string;
      constructorArgs?: any[];
    },
    _metadata: any
  ) {
    const chain = getChainByName(this.network);
    const solcService = new SolcService(chain);
    const { abi, bytecode } = await solcService.compile(
      args.sourceCode,
      args.contractName || "MyContract"
    );
    const newAddress = await solcService.deploy(
      args.privateKey,
      abi,
      bytecode,
      args.constructorArgs || []
    );
    return { status: "success", contractAddress: newAddress, abi };
  }

  public async compileContract(
    args: {
      sourceCode: string;
      contractName?: string;
    },
    _metadata: any
  ) {
    const chain = getChainByName(this.network);
    const solcService = new SolcService(chain);
    const { abi, bytecode } = await solcService.compile(
      args.sourceCode,
      args.contractName || "MyContract"
    );
    return { status: "success", abi, bytecode };
  }

  public async deployContract(
    args: {
      privateKey: string;
      abi: any;
      bytecode: string;
      constructorArgs?: any[];
    },
    _metadata: any
  ) {
    const chain = getChainByName(this.network);
    const newAddress = await new SolcService(chain).deploy(
      args.privateKey,
      args.abi,
      args.bytecode,
      args.constructorArgs || []
    );
    return { status: "success", contractAddress: newAddress };
  }

  /**
   * If `useExplorer = true`, fetch ABI from an Etherscan-like explorer.
   * Otherwise, if sourceCode is provided, compile locally to get the ABI.
   */
  public async getAbi(args: {
    contractAddress?: string;
    sourceCode?: string;
    contractName?: string;
    useExplorer?: boolean;
  }) {
    // 1. If we have a deployed contract & want to fetch from explorer
    if (args.contractAddress && args.useExplorer) {
      const abi = await fetchAbiFromExplorer(
        this.network,
        args.contractAddress
      );
      return { abi };
    }

    // 2. If we have local source code, compile it to get the ABI
    if (args.sourceCode) {
      const chain = getChainByName(this.network);
      const solcService = new SolcService(chain);
      const { abi } = await solcService.compile(
        args.sourceCode,
        args.contractName || "MyContract"
      );
      return { abi };
    }

    throw new Error(
      "Must provide either (contractAddress + useExplorer) or (sourceCode) to get ABI."
    );
  }
}
