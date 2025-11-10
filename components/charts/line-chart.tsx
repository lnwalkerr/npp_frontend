"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Legend as RechartsLegend } from "recharts";

// Lazy load recharts components
const LineChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.LineChart })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        Loading chart...
      </div>
    ),
  },
);

const Line = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Line })),
  {
    ssr: false,
  },
);

const XAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.XAxis })),
  {
    ssr: false,
  },
);

const YAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.YAxis })),
  {
    ssr: false,
  },
);

const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.CartesianGrid })),
  {
    ssr: false,
  },
);

const Tooltip = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Tooltip })),
  {
    ssr: false,
  },
);

// Legend imported directly above

const ResponsiveContainer = dynamic(
  () =>
    import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })),
  {
    ssr: false,
  },
);

interface LineChartComponentProps {
  data: any[];
  height?: number;
}

export function LazyLineChart({ data, height = 400 }: LineChartComponentProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          Loading chart...
        </div>
      }
    >
      <ResponsiveContainer height={height} width="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <RechartsLegend />
          <Line dataKey="users" stroke="#8884d8" type="monotone" />
        </LineChart>
      </ResponsiveContainer>
    </Suspense>
  );
}
