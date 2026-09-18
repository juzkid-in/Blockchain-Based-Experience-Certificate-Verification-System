import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Blocks,
  FileCheck,
  PlusCircle,
  FlaskConical,
  History,
  Building2,
  Info,
  Menu,
  X,
  Sparkles,
  Layers,
  Database
} from "lucide-react";
import { Stats } from "../types";

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  stats: Stats | null;
  onLoadDemoData: () => void;
  loadingDemo: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  stats,
  onLoadDemoData,
  loadingDemo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const navLinks = [
    { id: "dashboard", label: "Dashboard", icon: Blocks },
    { id: "verify", label: "Verify Certificate", icon: FileCheck },
    { id: "issue", label: "Issue Certificate", icon: PlusCircle },
    { id: "history", label: "Certificate History", icon: History },
    { id: "explorer", label: "Blockchain Explorer", icon: Database },
    { id: "genesis", label: "The Genesis", icon: Layers },
    { id: "tamper", label: "Tamper Lab", icon: FlaskConical },
    { id: "organizations", label: "Organizations", icon: Building2 },
    { id: "architecture", label: "Architecture", icon: Info },
  ];

  const handleNavClick = (id: string) => {
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  const isChainValid = stats ? stats.is_valid : true;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Brand Logo & Tagline */}
            <div
              onClick={() => handleNavClick("dashboard")}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                    VERICERT
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    SHA-256
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                  Verify experience. Trust the record.
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Status & Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Live Chain Integrity Pill */}
              <button
                onClick={() => handleNavClick("explorer")}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-hash font-medium border transition-colors cursor-pointer ${
                  isChainValid
                    ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/60"
                    : "bg-rose-950/50 text-rose-300 border-rose-500/60 animate-pulse hover:bg-rose-950/70"
                }`}
                title={isChainValid ? "All blockchain blocks cryptographically verified" : "Blockchain integrity compromised"}
              >
                <span className={`w-2 h-2 rounded-full ${isChainValid ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                <span>Chain: {stats?.chain_integrity ?? "100%"}</span>
              </button>

              {/* Demo Data Button */}
              <button
                onClick={onLoadDemoData}
                disabled={loadingDemo}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                title="Load 5 fictional demonstration experience certificates"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{loadingDemo ? "Loading..." : "Load Demo Data"}</span>
              </button>

              {/* Disclaimer Info Trigger */}
              <button
                onClick={() => setShowDisclaimer(true)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Academic Disclaimer"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={onLoadDemoData}
                disabled={loadingDemo}
                className="px-2 py-1 rounded bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-700"
              >
                Demo Data
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Chain Integrity:</span>
              <span className={`font-mono-hash font-semibold ${isChainValid ? "text-emerald-400" : "text-rose-400"}`}>
                {stats?.chain_integrity ?? "100%"} ({stats?.total_blocks ?? 1} blocks)
              </span>
            </div>
          </div>
        )}
      </header>

      {/* Academic Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm uppercase tracking-wider">
                <ShieldCheck className="w-5 h-5" />
                VERICERT Protocol Prototype
              </div>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
              <p>
                <strong>Academic Prototype Notice:</strong>
              </p>
              <p>
                This is an academic prototype demonstrating blockchain concepts for experience certificate verification.
                It does not replace an official employer verification process and does not constitute legal certification.
              </p>
              <p className="text-slate-400 text-xs">
                All employer names, employee names, and certificate records generated within this demonstration environment are fictional data designed for technical simulation of SHA-256 cryptographic chain linkages and tamper detection.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowDisclaimer(false)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
