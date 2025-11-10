"use client";

import { useState, useEffect } from "react";
import { Spinner } from "@heroui/spinner";

import { LazyLineChart } from "@/components/charts/line-chart";
import { LazyBarChart } from "@/components/charts/bar-chart";

interface DashboardData {
  statistics: Array<{
    title: string;
    value: string;
    change: string;
  }>;
  userGrowthChart: Array<{
    name: string;
    users: number;
  }>;
  activityChart: Array<{
    name: string;
    Donations: number;
    News: number;
  }>;
}

export default function Home() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard", {
          credentials: "include",
        });
        const data = await response.json();

        if (response.ok) {
          setDashboardData(data);
        } else {
          setError(data.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p>Error loading dashboard data:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const data = dashboardData?.statistics || [];
  const dataa = dashboardData?.userGrowthChart || [];
  const dataaa = dashboardData?.activityChart || [];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="font-bold text-3xl text-foreground">Dashboard</h1>
        <p className="mt-1">Welcome back to your admin panel</p>
      </div>
      <div className="flex gap-4 flex-wrap">
        {data.map((item) => (
          <div
            key={item.title}
            className="flex-1 flex flex-col justify-between border min-h-44 border-gray-300 rounded-xl p-6 bg-white shadow-md"
          >
            <div className="pb-3">
              <div className="text-sm font-medium">{item.title}</div>
            </div>
            <div className="">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {item.value}
                </div>
                <p className="text-green-600 mt-1 text-[12px]">{item.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6 flex flex-row flex-wrap gap-6">
        <div className="py-6 flex-1 flex flex-col border border-gray-300 rounded-xl bg-white gap-6 shadow-2xl">
          <div className="px-6">User Growth</div>
          <div className="px-6 flex-1">
            <LazyLineChart data={dataa} height={400} />
          </div>
        </div>
        <div className="py-6 flex flex-1 mb-6 flex-col border border-gray-300 rounded-xl bg-white gap-6 shadow-2xl">
          <div className="px-6">Activity Overview</div>
          <div className="px-6 flex-1">
            <LazyBarChart data={dataaa} height={400} />
          </div>
        </div>
      </div>
    </div>
  );
}
