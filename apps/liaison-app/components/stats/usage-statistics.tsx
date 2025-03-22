"use client";

import { useState, useMemo } from "react";
import { UsageGraph } from "@/components/stats/usage-graph";
import { ToolsUsageTable } from "@/components/stats/tools-usage-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateUsageData, generateToolsData } from "@/lib/sample-data";

// Time span options
const TIME_SPANS = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "3m", label: "3 Months" },
  { value: "12m", label: "12 Months" },
  { value: "24m", label: "24 Months" },
];

export function UsageStatistics() {
  const [timeSpan, setTimeSpan] = useState("7d");

  // Generate sample data based on the selected time span
  const usageData = useMemo(() => generateUsageData(timeSpan), [timeSpan]);
  const toolsData = useMemo(() => generateToolsData(timeSpan), [timeSpan]);

  // Calculate summary statistics
  const totalCalls = useMemo(
    () => usageData.reduce((sum, item) => sum + item.value, 0),
    [usageData]
  );

  const totalToolCalls = useMemo(
    () => toolsData.reduce((sum, tool) => sum + tool.calls, 0),
    [toolsData]
  );

  const averageDuration = useMemo(
    () =>
      Math.round(
        toolsData.reduce(
          (sum, tool) => sum + tool.avgDuration * tool.calls,
          0
        ) / totalToolCalls
      ),
    [toolsData, totalToolCalls]
  );

  const successRate = useMemo(
    () =>
      Math.round(
        (toolsData.reduce(
          (sum, tool) => sum + tool.successRate * tool.calls,
          0
        ) /
          totalToolCalls) *
          100
      ) / 100,
    [toolsData, totalToolCalls]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{"Usage Overview"}</h2>
          <p className="text-muted-foreground">
            {"Monitor your agent's activity and tool usage"}
          </p>
        </div>

        <Tabs
          value={timeSpan}
          onValueChange={setTimeSpan}
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full md:w-auto">
            {TIME_SPANS.map((span) => (
              <TabsTrigger key={span.value} value={span.value}>
                {span.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Calls</CardDescription>
            <CardTitle className="text-2xl">
              {totalCalls.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{"Avg. Response Time"}</CardDescription>
            <CardTitle className="text-2xl">
              {averageDuration}
              {"ms"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{"Success Rate"}</CardDescription>
            <CardTitle className="text-2xl">{successRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{"Usage Over Time"}</CardTitle>
          <CardDescription>
            {"Total number of calls over the selected time period"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <UsageGraph data={usageData} timeSpan={timeSpan} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{"Tool Usage Statistics"}</CardTitle>
          <CardDescription>
            {"Detailed usage statistics for each tool"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ToolsUsageTable data={toolsData} />
        </CardContent>
      </Card>
    </div>
  );
}
