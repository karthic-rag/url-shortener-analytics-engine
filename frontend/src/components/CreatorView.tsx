import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, type ShortenResponse } from "../services/api";
import { Link2, Copy, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface CreatorViewProps {
  onLinkGenerated: (shortKey: string) => void;
}

export function CreatorView({ onLinkGenerated }: CreatorViewProps) {
  const [longUrl, setLongUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<ShortenResponse | null>(
    null,
  );

  // 1. Configure the Asynchronous Server Mutation
  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await api.post<ShortenResponse>("/shorten", {
        longUrl: url,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setGeneratedLink(data);
      // 2. Security Token Loop: Save the issued identity token if sent by backend
      if (data.tokenIssued && data.anonymousToken) {
        localStorage.setItem("anon_tracking_token", data.anonymousToken);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) return;
    mutation.mutate(longUrl);
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset toast/icon state after 2 seconds
  };

  return (
    <div className="w-full max-w-xl mt-12 px-4 relative z-10 mx-auto">
      {/* Decorative background glow */}
      <div className="absolute -inset-1 bg-linear-to-r from-indigo-500 to-purple-600 rounded-4xl blur-2xl opacity-20 -z-10 animate-pulse pointer-events-none" />

      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 sm:p-10 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden">
        {/* Subtle top glare */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-indigo-400/30 to-transparent" />

        {/* Component Header Text */}
        <div className="space-y-4 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl mb-1 border border-indigo-500/20 shadow-inner">
            <Sparkles size={24} />
          </div>
          <h2 className="text-3xl font-black tracking-tight text-white bg-linear-to-br from-white to-slate-400 bg-clip-text">
            Shorten your links
          </h2>
          <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
            Paste your long URL below. Our engine will compress it and generate
            an anonymous token for advanced tracking.
          </p>
        </div>

        {/* Shortener Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <Link2 size={20} />
            </div>
            <input
              type="url"
              required
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/path..."
              className="w-full bg-slate-950/50 border border-slate-700/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-12 pr-4 py-4 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-sm font-bold py-4 px-4 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all flex justify-center items-center gap-2 text-white border border-white/5"
          >
            {mutation.isPending ? (
              <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Compress URL <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Server Error Alert Handler */}
        {mutation.isError && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-xs font-medium flex items-center gap-3 shadow-inner">
            <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
            Failed to process destination URL. Please try again.
          </div>
        )}

        {/* Success Panel Overlay */}
        {generatedLink && (
          <div className="mt-8 p-6 bg-slate-950/50 border border-emerald-500/30 rounded-2xl space-y-5 shadow-inner relative overflow-hidden group/success">
            {/* Emerald glow */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />

            <div className="flex items-center gap-2 text-[11px] font-black text-emerald-400 uppercase tracking-widest relative z-10">
              <CheckCircle2 size={14} /> Ready for sharing
            </div>

            <div className="flex gap-2 relative z-10">
              <input
                type="text"
                readOnly
                value={generatedLink.fullShortUrl}
                className="flex-1 bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-sm font-mono text-indigo-300 outline-none shadow-inner select-all"
              />
              <button
                onClick={() => handleCopy(generatedLink.fullShortUrl)}
                className={`p-3 rounded-xl border transition-all flex items-center justify-center ${copied ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" : "bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300"}`}
                title="Copy Link to Clipboard"
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>

            <button
              onClick={() => onLinkGenerated(generatedLink.shortKey)}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 py-3.5 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all group/btn relative z-10"
            >
              View Analytics Dashboard
              <ArrowRight
                size={14}
                className="transform group-hover/btn:translate-x-1 transition-transform text-indigo-400"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
