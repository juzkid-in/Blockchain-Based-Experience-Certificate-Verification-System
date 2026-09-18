import React, { useState, useEffect } from "react";
import {
  Layers,
  ShieldCheck,
  Hash,
  Copy,
  Check,
  ArrowDown,
  Info,
  Clock,
  Key,
  BookOpen,
  Sparkles
} from "lucide-react";
import { Block } from "../types";
import { fetchBlockByIndex, fetchBlockchain } from "../lib/api";

export const GenesisBlockView: React.FC = () => {
  const [genesisBlock, setGenesisBlock] = useState<Block | null>(null);
  const [blockOne, setBlockOne] = useState<Block | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [recalculatedHash, setRecalculatedHash] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockchain()
      .then((res) => {
        if (res.chain && res.chain.length > 0) {
          setGenesisBlock(res.chain[0]);
          if (res.chain.length > 1) {
            setBlockOne(res.chain[1]);
          }
        }
      })
      .catch((err) => console.error("Genesis fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  const copyHash = () => {
    if (genesisBlock?.hash) {
      navigator.clipboard.writeText(genesisBlock.hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          The Root of Trust
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-white">
          THE GENESIS BLOCK
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          The Genesis Block is Block 0—the primordial foundation of the VERICERT ledger. Every subsequent experience certificate is cryptographically anchored to this root.
        </p>
      </div>

      {/* Prominent Genesis Block Display Card */}
      {genesisBlock ? (
        <div className="relative overflow-hidden rounded-3xl border-2 border-purple-500/40 bg-gradient-to-b from-slate-900 via-slate-900/90 to-purple-950/20 p-8 sm:p-10 shadow-2xl shadow-purple-950/30">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-purple-400">
                  BLOCK INDEX: 0
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                  GENESIS BLOCK
                </h2>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-950/60 border border-purple-800 text-xs font-mono-hash text-purple-300">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Immutable Protocol Genesis</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
            <div className="space-y-4 text-xs font-mono-hash">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans uppercase text-[10px] block">Block Index</span>
                <span className="text-lg font-bold text-white">0</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans uppercase text-[10px] block">Previous Hash</span>
                <div className="text-purple-300 font-bold text-sm">
                  0
                </div>
                <p className="text-[11px] text-slate-400 font-sans pt-1">
                  "The Genesis Block is the first block in the blockchain. Since there is no previous block, its previous hash is initialized to 0."
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans uppercase text-[10px] block">Timestamp</span>
                <span className="text-slate-200">{genesisBlock.timestamp}</span>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono-hash">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans uppercase text-[10px] block">Initialization Payload / Data</span>
                <span className="text-emerald-300 font-semibold text-sm">
                  "{genesisBlock.job_role || genesisBlock.reason || "Experience Certificate Blockchain Initialized"}"
                </span>
                <p className="text-[11px] text-slate-400 font-sans pt-1">
                  Root transaction type: <code className="text-purple-300">{genesisBlock.transaction_type}</code>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-sans uppercase text-[10px]">Calculated SHA-256 Hash</span>
                  <button
                    onClick={copyHash}
                    className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHash ? "Copied" : "Copy Hash"}</span>
                  </button>
                </div>
                <div className="p-2 rounded bg-slate-900 text-purple-300 break-all text-[11px] select-all">
                  {genesisBlock.hash}
                </div>
                <p className="text-[10px] text-slate-400 font-sans pt-1">
                  Dynamically generated using Python <code className="text-slate-300">hashlib.sha256()</code> based on initial block parameters.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-sans uppercase text-[10px] block">Protocol Authority</span>
                <span className="text-slate-200">{genesisBlock.employer}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-3xl border border-slate-800">
          Loading Genesis Block details...
        </div>
      )}

      {/* Interactive Cryptographic Linkage Diagram */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
          <BookOpen className="w-4 h-4" />
          Interactive Visual Chain Linkage
        </div>

        <div className="space-y-4 max-w-xl mx-auto py-2">
          {/* Box 1: Genesis */}
          <div className="p-4 rounded-2xl bg-purple-950/30 border-2 border-purple-500/40 text-center space-y-1">
            <span className="text-[11px] uppercase font-bold text-purple-400 block tracking-wider">
              GENESIS BLOCK (Block 0)
            </span>
            <p className="text-xs font-mono-hash text-slate-300">
              Previous Hash = <span className="font-bold text-white">0</span>
            </p>
            <p className="text-[11px] font-mono-hash text-purple-300 truncate">
              Hash: {genesisBlock?.hash.substring(0, 24)}...
            </p>
          </div>

          <div className="flex flex-col items-center justify-center text-emerald-400">
            <ArrowDown className="w-5 h-5 animate-bounce" />
            <span className="text-[10px] font-mono-hash uppercase text-slate-400">
              Parent Hash Linked
            </span>
          </div>

          {/* Box 2: Certificate Block 1 */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/40 text-center space-y-1">
            <span className="text-[11px] uppercase font-bold text-emerald-400 block tracking-wider">
              FIRST CERTIFICATE (Block 1)
            </span>
            <p className="text-xs font-mono-hash text-slate-300">
              Previous Hash = <span className="text-purple-300 font-bold">Genesis Hash</span>
            </p>
            <p className="text-[11px] font-mono-hash text-emerald-300 truncate">
              {blockOne ? `Hash: ${blockOne.hash.substring(0, 24)}...` : "Waiting for Certificate #1"}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center text-emerald-400">
            <ArrowDown className="w-5 h-5" />
            <span className="text-[10px] font-mono-hash uppercase text-slate-400">
              Chain Perpetuates
            </span>
          </div>

          {/* Box 3: Subsequent Certificate Blocks */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
              SUBSEQUENT CERTIFICATE BLOCKS (Block N)
            </span>
            <p className="text-xs font-mono-hash text-slate-300">
              Previous Hash = <span className="text-emerald-400 font-bold">Block N-1 Hash</span>
            </p>
          </div>
        </div>
      </div>

      {/* Educational Deep Dive Q&A Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            What is a Genesis Block?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The Genesis Block is the very first block in any blockchain network. It represents the genesis or origin event of the ledger. Without a Genesis Block, no chain of cryptographically linked blocks could ever begin.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Why is it the first block?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every block in a blockchain requires a pointer to its predecessor (`previous_hash`). Because there are no blocks existing before the start of the system, Block #0 is created as the universal ground truth that anchors all future states.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-400" />
            Why is Previous Hash = "0"?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Since there is no previous block to link to, the `previous_hash` field cannot reference an existing hash. By convention across computer science and blockchain protocols, this value is explicitly initialized to "0" (or a string of zeroes).
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            How are certificate blocks connected to it?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            When the first employee experience certificate is issued, Block #1 takes Block #0's SHA-256 hash as its `previous_hash`. Then Block #2 takes Block #1's hash. This creates an unbroken, tamper-evident lineage tracing directly back to the Genesis Block.
          </p>
        </div>
      </div>
    </div>
  );
};
