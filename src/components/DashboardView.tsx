import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Blocks,
  FileCheck,
  PlusCircle,
  FlaskConical,
  Award,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  CheckCircle2,
  Building2,
  Database
} from "lucide-react";
import { Stats, ActivityEvent, VerificationLogItem } from "../types";

interface DashboardViewProps {
  stats: Stats | null;
  activities: ActivityEvent[];
  verificationLogs: VerificationLogItem[];
  onNavigate: (tab: string, query?: string) => void;
  onLoadDemoData: () => void;
  loadingDemo: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  activities,
  verificationLogs,
  onNavigate,
  onLoadDemoData,
  loadingDemo,
}) => {
  const isChainValid = stats?.is_valid ?? true;

  const quickSamples = [
    { id: "EC-2026-001", name: "Alex Johnson", role: "Software Engineer", company: "TechNova Solutions" },
    { id: "EC-2026-002", name: "Priya Sharma", role: "Product Manager", company: "DigitalWorks Media" },
    { id: "EC-2026-003", name: "Arjun Rao", role: "DevOps Specialist", company: "CloudSphere Systems" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Blockchain-Anchored Credential Verification
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              VERICERT
            </h1>
            <p className="text-lg sm:text-xl text-emerald-400 font-medium">
              Verify experience. Trust the record.
            </p>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              An enterprise-grade, tamper-evident experience certificate verification system backed by an immutable SHA-256 blockchain and Genesis Block #0. Built for recruiters, authorized employers, and background check auditors.
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate("verify")}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Verify a Certificate</span>
            </button>

            <button
              onClick={() => onNavigate("issue")}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Issue New Credential</span>
            </button>

            <button
              onClick={() => onNavigate("tamper")}
              className="px-5 py-3 rounded-xl bg-rose-950/40 hover:bg-rose-950/70 text-rose-300 text-xs font-semibold flex items-center gap-2 border border-rose-500/30 transition-colors cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-rose-400" />
              <span>Tamper Detection Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-md">
          <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">
            Certificates Issued
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-white font-mono-hash">
              {stats?.total_certificates ?? 0}
            </span>
            <Award className="w-4 h-4 text-emerald-400 opacity-60" />
          </div>
          <span className="text-[11px] text-slate-500 block">Total minted</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-md">
          <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">
            Active Valid
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-emerald-400 font-mono-hash">
              {stats?.valid_certificates ?? 0}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-60" />
          </div>
          <span className="text-[11px] text-slate-500 block">In circulation</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-md">
          <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">
            Revoked Records
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-amber-400 font-mono-hash">
              {stats?.revoked_certificates ?? 0}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400 opacity-60" />
          </div>
          <span className="text-[11px] text-slate-500 block">Historical logs</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-md">
          <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">
            Ledger Blocks
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-white font-mono-hash">
              {stats?.total_blocks ?? 1}
            </span>
            <Blocks className="w-4 h-4 text-teal-400 opacity-60" />
          </div>
          <span className="text-[11px] text-slate-500 block">From Genesis #0</span>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-md">
          <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">
            Chain Integrity
          </span>
          <div className="flex items-baseline justify-between">
            <span
              className={`text-2xl font-bold font-display font-mono-hash ${
                isChainValid ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {stats?.chain_integrity ?? "100%"}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 opacity-60" />
          </div>
          <span className="text-[11px] text-slate-500 block">SHA-256 audit</span>
        </div>

        {/* Metric 6 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-md">
          <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider block">
            Verified Ratio
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-display text-emerald-400 font-mono-hash">
              {stats?.verified_percentage ?? 100}%
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400 opacity-60" />
          </div>
          <span className="text-[11px] text-slate-500 block">Authentic state</span>
        </div>
      </div>

      {/* Quick Verification Demo Showcase */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold font-display text-white">
              Quick Test Verification Records
            </h2>
            <p className="text-xs text-slate-400">
              Click any demonstration candidate to launch instant cryptographic verification:
            </p>
          </div>
          {stats?.total_certificates === 0 && (
            <button
              onClick={onLoadDemoData}
              disabled={loadingDemo}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {loadingDemo ? "Populating..." : "Seed 5 Demo Certificates"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickSamples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onNavigate("verify", sample.id)}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold font-mono-hash text-emerald-400 group-hover:text-emerald-300">
                  {sample.id}
                </span>
                <h3 className="text-sm font-semibold text-white">{sample.name}</h3>
                <p className="text-xs text-slate-400">
                  {sample.role} • {sample.company}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Live Activity Feed & Verification History Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Live Blockchain Activity Feed (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Live Blockchain Activity Feed
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono-hash">
              Real-time Ledger Events
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {activities.map((act) => {
              const isGenesis = act.type === "GENESIS_INITIALIZED";
              const isRevoked = act.type === "CERTIFICATE_REVOKED";

              return (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono-hash font-semibold ${
                        isGenesis
                          ? "bg-purple-950 text-purple-300 border border-purple-800"
                          : isRevoked
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      }`}
                    >
                      {act.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-hash">
                      {act.timestamp.split(" ")[0]}
                    </span>
                  </div>

                  <p className="text-slate-200 font-medium">{act.description}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-hash pt-1 border-t border-slate-900">
                    <span>Block #{act.block_index}</span>
                    <span className="truncate max-w-[180px]">TX: {act.transaction_id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Verification History Log (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Verification History Log
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-mono-hash">
              Auditor Queries
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {verificationLogs.map((log) => {
              const isValid = log.result === "VALID";
              const isRevoked = log.result === "REVOKED";

              return (
                <div
                  key={log.id}
                  onClick={() => onNavigate("verify", log.certificate_id)}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-hash font-bold text-emerald-400">
                      {log.certificate_id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        isValid
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : isRevoked
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {log.result}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>{log.employee_name}</span>
                    <span className="text-slate-500 text-[11px]">{log.verifier_type}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono-hash text-slate-500 pt-1 border-t border-slate-900">
                    <span>{log.timestamp}</span>
                    <span className={log.hash_matched ? "text-emerald-400" : "text-rose-400"}>
                      Hash: {log.hash_matched ? "MATCHED" : "MISMATCH"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
