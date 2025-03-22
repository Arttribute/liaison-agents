"use client";

import { useState } from "react";
import { LogItem } from "@/components/logs/log-item";
import { LogDetails } from "@/components/logs/log-details";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

// Update the sample logs to include tool status and summary
const sampleLogs = [
  {
    id: "log-1",
    instruction: "Fetch user data from database",
    status: "success",
    message: "Successfully retrieved user data",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    responseTime: 245,
    agent: "Database Agent",
    sessionId: "sess_a1b2c3d4",
    tools: [
      {
        name: "database_query",
        status: "success",
        summary: "Retrieved user profile data from database",
        duration: 198,
      },
    ],
  },
  {
    id: "log-2",
    instruction: "Process payment transaction",
    status: "error",
    message: "Payment gateway timeout",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    responseTime: 5023,
    agent: "Payment Agent",
    sessionId: "sess_e5f6g7h8",
    tools: [
      {
        name: "payment_gateway",
        status: "error",
        summary: "Connection to payment processor timed out after 5 seconds",
        duration: 5000,
      },
      {
        name: "notification_service",
        status: "success",
        summary: "Error notification sent to system administrator",
        duration: 23,
      },
    ],
  },
  {
    id: "log-3",
    instruction: "Generate weekly report",
    status: "warning",
    message: "Report generated with incomplete data",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    responseTime: 1872,
    agent: "Reporting Agent",
    sessionId: "sess_i9j0k1l2",
    tools: [
      {
        name: "data_aggregator",
        status: "warning",
        summary: "Missing data from European sales region",
        duration: 1250,
      },
      {
        name: "pdf_generator",
        status: "success",
        summary: "PDF report generated with available data",
        duration: 622,
      },
    ],
  },
  {
    id: "log-4",
    instruction: "Send notification to users",
    status: "success",
    message: "Notifications sent to all users",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    responseTime: 532,
    agent: "Notification Agent",
    sessionId: "sess_m3n4o5p6",
    tools: [
      {
        name: "user_service",
        status: "success",
        summary: "Retrieved 1253 user contacts",
        duration: 125,
      },
      {
        name: "notification_service",
        status: "success",
        summary: "Sent 1250 emails, 3 failed due to invalid addresses",
        duration: 407,
      },
    ],
  },
  {
    id: "log-5",
    instruction: "Update product inventory",
    status: "success",
    message: "Inventory updated successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    responseTime: 189,
    agent: "Inventory Agent",
    sessionId: "sess_q7r8s9t0",
    tools: [
      {
        name: "inventory_service",
        status: "success",
        summary: "Updated stock levels for 2 products",
        duration: 189,
      },
    ],
  },
];

export type LogType = (typeof sampleLogs)[number];

export function LogsDisplay() {
  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = sampleLogs.filter(
    (log) =>
      log.instruction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sessionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-120px)]">
      <div
        className={cn(
          "flex-1 border rounded-lg shadow-sm overflow-hidden",
          selectedLog ? "md:w-2/3" : "w-full"
        )}
      >
        <div className="p-4 border-b bg-muted/30">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-center mt-4 text-sm font-medium text-muted-foreground">
            <div className="w-2/5">Instruction</div>
            <div className="w-1/5">Session ID</div>
            <div className="w-1/5">Status</div>
            <div className="w-1/5">Time</div>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <LogItem
                key={log.id}
                log={log}
                isSelected={selectedLog?.id === log.id}
                onClick={() => setSelectedLog(log)}
              />
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No logs found matching your search criteria
            </div>
          )}
        </div>
      </div>

      {selectedLog && (
        <div className="md:w-1/3 border rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
            <h3 className="font-medium">Log Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedLog(null)}
              className="h-8 px-2"
            >
              Close
            </Button>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
            <LogDetails log={selectedLog} />
          </div>
        </div>
      )}
    </div>
  );
}
