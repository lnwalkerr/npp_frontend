"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Legend as RechartsLegend } from "recharts";

// Lazy load recharts components
const BarChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.BarChart })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        Loading chart...
      </div>
    ),
  },
);

const Bar = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Bar })),
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

interface BarChartComponentProps {
  data: any[];
  height?: number;
}

export function LazyBarChart({ data, height = 400 }: BarChartComponentProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          Loading chart...
        </div>
      }
    >
      <ResponsiveContainer height={height} width="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 2600]} ticks={[0, 650, 1300, 1950, 2600]} />
          <Tooltip />
          <RechartsLegend />
          <Bar dataKey="Donations" fill="#28a745" />
          <Bar dataKey="News" fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>
    </Suspense>
  );
}
