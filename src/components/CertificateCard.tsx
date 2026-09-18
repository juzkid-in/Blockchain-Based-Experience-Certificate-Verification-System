import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { ShieldCheck, ShieldAlert, Award, Copy, Check, Hash, Calendar, Building2, User, Printer } from "lucide-react";
import { Certificate, Block } from "../types";

interface CertificateCardProps {
  data: Certificate | Block;
  isTampered?: boolean;
  showPrintAction?: boolean;
  onSelectOrg?: (orgName: string) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  data,
  isTampered = false,
  showPrintAction = true,
  onSelectOrg,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    const certId = data.certificate_id || "EC-2026-000";
    const verifyPayload = JSON.stringify({
      id: certId,
      emp: data.employee_name,
      org: data.employer,
      role: data.job_role,
      hash: data.hash ? data.hash.substring(0, 16) : "VERIFIED",
      verification_url: `${window.location.origin}/?verify=${encodeURIComponent(certId)}`
    });

    QRCode.toDataURL(verifyPayload, {
      width: 140,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch((err) => console.error("QR Code generation error:", err));
  }, [data]);

  const copyHashToClipboard = () => {
    if (data.hash) {
      navigator.clipboard.writeText(data.hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isRevoked = data.certificate_status === "Revoked";

  return (
    <div className="relative group max-w-2xl mx-auto w-full">
      {/* Certificate Frame */}
      <div
        id="printable-certificate"
        className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-8 sm:p-10 shadow-2xl backdrop-blur-md ${
          isTampered
            ? "bg-rose-950/20 border-rose-500/60 shadow-rose-950/50"
            : isRevoked
            ? "bg-amber-950/20 border-amber-500/60 shadow-amber-950/50"
            : "bg-slate-900/90 border-emerald-500/40 shadow-emerald-950/30"
        }`}
      >
        {/* Subtle Guilloche / Watermark Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Certificate Golden/Emerald Trim Line */}
        <div className="absolute top-2 left-2 right-2 bottom-2 border border-slate-700/60 rounded-xl pointer-events-none" />
        <div className="absolute top-3 left-3 right-3 bottom-3 border border-emerald-500/20 rounded-lg pointer-events-none" />

        {/* Status Banner if Revoked or Tampered */}
        {isTampered && (
          <div className="absolute top-4 right-4 bg-rose-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            TAMPER DETECTED
          </div>
        )}
        {isRevoked && !isTampered && (
          <div className="absolute top-4 right-4 bg-amber-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <ShieldAlert className="w-3.5 h-3.5" />
            REVOKED RECORD
          </div>
        )}

        {/* Header */}
        <div className="text-center relative z-10 space-y-1 mb-6">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold tracking-wider text-xs uppercase mb-1">
            <Award className="w-4 h-4" />
            VERICERT VERIFIED RECORD
          </div>
          <h2 className="text-2xl sm:text-3xl font-certificate font-bold tracking-wider text-slate-100 uppercase">
            Experience Certificate
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono-hash text-slate-300">
            <span>ID:</span>
            <span className="font-semibold text-emerald-300">{data.certificate_id}</span>
          </div>
        </div>

        {/* Main Body */}
        <div className="text-center relative z-10 space-y-5 my-6">
          <p className="text-xs sm:text-sm uppercase tracking-widest text-slate-400">
            This is to certify that
          </p>

          <div className="py-1">
            <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white uppercase border-b border-slate-700/60 inline-block pb-1 px-4">
              {data.employee_name}
            </h3>
            <p className="text-xs text-slate-400 font-mono-hash mt-1">
              Employee ID: {data.employee_id} • {data.department || "Core Division"}
            </p>
          </div>

          <p className="text-xs sm:text-sm uppercase tracking-widest text-slate-400">
            has successfully served as
          </p>

          <div>
            <h4 className="text-lg sm:text-xl font-semibold text-emerald-300 font-display uppercase tracking-wide">
              {data.job_role}
            </h4>
            <p className="text-xs text-slate-400">({data.employment_type || "Full Time"})</p>
          </div>

          <p className="text-xs sm:text-sm uppercase tracking-widest text-slate-400">
            at
          </p>

          <div>
            <button
              onClick={() => onSelectOrg && onSelectOrg(data.employer)}
              className="text-lg sm:text-xl font-bold font-display text-white tracking-wide hover:text-emerald-400 transition-colors uppercase cursor-pointer"
            >
              {data.employer}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2 text-left bg-slate-950/50 p-3 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Duration</span>
              <span className="text-xs font-semibold text-slate-200">{data.experience_duration}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Period</span>
              <span className="text-xs text-slate-300 font-mono-hash">
                {data.employment_start_date} → {data.employment_end_date}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with QR & Seal */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          {/* QR Code */}
          <div className="flex items-center gap-3">
            {qrDataUrl ? (
              <div className="p-1.5 bg-white rounded-lg shadow-md">
                <img src={qrDataUrl} alt="Verification QR" className="w-20 h-20" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-slate-800 rounded-lg animate-pulse" />
            )}
            <div className="text-left space-y-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                Instant Verification
              </span>
              <p className="text-[11px] text-slate-300 max-w-[140px] leading-tight">
                Scan QR or lookup ID on VERICERT Ledger.
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Blockchain Verified ✓</span>
              </div>
            </div>
          </div>

          {/* Issue Date & Seal */}
          <div className="text-right space-y-1 sm:self-end">
            <div className="text-[11px] text-slate-400">
              <span>Issued On: </span>
              <span className="font-semibold text-slate-200">{data.issue_date}</span>
            </div>
            {data.index !== undefined && (
              <div className="text-[11px] text-slate-400">
                <span>Block Height: </span>
                <span className="font-mono-hash text-emerald-400 font-semibold">#{data.index}</span>
              </div>
            )}
            <div className="pt-2">
              <span className="inline-block border-t border-slate-700 pt-1 text-[10px] uppercase tracking-wider text-slate-400">
                Authorized Ledger Stamp
              </span>
            </div>
          </div>
        </div>

        {/* Cryptographic Monospace Hash Stamp */}
        {data.hash && (
          <div className="mt-6 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono-hash gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Hash className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="text-slate-400 shrink-0">SHA-256:</span>
              <span className="truncate text-slate-300 hover:text-white" title={data.hash}>
                {data.hash}
              </span>
            </div>
            <button
              onClick={copyHashToClipboard}
              className="p-1 hover:text-emerald-400 text-slate-400 transition-colors shrink-0 cursor-pointer"
              title="Copy Full Hash"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      {showPrintAction && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 shadow transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save Certificate PDF
          </button>
        </div>
      )}
    </div>
  );
};
