import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  User,
  Briefcase,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Building2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Blocks,
  Hash,
  Clock,
  AlertCircle
} from "lucide-react";
import { issueCertificate, fetchBlockchain } from "../lib/api";
import { Certificate, Block } from "../types";
import { CertificateCard } from "./CertificateCard";

interface IssueCertificateViewProps {
  onSuccess: (newBlock: Block) => void;
  onNavigateToVerify: (certId: string) => void;
  onNavigateToExplorer: (blockIndex: number) => void;
}

export const IssueCertificateView: React.FC<IssueCertificateViewProps> = ({
  onSuccess,
  onNavigateToVerify,
  onNavigateToExplorer,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [previousBlock, setPreviousBlock] = useState<Block | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Certificate>>({
    certificate_id: `EC-2026-${Math.floor(100 + Math.random() * 900)}`,
    employee_id: `EMP${Math.floor(100 + Math.random() * 900)}`,
    employee_name: "",
    employer: "",
    job_role: "",
    employment_start_date: "",
    employment_end_date: "",
    experience_duration: "",
    issue_date: new Date().toISOString().split("T")[0],
    department: "Engineering",
    employment_type: "Full Time",
    certificate_status: "Active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [committing, setCommitting] = useState(false);
  const [committedBlock, setCommittedBlock] = useState<Block | null>(null);

  // Fetch previous block to display blockchain linkage
  useEffect(() => {
    fetchBlockchain()
      .then((res) => {
        if (res.chain && res.chain.length > 0) {
          setPreviousBlock(res.chain[res.chain.length - 1]);
        }
      })
      .catch((err) => console.error("Could not fetch latest block:", err));
  }, []);

  // Auto calculate duration from start and end dates
  useEffect(() => {
    if (formData.employment_start_date && formData.employment_end_date) {
      const start = new Date(formData.employment_start_date);
      const end = new Date(formData.employment_end_date);

      if (end >= start) {
        let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        if (end.getDate() < start.getDate()) {
          months = Math.max(0, months - 1);
        }
        const years = Math.floor(months / 12);
        const remMonths = months % 12;

        let durationStr = "";
        if (years > 0 && remMonths > 0) {
          durationStr = `${years} Year${years > 1 ? "s" : ""} ${remMonths} Month${remMonths > 1 ? "s" : ""}`;
        } else if (years > 0) {
          durationStr = `${years} Year${years > 1 ? "s" : ""}`;
        } else {
          durationStr = `${remMonths} Month${remMonths > 1 ? "s" : ""}`;
        }

        setFormData((prev) => ({ ...prev, experience_duration: durationStr }));
      }
    }
  }, [formData.employment_start_date, formData.employment_end_date]);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.certificate_id?.trim()) errs.certificate_id = "Certificate ID is required.";
    if (!formData.employee_id?.trim()) errs.employee_id = "Employee ID is required.";
    if (!formData.employee_name?.trim()) errs.employee_name = "Employee name is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.employer?.trim()) errs.employer = "Organization/Employer name is required.";
    if (!formData.job_role?.trim()) errs.job_role = "Job role is required.";
    if (!formData.employment_start_date) errs.employment_start_date = "Start date is required.";
    if (!formData.employment_end_date) errs.employment_end_date = "End date is required.";

    if (formData.employment_start_date && formData.employment_end_date) {
      if (new Date(formData.employment_end_date) < new Date(formData.employment_start_date)) {
        errs.employment_end_date = "End date cannot be prior to start date.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3) setCurrentStep(4);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  const handleCommit = async () => {
    if (!validateStep1() || !validateStep2()) {
      setCurrentStep(1);
      return;
    }

    setCommitting(true);
    setErrors({});

    try {
      const res = await issueCertificate(formData);
      setCommittedBlock(res.block);
      onSuccess(res.block);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#10b981", "#3b82f6", "#14b8a6"]
      });
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to commit certificate to blockchain." });
    } finally {
      setCommitting(false);
    }
  };

  const presetFictionalData = () => {
    setFormData({
      certificate_id: `EC-2026-${Math.floor(200 + Math.random() * 700)}`,
      employee_id: `EMP${Math.floor(200 + Math.random() * 700)}`,
      employee_name: "Eleanor Vance",
      employer: "AuraTech Global",
      job_role: "Principal Systems Architect",
      employment_start_date: "2021-03-01",
      employment_end_date: "2025-08-31",
      experience_duration: "4 Years 5 Months",
      issue_date: new Date().toISOString().split("T")[0],
      department: "Enterprise Cloud Infrastructure",
      employment_type: "Full Time",
      certificate_status: "Active",
    });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          Authorized Issuance Workflow
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
          Issue Experience Certificate
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Generate an immutable employee experience credential cryptographically hashed and linked to the VERICERT ledger.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={presetFictionalData}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium cursor-pointer"
          >
            Auto-fill with sample demonstration employee data
          </button>
        </div>
      </div>

      {/* Multi-step progress tracker */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div className="grid grid-cols-4 gap-2 text-xs">
          {[
            { step: 1, title: "Employee Details", icon: User },
            { step: 2, title: "Employment Info", icon: Briefcase },
            { step: 3, title: "Certificate Preview", icon: Eye },
            { step: 4, title: "Commit to Ledger", icon: Blocks },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = currentStep > s.step || committedBlock !== null;
            const isCurrent = currentStep === s.step && committedBlock === null;

            return (
              <div
                key={s.step}
                className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${
                  isCurrent
                    ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                    : isDone
                    ? "bg-slate-950/60 text-slate-300"
                    : "text-slate-400 opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent
                      ? "bg-emerald-500 text-slate-950"
                      : isDone
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isDone ? "✓" : s.step}
                </div>
                <div className="hidden sm:block truncate font-medium">
                  {s.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-2xl shadow-xl relative">
        {committedBlock ? (
          /* Confirmation State */
          <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">
                Certificate Committed to Blockchain
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Block <span className="font-mono-hash font-bold text-emerald-400">#{committedBlock.index}</span> has been permanently mined and appended to the ledger.
              </p>
            </div>

            {/* Block Receipt */}
            <div className="max-w-lg mx-auto bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-left font-mono-hash text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="text-slate-200">{committedBlock.transaction_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Certificate ID:</span>
                <span className="text-emerald-400 font-bold">{committedBlock.certificate_id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Block Number:</span>
                <span className="text-slate-200">#{committedBlock.index}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Previous Hash:</span>
                <span className="text-slate-400 truncate max-w-[200px]" title={committedBlock.previous_hash}>
                  {committedBlock.previous_hash}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block">SHA-256 Hash:</span>
                <div className="p-2 rounded bg-slate-900 text-emerald-300 break-all text-[11px] select-all">
                  {committedBlock.hash}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onNavigateToVerify(committedBlock.certificate_id)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Test Verification Now
              </button>
              <button
                onClick={() => onNavigateToExplorer(committedBlock.index)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Blocks className="w-4 h-4" />
                Inspect in Blockchain Explorer
              </button>
              <button
                onClick={() => {
                  setCommittedBlock(null);
                  setCurrentStep(1);
                  presetFictionalData();
                }}
                className="px-5 py-2.5 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 text-xs font-semibold cursor-pointer"
              >
                Issue Another Certificate
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* STEP 1: Employee Details */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold font-display text-white">
                    Step 1: Employee Credentials & Registry Details
                  </h2>
                  <p className="text-xs text-slate-400">
                    Input identity credentials to be recorded in the certificate metadata.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Certificate ID *
                    </label>
                    <input
                      type="text"
                      value={formData.certificate_id}
                      onChange={(e) => setFormData({ ...formData, certificate_id: e.target.value })}
                      placeholder="e.g. EC-2026-006"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono-hash text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    {errors.certificate_id && <p className="text-[11px] text-rose-400 mt-1">{errors.certificate_id}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      placeholder="e.g. EMP006"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono-hash text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    {errors.employee_id && <p className="text-[11px] text-rose-400 mt-1">{errors.employee_id}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Employee Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.employee_name}
                      onChange={(e) => setFormData({ ...formData, employee_name: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    {errors.employee_name && <p className="text-[11px] text-rose-400 mt-1">{errors.employee_name}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Corporate Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Enterprise Cloud Infrastructure"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Employment Details */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold font-display text-white">
                    Step 2: Employment & Tenure Details
                  </h2>
                  <p className="text-xs text-slate-400">
                    Define organization, job designation, tenure span, and employment agreement type.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Employer / Organization *
                    </label>
                    <input
                      type="text"
                      value={formData.employer}
                      onChange={(e) => setFormData({ ...formData, employer: e.target.value })}
                      placeholder="e.g. AuraTech Global"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    {errors.employer && <p className="text-[11px] text-rose-400 mt-1">{errors.employer}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Job Role / Designation *
                    </label>
                    <input
                      type="text"
                      value={formData.job_role}
                      onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                      placeholder="e.g. Principal Systems Architect"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    {errors.job_role && <p className="text-[11px] text-rose-400 mt-1">{errors.job_role}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Employment Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.employment_start_date}
                      onChange={(e) => setFormData({ ...formData, employment_start_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    {errors.employment_start_date && <p className="text-[11px] text-rose-400 mt-1">{errors.employment_start_date}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Employment End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.employment_end_date}
                      onChange={(e) => setFormData({ ...formData, employment_end_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    />
                    {errors.employment_end_date && <p className="text-[11px] text-rose-400 mt-1">{errors.employment_end_date}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Calculated Duration
                    </label>
                    <input
                      type="text"
                      value={formData.experience_duration}
                      onChange={(e) => setFormData({ ...formData, experience_duration: e.target.value })}
                      placeholder="Auto-calculated (e.g. 3 Years 2 Months)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-semibold text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Employment Type
                    </label>
                    <select
                      value={formData.employment_type}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Certificate Preview */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold font-display text-white">
                    Step 3: Official Document Preview
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review the visual appearance and content before stamping into the cryptographic chain.
                  </p>
                </div>

                <div className="py-2">
                  <CertificateCard
                    data={formData as Certificate}
                    showPrintAction={false}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Commit to Blockchain */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-lg font-bold font-display text-white">
                    Step 4: Commit to Blockchain Ledger
                  </h2>
                  <p className="text-xs text-slate-400">
                    Verify block linkage parameters prior to generating SHA-256 hash.
                  </p>
                </div>

                <div className="bg-slate-950/80 p-5 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold text-emerald-400 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      CERTIFICATE READY
                    </span>
                    <span className="text-xs font-mono-hash text-slate-400">
                      Block Height Pending: #{(previousBlock?.index ?? 0) + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Certificate ID</span>
                      <span className="font-semibold text-white font-mono-hash">{formData.certificate_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Employee Name</span>
                      <span className="font-semibold text-white">{formData.employee_name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Organization</span>
                      <span className="font-semibold text-white">{formData.employer}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Role</span>
                      <span className="font-semibold text-white">{formData.job_role}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Experience</span>
                      <span className="font-semibold text-white">{formData.experience_duration}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Issue Date</span>
                      <span className="font-semibold text-white">{formData.issue_date}</span>
                    </div>
                  </div>

                  {/* Blockchain Linkage Preview */}
                  <div className="pt-3 border-t border-slate-800/80 font-mono-hash text-xs space-y-2">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Blocks className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Previous Block Hash (Parent):</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 text-slate-300 break-all text-[11px]">
                      {previousBlock?.hash || "Loading previous block..."}
                    </div>
                  </div>
                </div>

                {errors.form && (
                  <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.form}</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={committing}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={committing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-950/60 cursor-pointer disabled:opacity-50"
                >
                  {committing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Hashing & Committing Block...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Commit Certificate to Blockchain</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
