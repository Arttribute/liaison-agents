"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, Check, InfoIcon } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  NetworkSelect,
  SelectedNetwork,
} from "@/components/networks/network-select";

export default function LiaisonForm() {
  const router = useRouter();
  const { authState } = useAuth();
  const { walletAddress } = authState;
  const userAddress = walletAddress?.toLowerCase();
  // State for the agent form
  const [agentData, setAgentData] = useState({
    name: "",
    owner: userAddress,
    network: "base", // Default network
    isLiaison: "true",
  });

  interface ResultType {
    liaisonKey: string;
    agentId: string;
  }

  const [result, setResult] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [toolSchema, setToolSchema] = useState<object>({});

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   setAgentData({ ...agentData, [e.target.name]: e.target.value });
  // };

  const handleNetworkChange = (network: string) => {
    setAgentData((prev) => ({ ...prev, network }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("Creating agent:", agentData);

    try {
      const res = await fetch("/api/liaisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create external agent.");
      }
      console.log("Agent created:", data);
      setResult(data); // Store liaison details
      setToolSchema({
        info: {
          title: "Liaison Agent Interaction API",
          description:
            "Allows Agent to securely interact with a liaison agent that perform onchain actions on their behalf",
          version: "v1.0.0",
        },
        servers: [
          {
            url: `${process.env.NEXT_PUBLIC_NEST_API_BASE_URL}/v1`,
          },
        ],
        paths: {
          "/liaison/interact": {
            post: {
              description: "Send a message to the liaison agent",
              operationId: "interactWithLiaison",
              parameters: [
                {
                  name: "x-api-key",
                  in: "header",
                  description: "Secret key for authentication",
                  required: true,
                  schema: {
                    type: "string",
                  },
                },
              ],
              requestBody: {
                required: true,
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        liaisonAgentId: {
                          type: "string",
                          description: `The unique ID of the liaison agent which is ${data.agentId}`,
                        },
                        message: {
                          type: "string",
                          description: "Message to send to the liaison agent",
                        },
                      },
                      required: ["liaisonAgentId"],
                    },
                  },
                },
              },
              responses: {
                "200": {
                  description: "Successful interaction with the liaison agent",
                },
              },
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      {!result ? (
        // Show Form
        <div className="p-8 w-md  border border-gray-400 rounded-lg shadow-lg transition-transform hover:scale-105 hover:shadow-xl">
          <div className="mb-4">
            <div className="bg-linear-to-r from-cyan-200 to-blue-200 w-80 h-8 -mb-8 rounded-lg"></div>
            <h2 className="text-2xl font-bold">{"Bring your Agent Onchain"}</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-full">
                <Label htmlFor="name">{"Agent Name"}</Label>
                <Input
                  id="name"
                  value={agentData.name || ""}
                  onChange={(e) =>
                    setAgentData({ ...agentData, name: e.target.value })
                  }
                  placeholder="My Awesome Agent"
                  className="w-full"
                />
              </div>
            </div>

            <div className="w-full">
              <Label htmlFor="network">{"Network"}</Label>
              <SelectedNetwork value={agentData.network} />
              <NetworkSelect
                value={agentData.network}
                onValueChange={handleNetworkChange}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Liaison..." : "Create Liaison"}
            </Button>
          </form>
        </div>
      ) : (
        // Show Liaison Details
        <div className="p-8 w-md border border-gray-400 rounded-lg shadow-lg">
          <div className="mb-4">
            <div className="bg-linear-to-r from-lime-200 to-teal-200 w-80 h-8 -mb-8 rounded-lg"></div>
            <h2 className="text-2xl font-bold">
              {"Success: Liaison Created!"}
            </h2>
          </div>
          {/* Agent ID */}
          <p className="text-sm font-semibold">{"Liaison key"}</p>
          <div className="flex justify-between items-center bg-gray-100 px-4 p-1 rounded">
            <p className="text-sm">
              {result.liaisonKey.slice(0, 14) +
                "...." +
                result.liaisonKey.slice(-14)}
            </p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(result.liaisonKey, "liaisonKey")}
            >
              {copiedField === "liaisonKey" ? (
                <Check className="text-green-500" />
              ) : (
                <Copy />
              )}
            </Button>
          </div>
          <p className="text-xs  text-amber-700 mt-1">
            <InfoIcon className="w-3 h-3 inline mr-1 mb-0.5" />
            {"This secret will only be shown once."}
          </p>

          {/* Liaison Tool Schema */}

          <div className="mt-1 relative">
            <p className="text-sm font-semibold">{"Liaison Tool Schema:"}</p>
            <pre className="bg-slate-900 text-sm text-white p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(toolSchema, null, 2)}
            </pre>
            <Button
              variant="outline"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={() =>
                handleCopy(JSON.stringify(toolSchema, null, 2), "schema")
              }
            >
              {copiedField === "schema" ? (
                <>
                  {" "}
                  <Check className="h-3 w-3 text-green-500" />
                  <p>schema copied</p>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <p>copy schema</p>
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="-p-1 mt-1  bg-sky-200 rounded-lg">
            <p className="text-xs  text-gray-700">
              {
                "Copy the liaison secret and this schema and insert it into your agent's tools/actions. This allows your agent to interact with the liaison agent. Learn more"
              }
            </p>
          </div>

          <Button
            className="mt-3 w-full"
            onClick={() => router.push("/studio")}
          >
            {"Go to Dashboard"}
          </Button>
        </div>
      )}
    </>
  );
}
