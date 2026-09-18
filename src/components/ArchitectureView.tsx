import React, { useState } from "react";
import {
  Layers,
  ShieldCheck,
  Cpu,
  Database,
  Search,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  GitBranch,
  Lock,
  Building2,
  FileCheck
} from "lucide-react";

export const ArchitectureView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const workflowSteps = [
    {
      step: 1,
      title: "Employer Registers Experience Record",
      desc: "Authorized organization inputs verified tenure, job role, dates, and employee credentials.",
      icon: Building2,
      badge: "Input"
    },
    {
      step: 2,
      title: "Cryptographic Hash Generation",
      desc: "The payload fields are serialized into a deterministic string and digested using SHA-256.",
      icon: Lock,
      badge: "Hashing"
    },
    {
      step: 3,
      title: "Previous Block Hash Linkage",
      desc: "The new block captures the previous block's SHA-256 hash, forging an unbreakable parent-child link.",
      icon: GitBranch,
      badge: "Linkage"
    },
    {
      step: 4,
      title: "Committed to Blockchain Ledger",
      desc: "The mined block is stamped with UTC timestamp and appended to the persistent SQLite database.",
      icon: Database,
      badge: "Storage"
    },
    {
      step: 5,
      title: "Verifier Searches Certificate",
      desc: "Recruiter or auditor enters Certificate ID, Employee ID, or Transaction ID into the portal.",
      icon: Search,
      badge: "Query"
    },
    {
      step: 6,
      title: "Dynamic Hash Audit & Chain Verification",
      desc: "VERICERT reconstructs the payload, recalculates SHA-256 on the fly, and validates back to Block #0.",
      icon: ShieldCheck,
      badge: "Validation"
    },
  ];

  const comparisonData = [
    {
      feature: "Data Tampering Vulnerability",
      conventional: "Vulnerable: Any database admin or intruder can silently execute UPDATE without detection.",
      vericert: "Tamper-Evident: Any character change alters the SHA-256 hash, immediately breaking chain validation."
    },
    {
      feature: "Audit Trail & Provenance",
      conventional: "Fragile: Audit logs can be dropped, truncated, or disabled without invalidating the application.",
      vericert: "Cryptographic Integrity: Each block explicitly stores previous_hash, creating an unalterable chronological sequence."
    },
    {
      feature: "Trust Model",
      conventional: "Centralized Trust: Requires trusting the database server administrator not to manipulate records.",
      vericert: "Mathematical Trust: Zero trust required; mathematical verification of the SHA-256 digest guarantees authenticity."
    },
    {
      feature: "Verification Velocity",
      conventional: "Manual & Slow: Requires days or weeks of manual HR background emails and phone calls.",
      vericert: "Sub-Second: Verifiers recalculate the ledger proof in milliseconds with zero administrative friction."
    },
    {
      feature: "Lifecycle & Revocation",
      conventional: "Destructive Delete: Invalidated credentials are deleted from the table, erasing history.",
      vericert: "Non-Destructive: Revocations are minted as new blocks, preserving immutable historical lineage."
    }
  ];

  const vivaQuestions = [
    {
      q: "1. Why does the system use a Genesis Block?",
      a: "Every block in a blockchain requires a pointer to its predecessor via `previous_hash`. Because no block exists prior to system initialization, Block #0 (Genesis Block) is created as the primordial root. Its `previous_hash` is explicitly set to '0', establishing the definitive reference point that grounds all subsequent certificates."
    },
    {
      q: "2. How does the SHA-256 algorithm guarantee tamper evidence?",
      a: "SHA-256 is a deterministic one-way cryptographic hash function that exhibits the 'avalanche effect'. If even a single byte in the employee name or tenure date is altered, the resulting 256-bit hexadecimal digest changes drastically and unpredictably. When the verification engine recalculates the hash from the record data, it immediately detects the mismatch against the stored block hash."
    },
    {
      q: "3. What happens if an adversary edits the database rows directly?",
      a: "If an attacker modifies a row directly in the database (e.g., updating the employer or role), their modified record will produce a different hash upon recalculation. If they also attempt to update that block's hash, the NEXT block in the chain (which stored the original hash as its `previous_hash`) will now point to a broken parent link. Tampering with one block invalidates every subsequent block in the chain."
    },
    {
      q: "4. Why not just use a conventional SQL database with timestamps?",
      a: "In conventional SQL databases, records can be updated with `UPDATE certificates SET role = ...` with zero mathematical evidence that an alteration took place. Even with audit tables, administrators have the privilege to modify the logs. Blockchain introduces algorithmic mathematical immutability where data validity is self-proving."
    },
    {
      q: "5. How is certificate revocation handled without violating blockchain immutability?",
      a: "In an immutable ledger, records are never deleted. When an employer revokes an experience certificate, VERICERT mints a new block with `transaction_type: CERTIFICATE_REVOKED` that references the certificate ID and states the reason. The verifier inspects both the original issuance block and the revocation block, accurately reflecting current status while preserving full historical transparency."
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          Technical Specifications
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          System Architecture & Viva Guide
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">
          Comprehensive blueprint of the cryptographic verification pipeline, comparative analysis, and academic defense documentation.
        </p>
      </div>

      {/* Visual Pipeline Diagram */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold font-display text-white">
              End-to-End Cryptographic Pipeline
            </h2>
            <p className="text-xs text-slate-400">
              Flow of data from issuance to real-time verification
            </p>
          </div>
          <span className="text-xs font-mono-hash text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-800">
            SHA-256 + SQLite Ledger
          </span>
        </div>

        {/* Pipeline Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-emerald-400">Phase 1: Ingestion</span>
            <h3 className="text-sm font-bold text-white">Authorized HR Issuance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Employer specifies employee ID, full name, tenure, role, and department via authenticated form interface.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-teal-400">Phase 2: Cryptographic Sealing</span>
            <h3 className="text-sm font-bold text-white">SHA-256 Digesting & Chaining</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Python engine serializes block data with parent block hash, producing an immutable 64-character SHA-256 signature.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase text-blue-400">Phase 3: Public Verification</span>
            <h3 className="text-sm font-bold text-white">5-Stage Integrity Audit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verifiers query the ledger; the system dynamically recalculates the hash and checks continuity back to Genesis Block 0.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">
            How It Works: 6-Step Workflow
          </h2>
          <p className="text-xs text-slate-400">
            Step-by-step lifecycle of an immutable experience credential
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono-hash">
                    {step.step}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-white">
            Conventional Database vs. VERICERT Blockchain
          </h2>
          <p className="text-xs text-slate-400">
            Why cryptographic blockchain architecture is required for tamper-evident experience credentials
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-300 uppercase tracking-wider border-b border-slate-800 font-semibold">
              <tr>
                <th className="p-4 w-1/4">Evaluation Dimension</th>
                <th className="p-4 w-3/8 text-slate-400">Conventional SQL / NoSQL Database</th>
                <th className="p-4 w-3/8 text-emerald-400">VERICERT Blockchain Architecture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 font-semibold text-white">
                    {row.feature}
                  </td>
                  <td className="p-4 text-slate-400 leading-relaxed">
                    {row.conventional}
                  </td>
                  <td className="p-4 text-emerald-300 font-medium leading-relaxed bg-emerald-950/10">
                    {row.vericert}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viva / Academic Presentation FAQ */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-emerald-400" />
            Viva / Project Presentation Defense Guide
          </h2>
          <p className="text-xs text-slate-400">
            Core theoretical questions, cryptographic explanations, and technical justifications
          </p>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm text-white hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 bg-slate-950/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
