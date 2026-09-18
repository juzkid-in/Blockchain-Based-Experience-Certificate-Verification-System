import React, { useState, useEffect } from "react";
import {
  Blocks,
  ShieldCheck,
  ShieldAlert,
  Hash,
  Copy,
  Check,
  RotateCw,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowDown,
  Info,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Block, ChainValidationResult } from "../types";
import { fetchBlockchain, verifyEntireBlockchain } from "../lib/api";

interface BlockchainExplorerViewProps {
  initialSelectedBlockIndex?: number;
  onNavigateToGenesis?: () => void;
  onNavigateToTamper?: (certId: string) => void;
}

export const BlockchainExplorerView: React.FC<BlockchainExplorerViewProps> = ({
  initialSelectedBlockIndex,
  onNavigateToGenesis,
  onNavigateToTamper,
}) => {
  const [chain, setChain] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [validationResult, setValidationResult] = useState<ChainValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState("");

  const loadChain = async () => {
    setLoading(true);
    try {
      const res = await fetchBlockchain();
      setChain(res.chain);
      setValidationResult(res.validation);

      if (initialSelectedBlockIndex !== undefined && res.chain[initialSelectedBlockIndex]) {
        setSelectedBlock(res.chain[initialSelectedBlockIndex]);
      } else if (res.chain.length > 0 && !selectedBlock) {
        setSelectedBlock(res.chain[res.chain.length - 1]);
      }
    } catch (err) {
      console.error("Error loading blockchain:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChain();
  }, [initialSelectedBlockIndex]);

  const handleVerifyChain = async () => {
    setValidating(true);
    try {
      const res = await verifyEntireBlockchain();
      setValidationResult(res);
    } catch (err) {
      console.error("Verification failed:", err);
    } finally {
      setValidating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const filteredBlocks = chain.filter((b) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      b.certificate_id.toLowerCase().includes(q) ||
      b.employee_name.toLowerCase().includes(q) ||
      b.employer.toLowerCase().includes(q) ||
      b.hash.toLowerCase().includes(q) ||
      String(b.index).includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Blocks className="w-4 h-4" />
            Distributed Ledger Audit
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Blockchain Explorer
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Live immutable chain of blocks starting from Genesis Block #0. Every certificate is sealed by SHA-256 and chained to its parent.
          </p>
        </div>

        {/* Verify Entire Blockchain Button */}
        <div className="flex items-center gap-3">
          <button
            id="verify-chain-btn"
            onClick={handleVerifyChain}
            disabled={validating}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50"
          >
            {validating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Auditing Chain...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Entire Blockchain</span>
              </>
            )}
          </button>
          <button
            onClick={loadChain}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Refresh Blockchain Data"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Validation Status Alert */}
      {validationResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-4 font-mono-hash text-xs ${
            validationResult.valid
              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/60 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-3 font-sans">
            {validationResult.valid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-bold text-sm block">
                {validationResult.valid ? "✓ CHAIN VERIFIED" : "⚠ CHAIN INTEGRITY COMPROMISED"}
              </span>
              <span className="text-xs text-slate-300">
                {validationResult.message}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400 text-xs">
            <span>Blocks Audited: {chain.length}</span>
            <span>Genesis Hash: Valid</span>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-hash">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 block uppercase text-[10px] font-sans">Block Height</span>
          <span className="text-xl font-bold text-white font-display">
            {chain.length > 0 ? chain.length - 1 : 0}
          </span>
          <span className="text-slate-400 text-[11px] block font-sans">Height from Genesis #0</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 block uppercase text-[10px] font-sans">Total Blocks</span>
          <span className="text-xl font-bold text-emerald-400 font-display">
            {chain.length}
          </span>
          <span className="text-slate-400 text-[11px] block font-sans">Ledger size in storage</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 block uppercase text-[10px] font-sans">Genesis Block</span>
          <span className="text-xs font-bold text-slate-200">
            Block #0 Valid
          </span>
          <span className="text-emerald-400 text-[11px] block font-sans">Prev Hash: "0"</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400 block uppercase text-[10px] font-sans">Cryptographic Algo</span>
          <span className="text-xs font-bold text-slate-200">
            SHA-256
          </span>
          <span className="text-slate-400 text-[11px] block font-sans">256-bit hash digest</span>
        </div>
      </div>

      {/* Main Explorer Grid: Left Chain Timeline, Right Selected Block Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Visual Block Chain List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Blockchain Sequence ({filteredBlocks.length} Blocks)
            </h2>
            <span className="text-[11px] text-slate-400 font-mono-hash">
              Click block to inspect
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search by ID, name, or hash..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono-hash"
            />
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredBlocks.map((block, idx) => {
              const isSelected = selectedBlock?.index === block.index;
              const isGenesis = block.index === 0;
              const isRevoked = block.transaction_type === "CERTIFICATE_REVOKED";

              return (
                <div key={block.index} className="relative">
                  {/* Connector arrow between blocks */}
                  {idx > 0 && (
                    <div className="flex justify-center -my-1 text-slate-700">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    onClick={() => setSelectedBlock(block)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-950/40"
                        : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono-hash font-bold ${
                            isGenesis
                              ? "bg-purple-950/80 text-purple-300 border border-purple-800"
                              : isRevoked
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                              : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                          }`}
                        >
                          BLOCK #{block.index}
                        </span>
                        <span className="text-xs font-semibold text-white truncate max-w-[150px]">
                          {isGenesis ? "GENESIS BLOCK" : block.certificate_id}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono-hash">
                        {block.timestamp.split(" ")[0]}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 truncate">
                      {isGenesis ? (
                        <span className="italic text-purple-300 text-[11px]">Experience Certificate Protocol Initialized</span>
                      ) : (
                        <span>
                          {block.employee_name} • {block.job_role} ({block.employer})
                        </span>
                      )}
                    </div>

                    {/* Hash Line */}
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono-hash text-slate-400">
                      <span className="truncate max-w-[220px]">
                        Hash: <span className="text-slate-300">{block.hash.substring(0, 16)}...</span>
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        {isSelected ? "Active" : "Inspect"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Block Details Inspector (7 cols) */}
        <div className="lg:col-span-7">
          {selectedBlock ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold font-display text-white">
                      Block #{selectedBlock.index} Details
                    </h3>
                    <span
                      className={`text-[10px] font-mono-hash px-2 py-0.5 rounded font-semibold ${
                        selectedBlock.index === 0
                          ? "bg-purple-950 text-purple-300 border border-purple-800"
                          : selectedBlock.transaction_type === "CERTIFICATE_REVOKED"
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {selectedBlock.transaction_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Mined & timestamped on {selectedBlock.timestamp}
                  </p>
                </div>

                {selectedBlock.index === 0 && onNavigateToGenesis && (
                  <button
                    onClick={onNavigateToGenesis}
                    className="text-xs text-purple-400 hover:text-purple-300 underline font-medium cursor-pointer"
                  >
                    Genesis Deep Dive →
                  </button>
                )}
              </div>

              {/* Cryptographic Hash Inspector */}
              <div className="space-y-4 font-mono-hash text-xs">
                {/* Current Hash */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-sans font-semibold">
                      <Hash className="w-3.5 h-3.5" />
                      Current Block Hash (SHA-256):
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedBlock.hash, "curr")}
                      className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedHash === "curr" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash === "curr" ? "Copied" : "Copy Hash"}</span>
                    </button>
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-emerald-300 break-all text-[11px] select-all">
                    {selectedBlock.hash}
                  </div>
                </div>

                {/* Previous Hash */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-sans font-semibold">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Previous Block Hash (Parent Link):
                    </span>
                    {selectedBlock.previous_hash !== "0" && (
                      <button
                        onClick={() => copyToClipboard(selectedBlock.previous_hash, "prev")}
                        className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedHash === "prev" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHash === "prev" ? "Copied" : "Copy Hash"}</span>
                      </button>
                    )}
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-slate-300 break-all text-[11px] select-all">
                    {selectedBlock.previous_hash === "0" ? (
                      <span className="text-purple-300 font-bold">
                        0 (Genesis Block Root - No Prior Parent)
                      </span>
                    ) : (
                      selectedBlock.previous_hash
                    )}
                  </div>
                </div>
              </div>

              {/* Transaction & Certificate Payload */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block font-sans">
                  Block Payload & Metadata
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono-hash">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Transaction ID</span>
                    <span className="text-slate-200">{selectedBlock.transaction_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Certificate ID</span>
                    <span className="text-emerald-400 font-bold">{selectedBlock.certificate_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Employee Name</span>
                    <span className="text-slate-200 font-sans">{selectedBlock.employee_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Employee ID</span>
                    <span className="text-slate-200">{selectedBlock.employee_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Organization</span>
                    <span className="text-slate-200 font-sans">{selectedBlock.employer}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Job Role</span>
                    <span className="text-slate-200 font-sans">{selectedBlock.job_role}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Experience Duration</span>
                    <span className="text-slate-200 font-sans">{selectedBlock.experience_duration}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Tenure Range</span>
                    <span className="text-slate-300 text-[11px]">
                      {selectedBlock.employment_start_date} → {selectedBlock.employment_end_date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Educational Explanation Box */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>How Block Linkage Works</span>
                </div>
                <p className="leading-relaxed text-slate-400">
                  Block #{selectedBlock.index} stores the hash of Block #{Math.max(0, selectedBlock.index - 1)} as its <code className="font-mono-hash text-emerald-300">previous_hash</code>. Any attempt to modify data in this block will change its SHA-256 hash, causing all subsequent blocks to fail verification.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
              Select a block from the chain sequence to inspect its full cryptographic ledger entry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
