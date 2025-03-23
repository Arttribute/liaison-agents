"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NetworkBadge } from "@/components/networks/network-badge";
import { supabase } from "@/lib/supabase-client";

// Define a TypeScript interface for our Agent records, if desired
interface Agent {
  agent_id: string;
  name: string;
  network: string | null;
  liaison_key_display: string | null;
  created_at: string;
  // add other fields as needed
}

interface LiasonsTableProps {
  userAddress?: string;
}

export function LiasonsTable({ userAddress }: LiasonsTableProps) {
  const router = useRouter();
  const [liaisons, setLiaisons] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  console.log("userAddress", userAddress);

  useEffect(() => {
    const fetchLiaisons = async () => {
      if (!userAddress) return; // If no user address, no need to fetch
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("agent")
          .select("*")
          .eq("is_liaison", true)
          .eq("owner", userAddress);

        setLoading(false);
        if (data) {
          // Adjust field names if your DB columns differ
          setLiaisons(data as Agent[]);
        }
        if (error) {
          console.error("Error fetching agents:", error);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };

    fetchLiaisons();
  }, [userAddress]);

  const handleClick = (agentId: string) => {
    router.push(`/studio/agents/${agentId}`);
  };

  if (!userAddress) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">
          Connect your wallet to see your liaison agents.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div>Loading your liaison agents...</div>;
  }

  if (liaisons.length === 0) {
    return <div>No liaison agents found for this wallet.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold">Name</TableHead>
          <TableHead className="font-semibold">Network</TableHead>
          <TableHead className="font-semibold">Liaison Key</TableHead>
          <TableHead className="font-semibold">Created</TableHead>
          <TableHead className="font-semibold">Last used</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {liaisons.map((liaison) => (
          <TableRow
            key={liaison.agent_id}
            onClick={() => handleClick(liaison.agent_id)}
            className="cursor-pointer"
          >
            <TableCell className="font-medium">{liaison.name}</TableCell>
            <TableCell>
              {liaison.network ? (
                <NetworkBadge value={liaison.network} />
              ) : (
                "N/A"
              )}
            </TableCell>
            <TableCell>{liaison.liaison_key_display || "—"}</TableCell>
            <TableCell className="">
              {new Date(liaison.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="">
              {"—" /* If you have a "last used" field, display it */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
