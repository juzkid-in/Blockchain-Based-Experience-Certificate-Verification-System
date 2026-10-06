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

/**
 * Robust JSON fetch helper that safely checks Content-Type before parsing,
 * ensuring non-JSON (like HTML gateway error pages) never triggers "Unexpected token <".
 */
async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err: any) {
    throw new Error(`Connection error to ${url}: ${err?.message || "Check network connectivity"}`);
  }

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    // Read text preview for logging/debugging without throwing syntax error on HTML
    const preview = await res.text().catch(() => "");
    const cleanPreview = preview.slice(0, 100).replace(/\s+/g, " ").trim();
    throw new Error(`Server returned non-JSON format (${res.status} ${res.statusText}): ${cleanPreview || contentType}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (err: any) {
    throw new Error(`Failed to parse JSON response from ${url}: ${err?.message}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed with HTTP status ${res.status}`);
  }

  return data as T;
}

export async function fetchStats(): Promise<Stats> {
  return requestJson<Stats>("/api/stats");
}

export async function fetchBlockchain(): Promise<{ total_blocks: number; chain: Block[]; validation: ChainValidationResult }> {
  return requestJson<{ total_blocks: number; chain: Block[]; validation: ChainValidationResult }>("/api/blockchain");
}

export async function fetchBlockByIndex(index: number): Promise<{ block: Block; recalculated_hash: string; hash_valid: boolean }> {
  return requestJson<{ block: Block; recalculated_hash: string; hash_valid: boolean }>(`/api/blockchain/${index}`);
}

export async function verifyEntireBlockchain(): Promise<ChainValidationResult> {
  return requestJson<ChainValidationResult>("/api/blockchain/verify", { method: "POST" });
}

export async function fetchCertificates(): Promise<Certificate[]> {
  return requestJson<Certificate[]>("/api/certificates");
}

export async function fetchCertificateDetails(id: string): Promise<{ certificate: Certificate; recalculated_hash: string; hash_matched: boolean }> {
  return requestJson<{ certificate: Certificate; recalculated_hash: string; hash_matched: boolean }>(`/api/certificates/${encodeURIComponent(id)}`);
}

export async function issueCertificate(data: Partial<Certificate>): Promise<{ success: boolean; message: string; block: Block }> {
  return requestJson<{ success: boolean; message: string; block: Block }>("/api/certificates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
}

export async function revokeCertificate(id: string, reason: string): Promise<{ success: boolean; message: string; block?: Block }> {
  return requestJson<{ success: boolean; message: string; block?: Block }>(`/api/certificates/${encodeURIComponent(id)}/revoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason })
  });
}

export async function verifyCertificateRecord(query: string): Promise<VerificationResult> {
  return requestJson<VerificationResult>("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
}

export async function simulateTamper(certificateId: string, field: string, modifiedValue: string): Promise<TamperSimulationResult> {
  return requestJson<TamperSimulationResult>("/api/tamper/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ certificate_id: certificateId, field, modified_value: modifiedValue })
  });
}

export async function restoreTamper(): Promise<{ success: boolean; message: string; restored_block: Block; chain_validation: ChainValidationResult }> {
  return requestJson<{ success: boolean; message: string; restored_block: Block; chain_validation: ChainValidationResult }>("/api/tamper/restore", { method: "POST" });
}

export async function loadDemoData(): Promise<{ success: boolean; message: string; created_blocks: Block[]; stats: Stats }> {
  return requestJson<{ success: boolean; message: string; created_blocks: Block[]; stats: Stats }>("/api/demo/load", { method: "POST" });
}

export async function fetchActivity(): Promise<ActivityItem[]> {
  try {
    return await requestJson<ActivityItem[]>("/api/activity");
  } catch (err) {
    console.warn("fetchActivity fallback:", err);
    return [];
  }
}

export async function fetchOrganizations(): Promise<OrganizationProfile[]> {
  try {
    return await requestJson<OrganizationProfile[]>("/api/organizations");
  } catch (err) {
    console.warn("fetchOrganizations fallback:", err);
    return [];
  }
}

export async function fetchVerificationHistory(): Promise<any[]> {
  try {
    return await requestJson<any[]>("/api/verification-history");
  } catch (err) {
    console.warn("fetchVerificationHistory fallback:", err);
    return [];
  }
}

// Aliases for convenience
export const seedDemoData = loadDemoData;
export const fetchActivities = fetchActivity;
export const fetchVerificationLogs = fetchVerificationHistory;
