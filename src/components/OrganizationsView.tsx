import React, { useState, useEffect } from "react";
import {
  Building2,
  ShieldCheck,
  Award,
  Hash,
  Users,
  ExternalLink,
  Briefcase,
  FileCheck,
  Calendar,
  Layers
} from "lucide-react";
import { OrganizationProfile, Certificate } from "../types";
import { fetchOrganizations, fetchCertificates } from "../lib/api";

interface OrganizationsViewProps {
  onNavigateToVerify: (certId: string) => void;
  onNavigateToExplorer: (blockIndex: number) => void;
}

export const OrganizationsView: React.FC<OrganizationsViewProps> = ({
  onNavigateToVerify,
  onNavigateToExplorer,
}) => {
  const [orgs, setOrgs] = useState<OrganizationProfile[]>([]);
  const [selectedOrgName, setSelectedOrgName] = useState<string>("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchOrganizations(), fetchCertificates()])
      .then(([orgData, certData]) => {
        setOrgs(orgData);
        setCertificates(certData);
        if (orgData.length > 0) {
          setSelectedOrgName(orgData[0].name);
        }
      })
      .catch((err) => console.error("Error loading organizations:", err))
      .finally(() => setLoading(false));
  }, []);

  const currentOrg = orgs.find((o) => o.name === selectedOrgName);
  const orgCertificates = certificates.filter((c) => c.employer === selectedOrgName);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Building2 className="w-4 h-4" />
          Enterprise Network
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Authorized Organizations
        </h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Accredited corporate authorities permitted to sign and mint experience certificates onto the VERICERT cryptographic ledger.
        </p>
      </div>

      {/* Organization Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {orgs.map((org) => {
          const active = org.name === selectedOrgName;
          return (
            <button
              key={org.name}
              onClick={() => setSelectedOrgName(org.name)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                active
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                  : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800"
              }`}
            >
              <Building2 className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-slate-500"}`} />
              <span>{org.name}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                {org.certificates_issued}
              </span>
            </button>
          );
        })}
      </div>

      {currentOrg && (
        <div className="space-y-8">
          {/* Organization Profile Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold font-display text-white">
                      {currentOrg.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700">
                      Verified Node
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono-hash">
                    {currentOrg.industry} • Established {currentOrg.established}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono-hash text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                <span className="text-slate-500">Node ID:</span>
                <span className="text-emerald-400 font-bold">{currentOrg.verifier_id}</span>
              </div>
            </div>

            {/* Profile Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] block font-sans">Certificates Issued</span>
                <span className="text-xl font-bold text-white font-mono-hash">{currentOrg.certificates_issued}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] block font-sans">Active Employees</span>
                <span className="text-xl font-bold text-emerald-400 font-mono-hash">{currentOrg.active_employees}</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] block font-sans">Verification Authority</span>
                <span className="text-xs font-semibold text-slate-200 block">Accredited Employer</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 uppercase text-[10px] block font-sans">Cryptographic Node Status</span>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online & Active
                </span>
              </div>
            </div>

            {/* Blockchain Address */}
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono-hash flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-slate-400 font-sans">Blockchain Wallet / Signing Key:</span>
              <span className="text-slate-300 break-all">{currentOrg.blockchain_address}</span>
            </div>
          </div>

          {/* List of Certificates Issued by this Organization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-display text-white">
                Certificates Issued by {currentOrg.name} ({orgCertificates.length})
              </h3>
            </div>

            {orgCertificates.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800 text-xs">
                No experience certificates issued yet by this organization in current session.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orgCertificates.map((cert) => (
                  <div
                    key={cert.certificate_id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono-hash text-emerald-400">
                          {cert.certificate_id}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono-hash">
                          {cert.employee_id}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{cert.employee_name}</h4>
                      <p className="text-xs text-slate-400">
                        {cert.job_role} • {cert.experience_duration}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigateToVerify(cert.certificate_id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Verify
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
