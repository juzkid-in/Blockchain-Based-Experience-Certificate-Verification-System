import React from "react";
import { ShieldCheck, Lock, Layers, Database } from "lucide-react";

interface FooterProps {
  onSelectTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand & Description */}
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-display font-extrabold text-base text-white tracking-tight">
                VERICERT
              </span>
              <span className="text-[10px] font-mono-hash text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded bg-emerald-500/10">
                GENESIS-LEDGER
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              "Verify experience. Trust the record." A tamper-evident credential verification platform anchoring employee tenure records onto a sequential cryptographic blockchain.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <button
              onClick={() => onSelectTab("dashboard")}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => onSelectTab("verify")}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Verify Certificate
            </button>
            <button
              onClick={() => onSelectTab("issue")}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Issue Credential
            </button>
            <button
              onClick={() => onSelectTab("explorer")}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Blockchain Explorer
            </button>
            <button
              onClick={() => onSelectTab("genesis")}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              The Genesis Block
            </button>
            <button
              onClick={() => onSelectTab("tamper")}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Tamper Lab
            </button>
            <button
              onClick={() => onSelectTab("architecture")}
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Architecture & Viva
            </button>
          </div>
        </div>

        {/* Mandatory Academic Disclaimer Banner */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2 max-w-2xl leading-relaxed">
            <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              <strong>Academic Prototype:</strong> This application is an educational and conceptual demonstration of blockchain-based experience certificate verification using SHA-256 hash chaining and a Genesis Block root. It does not replace an official employer verification process.
            </span>
          </div>

          <div className="font-mono-hash text-[11px] text-slate-400 shrink-0">
            Hash Protocol: SHA-256 • SQLite Ledger
          </div>
        </div>
      </div>
    </footer>
  );
};
