/**
 * VERICERT - TypeScript Type Definitions
 */

export interface Block {
  index: number;
  timestamp: string;
  transaction_id: string;
  transaction_type: "GENESIS" | "CERTIFICATE_ISSUED" | "CERTIFICATE_REVOKED";
  certificate_id: string;
  employee_id: string;
  employee_name: string;
  employer: string;
  job_role: string;
  employment_start_date: string;
  employment_end_date: string;
  experience_duration: string;
  issue_date: string;
  department: string;
  employment_type: string;
  certificate_status: "Active" | "Revoked";
  reason?: string;
  previous_hash: string;
  hash: string;
}

export interface Certificate {
  certificate_id: string;
  employee_id: string;
  employee_name: string;
  employer: string;
  job_role: string;
  employment_start_date: string;
  employment_end_date: string;
  experience_duration: string;
  issue_date: string;
  department: string;
  employment_type: string;
  certificate_status: "Active" | "Revoked";
  reason?: string;
  previous_hash?: string;
  hash?: string;
  index?: number;
  transaction_id?: string;
}

export interface VerificationStep {
  step: number;
  name: string;
  status: "pending" | "running" | "success" | "failed";
  detail: string;
}

export interface VerificationResult {
  found: boolean;
  message?: string;
  certificate_id?: string;
  employee_id?: string;
  employee_name?: string;
  employer?: string;
  job_role?: string;
  experience_duration?: string;
  employment_start_date?: string;
  employment_end_date?: string;
  issue_date?: string;
  department?: string;
  employment_type?: string;
  certificate_status?: "Active" | "Revoked";
  block_index?: number;
  transaction_id?: string;
  transaction_type?: string;
  stored_hash?: string;
  recalculated_hash?: string;
  previous_hash?: string;
  hash_matched?: boolean;
  blockchain_status?: "VALID" | "INVALID";
  record_status?: "AUTHENTIC" | "TAMPERED_OR_CORRUPT";
  is_revoked?: boolean;
  reason?: string;
  steps: VerificationStep[];
}

export interface Stats {
  total_certificates: number;
  active_certificates: number;
  valid_certificates?: number;
  revoked_certificates: number;
  total_blocks: number;
  chain_height: number;
  chain_integrity: string;
  is_valid: boolean;
  latest_hash: string;
  latest_block_index: number;
  total_verifications: number;
  verified_percentage?: number;
}

export interface ActivityEvent {
  id: string;
  type: string;
  description: string;
  reference_id?: string;
  timestamp: string;
  block_index?: number;
  transaction_id?: string;
}

export type ActivityItem = ActivityEvent;

export interface VerificationLogItem {
  id: string;
  certificate_id: string;
  employee_name: string;
  verifier_type: string;
  timestamp: string;
  result: "VALID" | "REVOKED" | "TAMPERED";
  hash_matched: boolean;
}

export interface OrganizationProfile {
  name: string;
  total_certificates: number;
  certificates_issued?: number;
  active_certificates: number;
  revoked_certificates: number;
  active_employees?: number;
  industry?: string;
  established?: string;
  verifier_id?: string;
  blockchain_address?: string;
  latest_certificate_id?: string;
  latest_issue_date?: string;
  certificates: Block[];
}

export interface ChainValidationResult {
  valid: boolean;
  message: string;
  total_blocks?: number;
  latest_hash?: string;
  error_block?: number;
  stored_hash?: string;
  recalculated_hash?: string;
  expected_previous_hash?: string;
  found_previous_hash?: string;
}

export interface TamperSimulationResult {
  success: boolean;
  message: string;
  tampered_block_index: number;
  certificate_id: string;
  field: string;
  original_value: string;
  modified_value: string;
  stored_hash: string;
  recalculated_hash: string;
  hash_mismatch: boolean;
  chain_validation: ChainValidationResult;
}
