"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppBar from "@/components/layout/app-bar";
import { LogsDisplay } from "@/components/logs/logs-display";
import { UsageStatistics } from "@/components/stats/usage-statistics";
import { SidebarNav } from "@/components/studio/sidebar-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase-client";

export default function AgentStudio() {
  const params = useParams();
  const agentId = params?.agent as string;

  const { authState } = useAuth();
  const { walletAddress } = authState;
  const userAddress = walletAddress?.toLowerCase();

  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId || !userAddress) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("agent")
        .select("*")
        .eq("agent_id", agentId)
        .single();

      setLoading(false);

      if (error) {
        console.error("Error fetching agent:", error);
        return;
      }
      if (!data) {
        console.error("Agent not found");
        return;
      }
      if (data.owner?.toLowerCase() !== userAddress) {
        console.error("Unauthorized access");
        return;
      }
      setAgent(data);
    };

    fetchAgent();
  }, [agentId, userAddress]);

  if (!userAddress) {
    return (
      <div>
        <AppBar />
        <p className="m-4">Please connect your wallet to view this agent.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <AppBar />
        <p className="m-4">Loading agent data...</p>
      </div>
    );
  }

  if (!agent) {
    return (
      <div>
        <AppBar />
        <p className="m-4">No agent data found or unauthorized.</p>
      </div>
    );
  }

  // If agent is found and authorized, show the usage/logs
  return (
    <div>
      <AppBar />
      <div className="flex mt-12 overflow-hidden">
        <SidebarNav />

        <div className="flex flex-col m-8 w-full h-[96vh] overflow-scroll">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">Agent: {agent.name}</h1>
          </div>

          <Tabs defaultValue="usage">
            <TabsList className="grid w-96 grid-cols-2">
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>
            <TabsContent value="usage">
              {/* Pass the agentId down to UsageStatistics */}
              <UsageStatistics agentId={agentId} />
            </TabsContent>

            <TabsContent value="logs">
              {" "}
              <LogsDisplay agentId={agentId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
