import Image from "next/image";

export const Networks = [
  { value: "ethereum", label: "Ethereum", icon: "/icons/ethereum-logo.svg" },
  { value: "base", label: "Base", icon: "/icons/base-logo.svg" },
  { value: "arbitrum", label: "Arbitrum", icon: "/icons/arbitrum-logo.svg" },
  { value: "optimism", label: "Optimism", icon: "/icons/optimism-logo.svg" },
  { value: "og", label: "OG", icon: "/icons/ethereum-logo.svg" },
];

export function NetworkBadge({ value }: { value: string }) {
  const networks = Networks;
  return (
    <div className="border rounded-full p-1 w-[110px]">
      <div className="flex items-center">
        <Image
          src={
            networks.find((network) => network.value === value)?.icon ||
            "/icons/ethereum-logo.svg"
          }
          alt={value}
          width={16}
          height={16}
        />
        <p className="ml-2 text-xs ">
          {networks.find((network) => network.value === value)?.label}
        </p>
      </div>
    </div>
  );
}
