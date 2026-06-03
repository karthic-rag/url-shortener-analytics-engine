import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, type ShortenResponse } from "../services/api";
import { Link2, Copy, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="w-full max-w-xl mt-16 px-4">
      <div className="bg-slate-800 border border-slate-700/60 p-8 rounded-2xl shadow-2xl space-y-8">
        {/* Component Header Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">
            Shorten a Destination URL
          </h2>
          <p className="text-sm text-slate-400">
            Paste your long link below. The engine will compress it and generate
            an anonymous ownership token for tracking.
          </p>
        </div>

        {/* Shortener Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
              <Link2 size={18} />
            </div>
            <input
              type="url"
              required
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="https://example.com/very/long/deep/link/path"
              className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-sm font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-500/20 transition-all flex justify-center items-center gap-2 text-white"
          >
            {mutation.isPending ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Compress URL"
            )}
          </button>
        </form>

        {/* Server Error Alert Handler */}
        {mutation.isError && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-semibold">
            Failed to process destination URL. Please try again later.
          </div>
        )}

        {/* Success Panel Overlay (Displays when backend returns data) */}
        {generatedLink && (
          <div className="mt-6 p-5 bg-slate-900/60 border border-emerald-500/20 rounded-xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 size={14} /> Link Successfully Generated
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink.shortUrl}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-indigo-400 outline-none"
              />
              <button
                onClick={() => handleCopy(generatedLink.shortUrl)}
                className="bg-slate-800 hover:bg-slate-700 p-2.5 rounded-lg border border-slate-700 transition-colors text-slate-300"
                title="Copy Link to Clipboard"
              >
                {copied ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <Copy size={18} />
                )}
              </button>
            </div>

            <button
              onClick={() => onLinkGenerated(generatedLink.shortKey)}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors pt-2 group"
            >
              Enter Performance Analytics Console
              <ArrowRight
                size={14}
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
