import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  X,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCw,
  Award,
  Layers
} from "lucide-react";
import { Certificate, Block } from "../types";
import { fetchCertificates, revokeCertificate } from "../lib/api";
import { CertificateCard } from "./CertificateCard";

interface CertificatesListViewProps {
  onNavigateToVerify: (certId: string) => void;
  onNavigateToExplorer: (blockIndex: number) => void;
}

export const CertificatesListView: React.FC<CertificatesListViewProps> = ({
  onNavigateToVerify,
  onNavigateToExplorer,
}) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Revoked">("All");

  // Record details modal
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  // Revocation modal
  const [revokingCert, setRevokingCert] = useState<Certificate | null>(null);
  const [revocationReason, setRevocationReason] = useState("Corporate record updated / Employment agreement concluded");
  const [revoking, setRevoking] = useState(false);

  // Experience timeline modal
  const [timelineCert, setTimelineCert] = useState<Certificate | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCertificates();
      setCertificates(data);
    } catch (err) {
      console.error("Error loading certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRevokeSubmit = async () => {
    if (!revokingCert) return;
    setRevoking(true);
    try {
      await revokeCertificate(revokingCert.certificate_id, revocationReason);
      setRevokingCert(null);
      await loadData();
    } catch (err) {
      console.error("Failed to revoke:", err);
    } finally {
      setRevoking(false);
    }
  };

  const filteredCerts = certificates.filter((c) => {
    // Status filter
    if (statusFilter !== "All" && c.certificate_status !== statusFilter) {
      return false;
    }

    // Search query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.certificate_id.toLowerCase().includes(q) ||
      c.employee_id.toLowerCase().includes(q) ||
      c.employee_name.toLowerCase().includes(q) ||
      c.employer.toLowerCase().includes(q) ||
      c.job_role.toLowerCase().includes(q) ||
      (c.department && c.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <History className="w-4 h-4" />
            Registry Archive
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
            Certificate History & Search
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Audit-ready database of all minted experience credentials. Search, inspect ledger records, and manage lifecycle events.
          </p>
        </div>

        <button
          onClick={loadData}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Refresh Registry
        </button>
      </div>

      {/* Global Search & Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Certificate ID, Employee ID, Name, Organization, Role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(["All", "Active", "Revoked"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-emerald-500 text-slate-950 font-semibold"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading certificate registry...</div>
      ) : filteredCerts.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800">
          No experience certificates found matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => {
            const isRevoked = cert.certificate_status === "Revoked";

            return (
              <div
                key={cert.certificate_id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-hash font-bold text-xs text-emerald-400">
                      {cert.certificate_id}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${
                        isRevoked
                          ? "bg-amber-950/80 text-amber-300 border-amber-700"
                          : "bg-emerald-950/80 text-emerald-300 border-emerald-700"
                      }`}
                    >
                      {cert.certificate_status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold font-display text-white">
                      {cert.employee_name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono-hash">
                      {cert.employee_id} • {cert.job_role}
                    </p>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-white font-medium">{cert.employer}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{cert.experience_duration} ({cert.employment_start_date} → {cert.employment_end_date})</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="text-xs text-slate-300 hover:text-emerald-400 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Record</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTimelineCert(cert)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                      title="View Experience Timeline"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onNavigateToVerify(cert.certificate_id)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
                    >
                      Verify
                    </button>

                    {!isRevoked && (
                      <button
                        onClick={() => setRevokingCert(cert)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950 text-slate-400 hover:text-amber-300 text-xs"
                        title="Revoke Certificate"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certificate Details Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative max-w-3xl w-full my-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                Verified Experience Certificate
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <CertificateCard data={selectedCert} />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  const id = selectedCert.certificate_id;
                  setSelectedCert(null);
                  onNavigateToVerify(id);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Run Dynamic Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Certificate Modal */}
      {revokingCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Revoke Certificate
                </h3>
                <p className="text-xs text-slate-400 font-mono-hash">
                  {revokingCert.certificate_id} — {revokingCert.employee_name}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
              <p>
                <strong>Blockchain Immutability Notice:</strong>
              </p>
              <p className="text-slate-400">
                Revoking this certificate will <em>not</em> delete the previous issuance block. Instead, a new blockchain block with transaction type <code className="text-amber-300 font-mono-hash">CERTIFICATE_REVOKED</code> will be permanently appended, updating the public registry while preserving historical integrity.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Revocation Reason / Note
              </label>
              <input
                type="text"
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="Reason for revocation..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRevokingCert(null)}
                disabled={revoking}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevokeSubmit}
                disabled={revoking}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {revoking ? "Committing Revocation..." : "Confirm Revocation Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Experience Timeline Modal */}
      {timelineCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Employee Experience Timeline
              </div>
              <button
                onClick={() => setTimelineCert(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold font-display text-white">
                {timelineCert.employee_name}
              </h3>
              <p className="text-xs text-slate-400 font-mono-hash">
                ID: {timelineCert.employee_id} • {timelineCert.employer}
              </p>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 space-y-6 border-l-2 border-slate-800 text-xs">
              {/* Event 1: Joined */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" />
                <div className="font-mono-hash text-emerald-400 text-[11px] font-semibold">
                  {timelineCert.employment_start_date}
                </div>
                <div className="font-bold text-white text-sm">
                  Joined {timelineCert.employer}
                </div>
                <div className="text-slate-400">
                  Role: Junior / Associate in {timelineCert.department || "Engineering"}
                </div>
              </div>

              {/* Event 2: Mid-tenure promotion */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-500 border-2 border-slate-900" />
                <div className="font-mono-hash text-teal-400 text-[11px] font-semibold">
                  Career Progression
                </div>
                <div className="font-bold text-white text-sm">
                  Role Updated: {timelineCert.job_role}
                </div>
                <div className="text-slate-400">
                  Promoted based on performance & domain excellence
                </div>
              </div>

              {/* Event 3: Employment Completed */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900" />
                <div className="font-mono-hash text-blue-400 text-[11px] font-semibold">
                  {timelineCert.employment_end_date}
                </div>
                <div className="font-bold text-white text-sm">
                  Employment Completed
                </div>
                <div className="text-slate-400">
                  Total Tenure: {timelineCert.experience_duration}
                </div>
              </div>

              {/* Event 4: Blockchain Certificate Issued */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-slate-900 animate-pulse" />
                <div className="font-mono-hash text-purple-400 text-[11px] font-semibold">
                  {timelineCert.issue_date}
                </div>
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>Experience Certificate Minted</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-slate-400 font-mono-hash text-[11px]">
                  Certificate ID: {timelineCert.certificate_id}
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono-hash text-slate-400 mt-1 truncate">
                  TX: {timelineCert.transaction_id || "TX-VERICERT-COMMITTED"}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setTimelineCert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
