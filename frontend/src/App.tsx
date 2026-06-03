import { useState } from "react";
import { Link2, BarChart3 } from "lucide-react";
import { CreatorView } from "./components/CreatorView";
import { DashboardView } from "./components/DashboardView";

export default function App() {
  const [activeTab, setActiveTab] = useState<"create" | "analytics">("create");
  const [selectedShortKey, setSelectedShortKey] = useState<string | null>(null);

  // Helper utility to instantly navigate users to analytics for a freshly minted link
  const handleViewAnalytics = (shortKey: string) => {
    setSelectedShortKey(shortKey);
    setActiveTab("analytics");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-black text-xl tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          <Link2 className="text-indigo-400 h-6 w-6" /> NexaLink Engine
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "create"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Link2 size={14} /> Shorten URL
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "analytics"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 size={14} /> Tracking Console
          </button>
        </div>
      </nav>

      {/* Dynamic View Injection Port */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col justify-start items-center">
        {activeTab === "create" ? (
          <CreatorView onLinkGenerated={handleViewAnalytics} />
        ) : (
          <DashboardView defaultShortKey={selectedShortKey} />
        )}
      </main>
    </div>
  );
}
