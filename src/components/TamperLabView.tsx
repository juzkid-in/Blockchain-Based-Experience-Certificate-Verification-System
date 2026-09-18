import React, { useState, useEffect } from "react";
import {
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Hash,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  XCircle,
  FileWarning
} from "lucide-react";
import { Certificate, TamperSimulationResult } from "../types";
import { fetchCertificates, simulateTamper, restoreTamper } from "../lib/api";

interface TamperLabViewProps {
  initialCertificateId?: string;
  onNavigateToVerify: (certId: string) => void;
}

export const TamperLabView: React.FC<TamperLabViewProps> = ({
  initialCertificateId,
  onNavigateToVerify,
}) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertId, setSelectedCertId] = useState<string>(initialCertificateId || "");
  const [tamperField, setTamperField] = useState<string>("employer");
  const [tamperValue, setTamperValue] = useState<string>("Fake Organization");
  const [simulationResult, setSimulationResult] = useState<TamperSimulationResult | null>(null);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [restoredMessage, setRestoredMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates()
      .then((data) => {
        setCertificates(data);
        if (!selectedCertId && data.length > 0) {
          setSelectedCertId(data[0].certificate_id);
        }
      })
      .catch((err) => console.error("Failed to load certificates:", err));
  }, []);

  const selectedCert = certificates.find((c) => c.certificate_id === selectedCertId);

  const handleSimulateTamper = async () => {
    if (!selectedCertId) return;
    setLoading(true);
    setRestoredMessage(null);
    try {
      const res = await simulateTamper(selectedCertId, tamperField, tamperValue);
      setSimulationResult(res);
      setIsTampered(true);
    } catch (err: any) {
      console.error("Tamper simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreRecord = async () => {
    setLoading(true);
    try {
      const res = await restoreTamper();
      if (res.success) {
        setIsTampered(false);
        setSimulationResult(null);
        setRestoredMessage("✓ RECORD RESTORED: Blockchain hash recalculated and verified internally consistent.");
        // Refresh certificates
        const fresh = await fetchCertificates();
        setCertificates(fresh);
      }
    } catch (err: any) {
      console.error("Restore error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <FlaskConical className="w-4 h-4" />
          Interactive Cryptographic Playground
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white">
          TAMPER DETECTION LAB
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Demonstrate why blockchain is tamper-evident. Alter any certificate property and watch the SHA-256 cryptographic digest instantly deviate from the stored hash, alerting the entire network.
        </p>
      </div>

      {/* Lab Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Configuration & Simulation Controls (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold font-display text-white">
              1. Select Experience Certificate
            </h2>
            <p className="text-xs text-slate-400">
              Pick a verified certificate from the ledger to conduct the experiment.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Certificate Record
            </label>
            <select
              value={selectedCertId}
              onChange={(e) => {
                setSelectedCertId(e.target.value);
                setSimulationResult(null);
                setIsTampered(false);
                setRestoredMessage(null);
              }}
              disabled={isTampered}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono-hash text-xs focus:border-rose-500 focus:outline-none"
            >
              {certificates.map((c) => (
                <option key={c.certificate_id} value={c.certificate_id}>
                  {c.certificate_id} — {c.employee_name} ({c.employer})
                </option>
              ))}
            </select>
          </div>

          {/* Original Verified Data Card */}
          {selectedCert && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block font-sans">
                Original Verified Blockchain Record:
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Employee Name:</span>
                  <span className="font-semibold">{selectedCert.employee_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Role:</span>
                  <span className="font-semibold">{selectedCert.job_role}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px]">Organization:</span>
                  <span className="font-semibold text-white">{selectedCert.employer}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/80 font-mono-hash text-[11px] truncate text-slate-400">
                Stored Hash: <span className="text-slate-300">{selectedCert.hash?.substring(0, 20)}...</span>
              </div>
            </div>
          )}

          {/* Tamper Parameters */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-sm font-bold font-display text-white">
              2. Inject Controlled Data Modification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Field
                </label>
                <select
                  value={tamperField}
                  onChange={(e) => {
                    setTamperField(e.target.value);
                    if (e.target.value === "employer") setTamperValue("Fake Organization");
                    else if (e.target.value === "job_role") setTamperValue("Chief Executive Officer");
                    else if (e.target.value === "employee_name") setTamperValue("Impostor Name");
                    else setTamperValue("10 Years 0 Months");
                  }}
                  disabled={isTampered}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-rose-500 focus:outline-none"
                >
                  <option value="employer">Organization Name</option>
                  <option value="job_role">Job Designation</option>
                  <option value="employee_name">Employee Name</option>
                  <option value="experience_duration">Experience Duration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Fraudulent Value
                </label>
                <input
                  type="text"
                  value={tamperValue}
                  onChange={(e) => setTamperValue(e.target.value)}
                  disabled={isTampered}
                  placeholder="e.g. Fake Organization"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-rose-300 text-xs focus:border-rose-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              {!isTampered ? (
                <button
                  id="simulate-tamper-btn"
                  type="button"
                  onClick={handleSimulateTamper}
                  disabled={loading || !selectedCertId}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer disabled:opacity-50"
                >
                  <FileWarning className="w-4 h-4" />
                  <span>Simulate Tampering</span>
                </button>
              ) : (
                <button
                  id="restore-record-btn"
                  type="button"
                  onClick={handleRestoreRecord}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore Original Record</span>
                </button>
              )}
            </div>

            {restoredMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{restoredMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cryptographic Detection Visualizer (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {isTampered && simulationResult ? (
            <div className="bg-slate-900/90 border-2 border-rose-500/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-rose-950/40 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-display text-white">
                    ⚠ TAMPERING DETECTED!
                  </h3>
                  <p className="text-xs text-rose-300">
                    Certificate data no longer matches its stored blockchain hash.
                  </p>
                </div>
              </div>

              {/* Mismatch Inspection Grid */}
              <div className="space-y-3 font-mono-hash text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans uppercase text-[10px] block">
                    Affected Block & Certificate
                  </span>
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-bold text-white">Block #{simulationResult.tampered_block_index}</span>
                    <span className="text-rose-400">{simulationResult.certificate_id}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-400 font-sans uppercase text-[10px] block">
                    Modified Data Field
                  </span>
                  <div className="text-slate-200 text-xs">
                    <span className="text-slate-400">Field: </span>
                    <span className="font-semibold text-white">{simulationResult.field}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] pt-1">
                    <span className="line-through text-slate-400">{simulationResult.original_value}</span>
                    <ArrowRight className="w-3 h-3 text-rose-400" />
                    <span className="text-rose-300 font-bold">{simulationResult.modified_value}</span>
                  </div>
                </div>

                {/* Hash Comparison */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-sans uppercase text-[10px] block">
                    Stored Hash in Ledger (Original)
                  </span>
                  <div className="p-2 rounded bg-slate-900 text-emerald-400 break-all text-[11px]">
                    {simulationResult.stored_hash}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/50 space-y-1.5">
                  <span className="text-rose-300 font-sans uppercase text-[10px] block font-bold">
                    Recalculated SHA-256 Hash (Tampered)
                  </span>
                  <div className="p-2 rounded bg-slate-950 text-rose-400 break-all text-[11px] font-bold">
                    {simulationResult.recalculated_hash}
                  </div>
                  <div className="text-[11px] text-rose-300 font-sans pt-1">
                    ≠ Hashes do not match! The cryptographic proof is broken.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateToVerify(simulationResult.certificate_id)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <span>See How Verifier Rejects This Certificate →</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-white">
                Ledger in Pristine State
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                All blocks currently pass 100% cryptographic validation. Use the simulation panel on the left to inject a controlled tampering experiment and observe how the hash verification instantly fails.
              </p>
            </div>
          )}

          {/* Educational Note */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
              <Info className="w-4 h-4" />
              Why Blockchain Prevents Fraud
            </div>
            <p className="leading-relaxed text-slate-400">
              Because the SHA-256 algorithm is a one-way deterministic function, even changing a single comma or letter in the employee's role completely scrambles the output hash (known as the avalanche effect). Since the next block has already stored the original hash, the fraud cannot be concealed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
