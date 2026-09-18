import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Hash,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RotateCw
} from "lucide-react";
import { VerificationResult, VerificationStep } from "../types";
import { verifyCertificateRecord } from "../lib/api";
import { CertificateCard } from "./CertificateCard";

interface VerifyCertificateViewProps {
  initialQuery?: string;
  onNavigateToExplorer?: (blockIndex?: number) => void;
  onNavigateToTamper?: (certificateId?: string) => void;
}

export const VerifyCertificateView: React.FC<VerifyCertificateViewProps> = ({
  initialQuery = "",
  onNavigateToExplorer,
  onNavigateToTamper,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [verifying, setVerifying] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const sampleQueries = [
    { id: "EC-2026-001", label: "Alex Johnson (TechNova)" },
    { id: "EC-2026-002", label: "Priya Sharma (DigitalWorks)" },
    { id: "EC-2026-003", label: "Arjun Rao (CloudSphere)" },
    { id: "EMP005", label: "EMP005 (Kiran Kumar)" },
  ];

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleVerify(initialQuery);
    }
  }, [initialQuery]);

  const handleVerify = async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) {
      setError("Please enter a valid Certificate ID, Employee ID, or Transaction ID.");
      return;
    }

    setError(null);
    setResult(null);
    setVerifying(true);
    setActiveStepIndex(0);

    try {
      // Fetch verification from Python blockchain backend
      const res = await verifyCertificateRecord(q);

      // Simulate sequential step animation for visual presentation
      for (let i = 0; i < 5; i++) {
        setActiveStepIndex(i);
        await new Promise((r) => setTimeout(r, 380));
      }

      setResult(res);

      if (res.found && res.hash_matched && !res.is_revoked && res.blockchain_status === "VALID") {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#059669"]
        });
      }
    } catch (err: any) {
      setError(err.message || "Verification request failed");
    } finally {
      setVerifying(false);
      setActiveStepIndex(5);
    }
  };

  const copyHash = (hashText: string) => {
    navigator.clipboard.writeText(hashText);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const stepsList = [
    { num: 1, title: "Finding Certificate", desc: "Querying SQLite distributed registry" },
    { num: 2, title: "Retrieving Blockchain Record", desc: "Locating corresponding Block in ledger" },
    { num: 3, title: "Recalculating SHA-256 Hash", desc: "Dynamic cryptographic hashing of block payload" },
    { num: 4, title: "Comparing Stored Hash", desc: "Validating block hash against cryptographic digest" },
    { num: 5, title: "Verification Complete", desc: "Auditing chain continuity to Genesis Block" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Tamper-Evident Protocol
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white">
          Verify Experience Certificate
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Authenticate credentials instantly. The VERICERT engine queries the immutable blockchain ledger, recalculates the SHA-256 block digest in real-time, and validates chain continuity.
        </p>
      </div>

      {/* Verification Input Box */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-4 relative z-10"
        >
          <label htmlFor="verify-search-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Enter Certificate ID, Employee ID, or Transaction ID
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                id="verify-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. EC-2026-001 or EMP001"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 font-mono-hash text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                disabled={verifying}
              />
            </div>
            <button
              id="verify-submit-btn"
              type="submit"
              disabled={verifying || !query.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50 cursor-pointer"
            >
              {verifying ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Ledger...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Certificate</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Search Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Test:</span>
            {sampleQueries.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setQuery(s.id);
                  handleVerify(s.id);
                }}
                className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 font-mono-hash hover:text-white transition-colors cursor-pointer"
              >
                {s.id} <span className="text-slate-400 text-[10px]">({s.label.split("(")[0]})</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Animated 5-Step Verification Process Bar */}
      {(verifying || result) && (
        <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              5-Step Cryptographic Verification Pipeline
            </span>
            <span className="font-mono-hash text-emerald-400">
              {verifying ? `Running Step ${Math.min(activeStepIndex + 1, 5)} of 5` : "Complete"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {stepsList.map((step, idx) => {
              const isCurrent = verifying && activeStepIndex === idx;
              const isPast = activeStepIndex > idx || (!verifying && result);
              const isSuccess = result?.found && result.hash_matched;
              const isFailedStep = !verifying && result && !result.hash_matched && idx >= 3;

              return (
                <div
                  key={step.num}
                  className={`p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/40 animate-pulse"
                      : isPast
                      ? isFailedStep
                        ? "bg-rose-950/30 border-rose-500/50"
                        : "bg-slate-950/60 border-slate-800"
                      : "bg-slate-950/30 border-slate-800/40 opacity-40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {isCurrent ? (
                      <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    ) : isPast ? (
                      isFailedStep ? (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      )
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-600 text-[10px] flex items-center justify-center text-slate-400">
                        {step.num}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-200">
                      Step {step.num}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-300 leading-tight">
                    {step.title}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verification Result Section */}
      {result && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Result Banner */}
          <div
            className={`p-6 sm:p-8 rounded-2xl border-2 shadow-2xl relative overflow-hidden ${
              result.found && result.hash_matched && !result.is_revoked
                ? "bg-emerald-950/20 border-emerald-500/50 shadow-emerald-950/30"
                : result.is_revoked
                ? "bg-amber-950/20 border-amber-500/60 shadow-amber-950/40"
                : "bg-rose-950/30 border-rose-500/60 shadow-rose-950/50"
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  {result.found && result.hash_matched && !result.is_revoked ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                      {result.found && result.hash_matched && !result.is_revoked
                        ? "✓ CERTIFICATE VERIFIED"
                        : result.is_revoked
                        ? "⚠ CERTIFICATE REVOKED"
                        : "⚠ VERIFICATION FAILED"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      {result.found && result.hash_matched && !result.is_revoked
                        ? "Certificate information is consistent with its blockchain record."
                        : result.is_revoked
                        ? `This certificate was revoked on the blockchain: ${result.reason || "Revoked by employer"}. Historical block preserved.`
                        : "Certificate integrity could not be confirmed. Record data differs from stored cryptographic hash."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Pills */}
              <div className="flex flex-wrap items-center gap-2 font-mono-hash text-xs">
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700">
                  <span className="text-slate-400">Blockchain: </span>
                  <span className={result.blockchain_status === "VALID" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {result.blockchain_status || "INVALID"}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700">
                  <span className="text-slate-400">Hash Status: </span>
                  <span className={result.hash_matched ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {result.hash_matched ? "MATCHED" : "MISMATCH"}
                  </span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700">
                  <span className="text-slate-400">Record: </span>
                  <span className={result.record_status === "AUTHENTIC" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                    {result.record_status || "UNCONFIRMED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cryptographic Comparison Inspection Box */}
            {result.found && (
              <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-3 font-mono-hash text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block mb-1 uppercase font-sans">
                      Stored Block Hash (On Blockchain)
                    </span>
                    <div className="flex items-center justify-between text-slate-200 break-all text-[11px]">
                      <span>{result.stored_hash}</span>
                      <button
                        onClick={() => copyHash(result.stored_hash || "")}
                        className="ml-2 p-1 text-slate-400 hover:text-white"
                        title="Copy Stored Hash"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block mb-1 uppercase font-sans">
                      Recalculated SHA-256 Hash
                    </span>
                    <div className={`text-[11px] break-all ${result.hash_matched ? "text-emerald-400" : "text-rose-400 font-bold"}`}>
                      <span>{result.recalculated_hash}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-slate-400 text-[11px] pt-1">
                  <span>Block Height: #{result.block_index}</span>
                  <span>Transaction ID: {result.transaction_id}</span>
                  <span>Previous Hash: {result.previous_hash?.substring(0, 16)}...</span>
                  {onNavigateToExplorer && result.block_index !== undefined && (
                    <button
                      onClick={() => onNavigateToExplorer(result.block_index)}
                      className="text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-sans"
                    >
                      <span>Inspect in Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Certificate Preview Card */}
          {result.found && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                  Verified Certificate Document
                </h3>
                {onNavigateToTamper && (
                  <button
                    onClick={() => onNavigateToTamper(result.certificate_id)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-medium underline cursor-pointer"
                  >
                    Test Tamper Detection on this Certificate →
                  </button>
                )}
              </div>

              <CertificateCard
                data={{
                  certificate_id: result.certificate_id || "",
                  employee_id: result.employee_id || "",
                  employee_name: result.employee_name || "",
                  employer: result.employer || "",
                  job_role: result.job_role || "",
                  employment_start_date: result.employment_start_date || "",
                  employment_end_date: result.employment_end_date || "",
                  experience_duration: result.experience_duration || "",
                  issue_date: result.issue_date || "",
                  department: result.department || "",
                  employment_type: result.employment_type || "",
                  certificate_status: result.certificate_status || "Active",
                  hash: result.stored_hash || "",
                  index: result.block_index,
                  transaction_id: result.transaction_id,
                }}
                isTampered={!result.hash_matched}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
