# VERICERT — Experience Certificate Verification System

> **"Verify experience. Trust the record."**

VERICERT is an enterprise-grade, blockchain-based Experience Certificate Verification System engineered to create an immutable, tamper-evident record of employee experience credentials anchored by a primordial **Genesis Block (Block #0)**.

---

## 🏛️ Core Architectural Overview

```
 ┌────────────────────────────────────────────────────────┐
 │                   VERICERT FRONTEND                    │
 │         React 19 + TypeScript + Vite + Tailwind        │
 └──────────────────────────┬─────────────────────────────┘
                            │ /api/* Proxy
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │                     EXPRESS SERVER                     │
 │          Node.js TypeScript Proxy & Static Host        │
 └──────────────────────────┬─────────────────────────────┘
                            │ HTTP JSON IPC
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │              PYTHON BLOCKCHAIN ENGINE                  │
 │   hashlib (SHA-256) + Genesis Block + Chain Validator  │
 └──────────────────────────┬─────────────────────────────┘
                            │
                            ▼
 ┌────────────────────────────────────────────────────────┐
 │               SQLITE PERSISTENT LEDGER                 │
 │            vericert.db (WAL Mode Storage)              │
 └────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Capabilities

1. **Genesis Block (#0) Foundation**:
   - The chain begins with Block 0 where `previous_hash = "0"`.
   - All subsequent certificates cryptographically point to their parent block hash, guaranteeing an unbroken audit lineage.

2. **Real SHA-256 Cryptographic Digesting**:
   - Blocks are serialized and digested in real-time via Python's standard `hashlib.sha256()`.
   - Hashes are never hardcoded or mocked.

3. **5-Step Verification Experience**:
   - Step 1: Query Certificate in Ledger
   - Step 2: Retrieve Corresponding Block
   - Step 3: Recalculate SHA-256 Digest from Record Data
   - Step 4: Compare Stored Hash with Recalculated Hash
   - Step 5: Audit Chain Continuity to Genesis Block

4. **Multi-Step Certificate Issuance Workflow**:
   - Step 1: Employee Details (Name, Employee ID, Department)
   - Step 2: Employment Details (Employer, Role, Start/End Dates, Tenure Calculation)
   - Step 3: Official Certificate Preview Card (with QR Code and Verification ID)
   - Step 4: Commit Block to Blockchain (Obtain Parent Hash & Compute SHA-256)

5. **Tamper Detection Lab**:
   - Interactive demonstration of blockchain integrity.
   - Allows users to simulate malicious tampering on any certificate field (e.g. changing Organization to "Fake Org").
   - Demonstrates the avalanche effect of SHA-256: stored hash immediately deviates from recalculated digest.
   - One-click restoration back to verified state.

6. **Non-Destructive Certificate Revocation**:
   - In keeping with blockchain immutability, revoking a certificate never deletes historical blocks.
   - A new block with transaction type `CERTIFICATE_REVOKED` is appended to the ledger, updating status while preserving the historical record.

7. **Blockchain Explorer & Timeline**:
   - Interactive sequential visualization of blocks from Genesis #0 to latest block.
   - One-click "Verify Entire Blockchain" audit with instantaneous mathematical proof.

8. **Enterprise Organization Profiles**:
   - Authorized employer view showing issued certificate quotas, node identifiers, and public signing keys.

---

## 🛡️ Academic Prototype Notice

This application is an educational and conceptual demonstration of blockchain-based verification. It does not replace an official employer verification process. All employer names and employee profiles in the demonstration dataset are fictional.
