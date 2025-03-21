"use client";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NetworkSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  label?: string;
}

const networks = [
  { value: "ethereum", label: "Ethereum" },
  { value: "base", label: "Base" },
  { value: "arbitrum", label: "Arbitrum" },
  { value: "optimism", label: "Optimism" },
  { value: "og", label: "OG" },
];

export function SelectedNetwork({ value }: { value: string }) {
  return (
    <div className="mt-1 border rounded-md p-2">
      <p className="text-sm">
        {networks.find((network) => network.value === value)?.label}
      </p>
    </div>
  );
}

export function NetworkSelect({
  value,
  onValueChange,
  className,
  label = "Network",
}: NetworkSelectProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="mt-1 border rounded-md p-1">
        <div className="max-h-[90px] overflow-y-auto ">
          {networks.map((network) => (
            <div
              key={network.value}
              onClick={() => onValueChange(network.value)}
              className={cn(
                "flex items-center justify-between px-2 py-1.5 rounded-sm text-sm cursor-pointer",
                "hover:bg-muted transition-colors"
              )}
            >
              <span>{network.label}</span>
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
