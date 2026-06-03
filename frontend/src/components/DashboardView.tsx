import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type AnalyticsResponse } from "../services/api";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  BarChart3,
  Globe,
  Smartphone,
  Compass,
  MousePointerClick,
} from "lucide-react";

// Register the core visual rendering components inside Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface DashboardViewProps {
  defaultShortKey: string | null;
}

export function DashboardView({ defaultShortKey }: DashboardViewProps) {
  const [shortKey, setShortKey] = useState(defaultShortKey || "");

  // 1. Fetch data from your Spring Boot Backend via TanStack Query
  const {
    data: analytics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["analytics", shortKey],
    queryFn: async () => {
      if (!shortKey.trim()) return null;
      const response = await api.get<AnalyticsResponse>(
        `/analytics/${shortKey}`,
      );
      return response.data;
    },
    enabled: !!shortKey.trim(), // Only trigger the network request if an actual key is typed or selected
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  // Helper utility to convert Java Maps into clean, stylized datasets for Chart.js
  const generateChartData = (
    mapData: Record<string, number> = {},
    label: string,
    colorPalette: string[],
  ) => {
    return {
      labels: Object.keys(mapData),
      datasets: [
        {
          label: label,
          data: Object.values(mapData),
          backgroundColor: colorPalette,
          borderColor: "rgba(30, 41, 59, 0.5)",
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#94a3b8", font: { weight: "bold" as const } },
      },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "#334155" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "#334155" } },
    },
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* 2. Key Search Input bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="w-full max-w-xl mx-auto flex gap-3"
      >
        <input
          type="text"
          value={shortKey}
          onChange={(e) => setShortKey(e.target.value)}
          placeholder="Enter shortKey to inspect analytics (e.g., Aa5)"
          className="flex-1 bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-sm font-bold px-6 py-3 rounded-xl shadow-lg transition-colors text-white"
        >
          Track Link
        </button>
      </form>

      {/* Loading & Error States Feedback Handlers */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="max-w-xl mx-auto bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-xl text-sm text-center">
          <strong>Access Denied or Not Found:</strong> Either this shortKey does
          not exist, or you do not hold the ownership token credentials required
          to view its metrics dashboard.
        </div>
      )}

      {/* 3. The Main Visual Dashboard Layer */}
      {analytics && (
        <div className="space-y-8">
          {/* Top Row Grid Layout: Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <MousePointerClick size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Redirects
                </p>
                <h4 className="text-2xl font-black text-white mt-1">
                  {analytics.totalClicks}
                </h4>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Smartphone size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Primary Device
                </p>
                <h4 className="text-lg font-bold text-white mt-1">
                  {Object.keys(analytics.deviceMap)[0] || "N/A"}
                </h4>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <Compass size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Top Referrer
                </p>
                <h4 className="text-lg font-bold text-white mt-1 truncate max-w-[150px]">
                  {Object.keys(analytics.referrerMap)[0] || "Direct"}
                </h4>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700/50 p-5 rounded-2xl flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                <Globe size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Top Country Location
                </p>
                <h4 className="text-lg font-bold text-white mt-1">
                  {Object.keys(analytics.countryMap)[0] || "N/A"}
                </h4>
              </div>
            </div>
          </div>

          {/* Bottom Row Grid Layout: Interactive Rendering Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Distribution Donut Graphic Panel */}
            <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-400" /> Device
                Distribution
              </h3>
              <div className="max-h-[300px] flex justify-center">
                <Doughnut
                  data={generateChartData(analytics.deviceMap, "Clicks", [
                    "#6366f1",
                    "#10b981",
                    "#f59e0b",
                  ])}
                />
              </div>
            </div>

            {/* Country Geolocation Bar Chart Panel */}
            <div className="bg-slate-800 border border-slate-700/50 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <Globe size={16} className="text-emerald-400" /> Geographic
                Traffic
              </h3>
              <Bar
                data={generateChartData(
                  analytics.countryMap,
                  "Clicks per Country",
                  ["#10b981"],
                )}
                options={chartOptions}
              />
            </div>
          </div>
        </div>
      )}

      {/* Base Welcome Placeholder Case */}
      {!analytics && !isLoading && !error && (
        <div className="text-center py-20 text-slate-500 text-sm max-w-sm mx-auto space-y-2">
          <p>
            Please provide a valid shortened key parameter string code to load
            real-time analytics distribution tracking data charts.
          </p>
        </div>
      )}
    </div>
  );
}
