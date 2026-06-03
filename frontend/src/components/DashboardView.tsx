import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserLinks,
  deleteShortLink,
  fetchAnalytics,
} from "../services/api";
import {
  BarChart3,
  Smartphone,
  MousePointerClick,
  Trash2,
  Eye,
  Calendar,
  Monitor,
  Compass,
  MapPin,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface BreakdownProps {
  title: string;
  icon: React.ReactNode;
  data: Record<string, number>;
}

function BreakdownSection({ title, icon, data }: BreakdownProps) {
  const total = Object.values(data || {}).reduce((a, b) => a + b, 0);
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl hover:border-indigo-500/30 transition-all group">
      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
        <span className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors text-slate-400">
          {icon}
        </span>{" "}
        {title}
      </h4>
      <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2">
        {data && Object.entries(data).length > 0 ? (
          Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value]) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate pr-2">
                    {key}
                  </span>
                  <span className="text-slate-400 whitespace-nowrap font-mono text-[10px]">
                    {value} ({Math.round((value / (total || 1)) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950/50 rounded-full h-1.5 shadow-inner">
                  <div
                    className="bg-linear-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                    style={{ width: `${(value / (total || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
        ) : (
          <div className="text-xs text-slate-500 italic text-center py-6 bg-slate-950/30 rounded-xl border border-slate-800/50">
            No data available
          </div>
        )}
      </div>
    </div>
  );
}

interface DashboardViewProps {
  defaultShortKey: string | null;
}

export function DashboardView({ defaultShortKey }: DashboardViewProps) {
  const [activeShortKey, setActiveShortKey] = useState<string | null>(
    defaultShortKey,
  );
  const [deleteModalKey, setDeleteModalKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const handleCopy = async (url: string, shortKey: string) => {
    await navigator.clipboard.writeText(url);
    setCopiedKey(shortKey);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. QUERY: Fetch all links belonging to this anonymous session token
  const { data: userLinks, isLoading: loadingLinks } = useQuery({
    queryKey: ["userLinks"],
    queryFn: fetchUserLinks,
  });

  // 2. QUERY: Fetch specific chart metrics when an active shortKey is selected
  const {
    data: analytics,
    isLoading: loadingAnalytics,
    error: analyticsError,
  } = useQuery({
    queryKey: ["analytics", activeShortKey],
    queryFn: () => fetchAnalytics(activeShortKey!),
    enabled: !!activeShortKey,
  });

  // 3. MUTATION: Handle deleting a record from the database
  const deleteMutation = useMutation({
    mutationFn: deleteShortLink,
    onSuccess: () => {
      // Automatic Cache Invalidation: Forces React to refresh the link table silently
      queryClient.invalidateQueries({ queryKey: ["userLinks"] });

      // If the currently viewed report was just deleted, clear out the chart window
      setActiveShortKey(null);
    },
  });

  return (
    <>
      <div className="w-full grid grid-cols-1 xl:grid-cols-3 gap-8 mt-6">
        {/* ================= LEFT 2 COLUMNS: METRICS & VISUAL GRAPHS ================= */}
        <div className="xl:col-span-2 space-y-6">
          {loadingAnalytics && (
            <div className="flex h-64 justify-center items-center bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl">
              <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          )}

          {analyticsError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-6 rounded-2xl text-sm font-medium flex items-center gap-3 shadow-inner">
              <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              Failed to parse target summary report mapping context. Access
              credentials restriction mismatch.
            </div>
          )}

          {analytics ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Core Snapshot Summary Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl flex items-center gap-5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-colors" />
                  <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl shadow-inner border border-indigo-500/10 relative z-10">
                    <MousePointerClick size={24} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1">
                      Total Clicks
                    </p>
                    <h4 className="text-3xl font-black text-white tracking-tight">
                      {analytics.totalClicks}
                    </h4>
                  </div>
                </div>
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl flex items-center gap-5 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500/10 blur-2xl rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors" />
                  <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl shadow-inner border border-purple-500/10 relative z-10">
                    <Smartphone size={24} />
                  </div>
                  <div className="relative z-10">
                    <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mb-1">
                      Top Device
                    </p>
                    <h4 className="text-2xl font-bold text-white truncate max-w-[150px]">
                      {Object.entries(analytics.deviceBreakdown || {}).sort(
                        (a, b) => b[1] - a[1],
                      )[0]?.[0] || "N/A"}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Analytics Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BreakdownSection
                  title="Device Breakdown"
                  icon={<Monitor size={14} />}
                  data={analytics.deviceBreakdown || {}}
                />
                <BreakdownSection
                  title="Browser Breakdown"
                  icon={<Compass size={14} />}
                  data={analytics.browserBreakdown || {}}
                />
                <BreakdownSection
                  title="Referrer Breakdown"
                  icon={<LinkIcon size={14} />}
                  data={analytics.referrerBreakdown || {}}
                />
                <BreakdownSection
                  title="Geographic Context"
                  icon={<MapPin size={14} />}
                  data={analytics.countryBreakdown || {}}
                />
              </div>
            </div>
          ) : (
            !loadingAnalytics && (
              <div className="h-64 bg-slate-900/40 backdrop-blur-md border-2 border-dashed border-slate-700/50 rounded-3xl flex flex-col justify-center items-center text-slate-500 text-sm p-8 text-center shadow-inner">
                <div className="p-4 bg-slate-800/50 rounded-full mb-4">
                  <BarChart3 size={32} className="text-slate-600" />
                </div>
                <p className="max-w-xs leading-relaxed">
                  No active dataset selected. Click the{" "}
                  <strong className="text-slate-400">
                    View Analytics Dashboard
                  </strong>{" "}
                  button on any repository entry to display metrics.
                </p>
              </div>
            )
          )}
        </div>

        {/* ================= RIGHT 1 COLUMN: INDEXED MANAGEMENT TABLE ================= */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 sm:p-8 rounded-3xl h-fit space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center pb-4 border-b border-slate-800/80">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <LinkIcon size={16} className="text-indigo-400" /> Your Links
            </h3>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {userLinks?.length || 0} TOTAL
            </span>
          </div>

          {loadingLinks ? (
            <div className="flex justify-center items-center py-12">
              <div className="h-6 w-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : userLinks && userLinks.length > 0 ? (
            <div className="overflow-x-auto w-full max-h-[600px] overflow-y-auto pr-2 space-y-3">
              {userLinks.map((link) => (
                <div
                  key={link.shortKey}
                  className={`p-5 rounded-2xl border transition-all duration-300 ${
                    activeShortKey === link.shortKey
                      ? "bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                      : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900 shadow-inner"
                  }`}
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h5 className="font-mono text-sm font-bold text-indigo-400 truncate">
                          {link.shortUrl}
                        </h5>
                        <button
                          onClick={() => handleCopy(link.shortUrl, link.shortKey)}
                          className={`p-1.5 rounded-lg border transition-all flex items-center justify-center shrink-0 ${copiedKey === link.shortKey ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 hover:bg-slate-800 border-slate-700/50 hover:border-slate-600 text-slate-400'}`}
                          title="Copy Link to Clipboard"
                        >
                          {copiedKey === link.shortKey ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 tracking-wider">
                        <span className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-md border border-slate-800 uppercase">
                          <MousePointerClick
                            size={12}
                            className="text-indigo-400"
                          />{" "}
                          {link.clicks} clicks
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-md border border-slate-800">
                          <Calendar size={12} className="text-slate-400" />{" "}
                          {link.shortKey}
                        </span>
                      </div>
                    </div>

                    {/* Actions Button Subpanel Column layout wrapper */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setActiveShortKey(
                            activeShortKey === link.shortKey
                              ? null
                              : link.shortKey,
                          )
                        }
                        className={`p-2.5 rounded-xl border transition-all duration-300 ${
                          activeShortKey === link.shortKey
                            ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                            : "bg-slate-900 hover:bg-indigo-500/10 border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-400 shadow-inner"
                        }`}
                        title={
                          activeShortKey === link.shortKey
                            ? "Hide Analytics"
                            : "View Analytics"
                        }
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteModalKey(link.shortKey)}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/50 transition-all duration-300 text-slate-400 hover:text-rose-400 shadow-inner"
                        title="Delete Link"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-slate-950/30 rounded-2xl border border-slate-800/50 shadow-inner">
              <div className="inline-flex items-center justify-center p-4 bg-slate-900 rounded-full mb-3 shadow-inner">
                <LinkIcon size={24} className="text-slate-600" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                No active links tracked in your current session.
              </p>
            </div>
          )}
        </div>
      </div>

      {deleteModalKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-fadeIn">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
            {/* Red glow */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

            <h3 className="text-xl font-black text-white mb-3 flex items-center gap-2 relative z-10">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/20 shadow-inner">
                <Trash2 size={20} />
              </div>
              Confirm Deletion
            </h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed relative z-10">
              Are you sure you want to permanently delete{" "}
              <span className="text-rose-400 font-mono font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                {deleteModalKey}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 relative z-10">
              <button
                onClick={() => setDeleteModalKey(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all text-sm font-bold border border-slate-700 hover:border-slate-600 shadow-inner"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate(deleteModalKey);
                  setDeleteModalKey(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-rose-600/20 border border-white/10"
              >
                <Trash2 size={16} /> Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
