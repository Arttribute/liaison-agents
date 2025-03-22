"use client";

import * as React from "react";
import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Area,
  AreaChart as RechartsAreaChart,
} from "recharts";
import { cn } from "@/lib/utils";

const ChartPrimitive = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn("w-full h-full", className)}>{children}</div>;

const ChartContainer = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={cn("h-[350px] w-full", className)}>
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  </div>
);

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border bg-background p-2 shadow-md rounded-md", className)}
    {...props}
  />
));
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm", className)} {...props} />
));
ChartTooltipContent.displayName = "ChartTooltipContent";

// Re-export recharts components
const LineChart = RechartsLineChart;
const BarChart = RechartsBarChart;
const AreaChart = RechartsAreaChart;
const XAxis = RechartsXAxis;
const YAxis = RechartsYAxis;
const Tooltip = RechartsTooltip;

export {
  ChartPrimitive as Chart,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  LineChart,
  BarChart,
  AreaChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
};
