"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ResultViewer } from "@/components/ResultViewer";

export default function Home() {
  const [content, setContent] = useState("");
  const [clientWebsite, setClientWebsite] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ final: string; changes: { type: "addition" | "deletion"; value: string }[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!content.trim() || !clientWebsite.trim()) return;

    setIsProcessing(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/factchecker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, clientWebsite })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process");

      setResult({ final: data.final, changes: data.changes });
    } catch (e) {
      const eStr = e instanceof Error ? e.message : "An error occurred";
      console.error(eStr);
      setError(eStr);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto flex flex-col gap-6"
      >
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a] mb-2">
            Fred: <span className="text-blue-600">Fact Checker</span>
          </h1>
          <p className="text-[#2f4f35] font-serif italic max-w-xl mx-auto">
            Verifies factual claims in your copy using the Perplexity Search API and cross-references them against your client&apos;s exact website context.
          </p>
        </div>

        {/* Input Area */}
        <div className="card-zen overflow-hidden border-blue-100">
          <div className="px-6 py-4 border-b border-blue-50 bg-blue-50/30 flex justify-between items-center">
            <h3 className="font-bold text-gray-700">Verification Setup</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div>
              <label className="label-zen text-blue-600">Client Website Context</label>
              <input
                type="url"
                className="input-zen focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
                placeholder="https://example.com"
                value={clientWebsite}
                onChange={e => setClientWebsite(e.target.value)}
              />
            </div>

            <div>
              <label className="label-zen text-blue-600 mt-2">Content to Verify</label>
              <textarea
                className="input-zen textarea-zen focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.12)] font-mono text-sm leading-relaxed"
                placeholder="Paste the blog post text here..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            <button
              onClick={handleProcess}
              disabled={isProcessing || !content.trim() || !clientWebsite.trim()}
              className="mt-4 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Researching via Perplexity...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Verify Facts
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Error:</strong> {error}
            </div>
          </motion.div>
        )}

        {/* Result Area */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-zen p-6 border-blue-100"
          >
            <ResultViewer id="factchecker-result" status="success" final={result.final} changes={result.changes} />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
