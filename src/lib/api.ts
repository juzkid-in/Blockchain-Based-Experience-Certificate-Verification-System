/**
 * VERICERT - API Client
 * Interacts with Python Blockchain Engine via proxy.
 */

import {
  Block,
  Certificate,
  Stats,
  ActivityItem,
  OrganizationProfile,
  VerificationResult,
  ChainValidationResult,
  TamperSimulationResult
} from "../types";

export async function fetchStats(): Promise<Stats> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to load statistics");
  return res.json();
}

export async function fetchBlockchain(): Promise<{ total_blocks: number; chain: Block[]; validation: ChainValidationResult }> {
  const res = await fetch("/api/blockchain");
  if (!res.ok) throw new Error("Failed to load blockchain ledger");
  return res.json();
}

export async function fetchBlockByIndex(index: number): Promise<{ block: Block; recalculated_hash: string; hash_valid: boolean }> {
  const res = await fetch(`/api/blockchain/${index}`);
  if (!res.ok) throw new Error(`Failed to load block #${index}`);
  return res.json();
}

export async function verifyEntireBlockchain(): Promise<ChainValidationResult> {
  const res = await fetch("/api/blockchain/verify", { method: "POST" });
  if (!res.ok) throw new Error("Failed to execute blockchain verification");
  return res.json();
}

export async function fetchCertificates(): Promise<Certificate[]> {
  const res = await fetch("/api/certificates");
  if (!res.ok) throw new Error("Failed to fetch certificates");
  return res.json();
}

export async function fetchCertificateDetails(id: string): Promise<{ certificate: Certificate; recalculated_hash: string; hash_matched: boolean }> {
  const res = await fetch(`/api/certificates/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error("Failed to fetch certificate");
  return res.json();
}

export async function issueCertificate(data: Partial<Certificate>): Promise<{ success: boolean; message: string; block: Block }> {
  const res = await fetch("/api/certificates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to commit certificate to blockchain");
  return json;
}

export async function revokeCertificate(id: string, reason: string): Promise<{ success: boolean; message: string; block?: Block }> {
  const res = await fetch(`/api/certificates/${encodeURIComponent(id)}/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || json.error || "Failed to revoke certificate");
  return json;
}

export async function verifyCertificateRecord(query: string): Promise<VerificationResult> {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Verification request failed");
  return json;
}

export async function simulateTamper(certificateId: string, field: string, modifiedValue: string): Promise<TamperSimulationResult> {
  const res = await fetch("/api/tamper/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ certificate_id: certificateId, field, modified_value: modifiedValue })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to simulate tampering");
  return json;
}

export async function restoreTamper(): Promise<{ success: boolean; message: string; restored_block: Block; chain_validation: ChainValidationResult }> {
  const res = await fetch("/api/tamper/restore", { method: "POST" });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to restore record");
  return json;
}

export async function loadDemoData(): Promise<{ success: boolean; message: string; created_blocks: Block[]; stats: Stats }> {
  const res = await fetch("/api/demo/load", { method: "POST" });
  const json = await res.json();
  if (!res.ok) throw new Error("Failed to load demo data");
  return json;
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  const res = await fetch("/api/activity");
  if (!res.ok) throw new Error("Failed to fetch activity feed");
  return res.json();
}

export async function fetchOrganizations(): Promise<OrganizationProfile[]> {
  const res = await fetch("/api/organizations");
  if (!res.ok) throw new Error("Failed to fetch organizations");
  return res.json();
}

export async function fetchVerificationHistory(): Promise<any[]> {
  const res = await fetch("/api/verification-history");
  if (!res.ok) return [];
  return res.json();
}

// Aliases for convenience
export const seedDemoData = loadDemoData;
export const fetchActivities = fetchActivity;
export const fetchVerificationLogs = fetchVerificationHistory;
