"use client";
import { Check } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NetworkSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  label?: string;
}

export const Networks = [
  { value: "ethereum", label: "Ethereum", icon: "/icons/ethereum-logo.svg" },
  { value: "base", label: "Base", icon: "/icons/base-logo.svg" },
  { value: "arbitrum", label: "Arbitrum", icon: "/icons/arbitrum-logo.svg" },
  { value: "optimism", label: "Optimism", icon: "/icons/optimism-logo.svg" },
  { value: "og", label: "OG", icon: "/icons/ethereum-logo.svg" },
];

export function SelectedNetwork({ value }: { value: string }) {
  const networks = Networks;
  return (
    <div className="mt-1 border rounded-md p-2">
      <div className="flex items-center">
        <Image
          src={
            networks.find((network) => network.value === value)?.icon ||
            "/icons/ethereum-logo.svg"
          }
          alt={value}
          width={20}
          height={20}
        />
        <p className="ml-2">
          {networks.find((network) => network.value === value)?.label}
        </p>
      </div>
    </div>
  );
}

export function NetworkSelect({
  value,
  onValueChange,
  className,
  label = "Network",
}: NetworkSelectProps) {
  const networks = Networks;
  return (
    <div className={cn("w-full", className)}>
      <div className="mt-1 border rounded-md p-1">
        <div className="max-h-[90px] overflow-y-auto ">
          {networks.map((network) => (
            <div
              key={network.value}
              onClick={() => onValueChange(network.value)}
              className={cn(
                "flex items-center px-2 py-1.5 rounded-sm text-sm cursor-pointer",
                "hover:bg-muted transition-colors"
              )}
            >
              <Image
                src={network.icon}
                alt={network.label}
                width={20}
                height={20}
              />
              <p className="ml-2">{network.label}</p>
              <div className="flex-grow"></div>
              {value === network.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
