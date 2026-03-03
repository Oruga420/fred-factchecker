import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import { Copy, FileText, List, AlertCircle } from 'lucide-react';

interface Change {
    type: "addition" | "deletion";
    value: string;
}

interface ResultViewerProps {
    id: string;
    status: "idle" | "processing" | "success" | "error";
    original?: string;
    final?: string;
    changes?: Change[];
    error?: string;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ status, final, changes, error }) => {
    const [viewMode, setViewMode] = useState<"clean" | "diff">("clean");

    if (status === "processing") return null;
    if (status === "error") {
        return (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
                <div className="flex items-center gap-2 mb-1 font-bold">
                    <AlertCircle className="w-4 h-4" /> Error
                </div>
                {error}
            </div>
        );
    }

    const copyToClipboard = () => {
        if (final) {
            const type = "text/html";
            const blob = new Blob([final], { type });
            const data = [new ClipboardItem({ [type]: blob })];
            navigator.clipboard.write(data).then(() => alert("Copied to clipboard!"));
        }
    };

    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden text-sm">
            {/* Mini Toolbar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode("clean")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${viewMode === "clean" ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100"
                            }`}
                    >
                        <FileText className="w-3.5 h-3.5" /> Final Doc
                    </button>
                    <button
                        onClick={() => setViewMode("diff")}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${viewMode === "diff" ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-100"
                            }`}
                    >
                        <List className="w-3.5 h-3.5" /> Edits
                    </button>
                </div>
                <button onClick={copyToClipboard} className="text-slate-400 hover:text-blue-600" title="Copy Output">
                    <Copy className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
                {viewMode === "clean" ? (
                    <div
                        className="prose prose-sm prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(final || "") }}
                    />
                ) : (
                    <div className="space-y-2 font-mono text-xs">
                        {changes?.map((change, idx) => (
                            <span key={idx} className={`inline-block mr-1 px-1 rounded ${change.type === 'addition' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800 line-through decoration-red-400'
                                }`}>
                                {change.value}
                            </span>
                        ))}
                        {changes?.length === 0 && <p className="text-slate-400 italic">No significant changes made.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};
