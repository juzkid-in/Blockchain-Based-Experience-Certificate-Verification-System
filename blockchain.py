"""
VERICERT - Blockchain Experience Certificate Verification Engine
Core Blockchain Implementation with Genesis Block, SHA-256 hashing,
SQLite persistence, dynamic block linking, validation, and tamper detection.
"""

import hashlib
import json
import os
import sqlite3
import time
from datetime import datetime

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vericert.db")


class Block:
    """
    Represents a single immutable block in the VERICERT Experience Certificate Blockchain.
    Every block links to the previous block via 'previous_hash'.
    The current hash is calculated using SHA-256 over all block fields.
    """
    def __init__(
        self,
        index: int,
        timestamp: str,
        transaction_id: str,
        transaction_type: str,
        certificate_id: str,
        employee_id: str,
        employee_name: str,
        employer: str,
        job_role: str,
        employment_start_date: str,
        employment_end_date: str,
        experience_duration: str,
        issue_date: str,
        previous_hash: str,
        department: str = "Engineering",
        employment_type: str = "Full Time",
        certificate_status: str = "Active",
        reason: str = "",
        current_hash: str = ""
    ):
        self.index = int(index)
        self.timestamp = timestamp
        self.transaction_id = transaction_id
        self.transaction_type = transaction_type
        self.certificate_id = certificate_id
        self.employee_id = employee_id
        self.employee_name = employee_name
        self.employer = employer
        self.job_role = job_role
        self.employment_start_date = employment_start_date
        self.employment_end_date = employment_end_date
        self.experience_duration = experience_duration
        self.issue_date = issue_date
        self.previous_hash = previous_hash
        self.department = department
        self.employment_type = employment_type
        self.certificate_status = certificate_status
        self.reason = reason

        # Calculate current hash dynamically if not provided
        self.hash = current_hash if current_hash else self.calculate_hash()

    def get_hashable_payload(self) -> str:
        """
        Creates a deterministic string representation of all block contents
        for cryptographic SHA-256 hashing.
        """
        data = {
            "index": self.index,
            "timestamp": self.timestamp,
            "transaction_id": self.transaction_id,
            "transaction_type": self.transaction_type,
            "certificate_id": self.certificate_id,
            "employee_id": self.employee_id,
            "employee_name": self.employee_name,
            "employer": self.employer,
            "job_role": self.job_role,
            "employment_start_date": self.employment_start_date,
            "employment_end_date": self.employment_end_date,
            "experience_duration": self.experience_duration,
            "issue_date": self.issue_date,
            "department": self.department,
            "employment_type": self.employment_type,
            "certificate_status": self.certificate_status,
            "reason": self.reason,
            "previous_hash": self.previous_hash,
        }
        return json.dumps(data, sort_keys=True)

    def calculate_hash(self) -> str:
        """
        Generates actual SHA-256 cryptographic hash based on the block contents.
        """
        payload = self.get_hashable_payload()
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()

    def to_dict(self) -> dict:
        return {
            "index": self.index,
            "timestamp": self.timestamp,
            "transaction_id": self.transaction_id,
            "transaction_type": self.transaction_type,
            "certificate_id": self.certificate_id,
            "employee_id": self.employee_id,
            "employee_name": self.employee_name,
            "employer": self.employer,
            "job_role": self.job_role,
            "employment_start_date": self.employment_start_date,
            "employment_end_date": self.employment_end_date,
            "experience_duration": self.experience_duration,
            "issue_date": self.issue_date,
            "department": self.department,
            "employment_type": self.employment_type,
            "certificate_status": self.certificate_status,
            "reason": self.reason,
            "previous_hash": self.previous_hash,
            "hash": self.hash,
        }


class Blockchain:
    """
    Maintains the append-only ledger of blocks starting with the Genesis Block.
    Provides validation, tamper-detection, certificate issuing, and revocation.
    """
    def __init__(self, db_path: str = DB_FILE):
        self.db_path = db_path
        self.chain: list[Block] = []
        self.activity_log: list[dict] = []
        self.verification_history: list[dict] = []
        self.tampered_block_index: int | None = None
        self.original_tampered_block: Block | None = None

        self._init_db()
        self._load_or_initialize_chain()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS blockchain (
                    block_index INTEGER PRIMARY KEY,
                    timestamp TEXT NOT NULL,
                    transaction_id TEXT NOT NULL,
                    transaction_type TEXT NOT NULL,
                    certificate_id TEXT NOT NULL,
                    employee_id TEXT NOT NULL,
                    employee_name TEXT NOT NULL,
                    employer TEXT NOT NULL,
                    job_role TEXT NOT NULL,
                    employment_start_date TEXT,
                    employment_end_date TEXT,
                    experience_duration TEXT,
                    issue_date TEXT,
                    department TEXT,
                    employment_type TEXT,
                    certificate_status TEXT,
                    reason TEXT,
                    previous_hash TEXT NOT NULL,
                    current_hash TEXT NOT NULL
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS certificates (
                    certificate_id TEXT PRIMARY KEY,
                    employee_id TEXT NOT NULL,
                    employee_name TEXT NOT NULL,
                    employer TEXT NOT NULL,
                    job_role TEXT NOT NULL,
                    employment_start_date TEXT,
                    employment_end_date TEXT,
                    experience_duration TEXT,
                    issue_date TEXT,
                    department TEXT,
                    employment_type TEXT,
                    status TEXT NOT NULL,
                    block_index INTEGER,
                    tx_id TEXT
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS verification_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    certificate_id TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    result TEXT NOT NULL,
                    blockchain_status TEXT NOT NULL,
                    hash_status TEXT NOT NULL,
                    details TEXT
                )
            """)
            conn.commit()

    def _load_or_initialize_chain(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM blockchain ORDER BY block_index ASC")
            rows = cursor.fetchall()

            if rows:
                self.chain = [
                    Block(
                        index=row["block_index"],
                        timestamp=row["timestamp"],
                        transaction_id=row["transaction_id"],
                        transaction_type=row["transaction_type"],
                        certificate_id=row["certificate_id"],
                        employee_id=row["employee_id"],
                        employee_name=row["employee_name"],
                        employer=row["employer"],
                        job_role=row["job_role"],
                        employment_start_date=row["employment_start_date"] or "",
                        employment_end_date=row["employment_end_date"] or "",
                        experience_duration=row["experience_duration"] or "",
                        issue_date=row["issue_date"] or "",
                        previous_hash=row["previous_hash"],
                        department=row["department"] or "Engineering",
                        employment_type=row["employment_type"] or "Full Time",
                        certificate_status=row["certificate_status"] or "Active",
                        reason=row["reason"] or "",
                        current_hash=row["current_hash"]
                    )
                    for row in rows
                ]
            else:
                genesis_block = self.create_genesis_block()
                self.chain = [genesis_block]
                self._save_block_to_db(genesis_block)
                self.log_activity(
                    "genesis",
                    "Genesis Block 0 initialized with cryptographic SHA-256 hash",
                    "GENESIS"
                )

    def create_genesis_block(self) -> Block:
        """
        Creates Block 0 (The Genesis Block).
        Previous hash is initialized to "0".
        Actual timestamp and actual SHA-256 hash are generated dynamically.
        """
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        genesis = Block(
            index=0,
            timestamp=timestamp,
            transaction_id="TX-GENESIS-00000000",
            transaction_type="GENESIS",
            certificate_id="GENESIS",
            employee_id="SYSTEM",
            employee_name="SYSTEM ROOT",
            employer="VERICERT PROTOCOL",
            job_role="Experience Certificate Blockchain Initialized",
            employment_start_date="2026-01-01",
            employment_end_date="2026-01-01",
            experience_duration="N/A",
            issue_date=timestamp,
            previous_hash="0",
            department="Protocol Governance",
            employment_type="Core",
            certificate_status="Active",
            reason="Experience Certificate Blockchain Initialized"
        )
        return genesis

    def _save_block_to_db(self, block: Block):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO blockchain (
                    block_index, timestamp, transaction_id, transaction_type,
                    certificate_id, employee_id, employee_name, employer,
                    job_role, employment_start_date, employment_end_date,
                    experience_duration, issue_date, department, employment_type,
                    certificate_status, reason, previous_hash, current_hash
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                block.index, block.timestamp, block.transaction_id, block.transaction_type,
                block.certificate_id, block.employee_id, block.employee_name, block.employer,
                block.job_role, block.employment_start_date, block.employment_end_date,
                block.experience_duration, block.issue_date, block.department, block.employment_type,
                block.certificate_status, block.reason, block.previous_hash, block.hash
            ))
            conn.commit()

    def get_latest_block(self) -> Block:
        return self.chain[-1]

    def add_block(
        self,
        certificate_data: dict,
        transaction_type: str = "CERTIFICATE_ISSUED",
        reason: str = ""
    ) -> Block:
        """
        Creates a new block, links previous_hash to latest_block.hash,
        calculates SHA-256, appends to chain, and updates SQLite.
        """
        latest = self.get_latest_block()
        new_index = latest.index + 1
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        tx_id = f"TX-{hex(int(time.time() * 1000))[2:].upper()}-{new_index:04d}"

        new_block = Block(
            index=new_index,
            timestamp=timestamp,
            transaction_id=tx_id,
            transaction_type=transaction_type,
            certificate_id=certificate_data.get("certificate_id", f"EC-2026-{new_index:03d}"),
            employee_id=certificate_data.get("employee_id", ""),
            employee_name=certificate_data.get("employee_name", ""),
            employer=certificate_data.get("employer", ""),
            job_role=certificate_data.get("job_role", ""),
            employment_start_date=certificate_data.get("employment_start_date", ""),
            employment_end_date=certificate_data.get("employment_end_date", ""),
            experience_duration=certificate_data.get("experience_duration", ""),
            issue_date=certificate_data.get("issue_date", timestamp.split()[0]),
            previous_hash=latest.hash,
            department=certificate_data.get("department", "Engineering"),
            employment_type=certificate_data.get("employment_type", "Full Time"),
            certificate_status=certificate_data.get("certificate_status", "Active"),
            reason=reason or certificate_data.get("reason", "")
        )

        self.chain.append(new_block)
        self._save_block_to_db(new_block)

        # Update certificates table
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO certificates (
                    certificate_id, employee_id, employee_name, employer, job_role,
                    employment_start_date, employment_end_date, experience_duration,
                    issue_date, department, employment_type, status, block_index, tx_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                new_block.certificate_id, new_block.employee_id, new_block.employee_name,
                new_block.employer, new_block.job_role, new_block.employment_start_date,
                new_block.employment_end_date, new_block.experience_duration, new_block.issue_date,
                new_block.department, new_block.employment_type, new_block.certificate_status,
                new_block.index, new_block.transaction_id
            ))
            conn.commit()

        if transaction_type == "CERTIFICATE_REVOKED":
            self.log_activity("revoked", f"Certificate {new_block.certificate_id} revoked (Block #{new_block.index})", new_block.certificate_id)
        else:
            self.log_activity("issued", f"Certificate {new_block.certificate_id} issued to {new_block.employee_name} (Block #{new_block.index})", new_block.certificate_id)

        return new_block

    def validate_chain(self) -> dict:
        """
        Cryptographically validates every single block in the chain:
        1. Genesis block has index 0 and previous_hash "0".
        2. Genesis block recalculated hash matches stored hash.
        3. Every subsequent block has previous_hash == chain[i-1].hash.
        4. Every block's recalculated SHA-256 hash matches its stored hash.
        """
        if not self.chain:
            return {"valid": False, "message": "Blockchain is empty.", "error_block": None}

        # Check Genesis
        genesis = self.chain[0]
        if genesis.index != 0 or genesis.previous_hash != "0":
            return {
                "valid": False,
                "message": "Genesis Block index or previous hash is invalid.",
                "error_block": 0,
                "stored_hash": genesis.hash,
                "recalculated_hash": genesis.calculate_hash()
            }

        recalculated_genesis_hash = genesis.calculate_hash()
        if genesis.hash != recalculated_genesis_hash:
            return {
                "valid": False,
                "message": "Genesis Block SHA-256 hash mismatch! Data has been modified.",
                "error_block": 0,
                "stored_hash": genesis.hash,
                "recalculated_hash": recalculated_genesis_hash
            }

        # Check subsequent blocks
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            # Verify cryptographic link
            if current.previous_hash != previous.hash:
                return {
                    "valid": False,
                    "message": f"Broken chain link at Block #{current.index}: previous_hash does not match Block #{previous.index}'s hash.",
                    "error_block": current.index,
                    "expected_previous_hash": previous.hash,
                    "found_previous_hash": current.previous_hash
                }

            # Recalculate block hash
            recalculated = current.calculate_hash()
            if current.hash != recalculated:
                return {
                    "valid": False,
                    "message": f"Hash mismatch at Block #{current.index} for Certificate {current.certificate_id}! Stored hash differs from recalculated SHA-256 hash.",
                    "error_block": current.index,
                    "stored_hash": current.hash,
                    "recalculated_hash": recalculated
                }

        return {
            "valid": True,
            "message": "All blockchain records are internally consistent.",
            "total_blocks": len(self.chain),
            "latest_hash": self.get_latest_block().hash
        }

    def verify_certificate(self, query: str) -> dict:
        """
        Performs full 5-step cryptographic verification:
        Step 1: Finding Certificate
        Step 2: Retrieving Blockchain Record
        Step 3: Recalculating SHA-256 Hash
        Step 4: Comparing Stored Hash
        Step 5: Chain Linkage & Verification Complete
        """
        query_clean = query.strip()
        matched_block: Block | None = None

        # Search in chain backwards to get most recent state (in case of revocation)
        for block in reversed(self.chain):
            if (
                block.certificate_id.lower() == query_clean.lower()
                or block.employee_id.lower() == query_clean.lower()
                or block.transaction_id.lower() == query_clean.lower()
            ):
                matched_block = block
                break

        if not matched_block:
            return {
                "found": False,
                "message": f"No certificate found matching identifier '{query}'.",
                "steps": [
                    {"step": 1, "name": "Finding Certificate", "status": "failed", "detail": "Certificate record not found in registry"}
                ]
            }

        # Step 2: Retrieve blockchain record
        block_data = matched_block.to_dict()

        # Step 3: Recalculate SHA-256 hash
        recalculated_hash = matched_block.calculate_hash()

        # Step 4: Compare hash
        hash_matched = (matched_block.hash == recalculated_hash)

        # Step 5: Check chain integrity up to this block
        chain_validation = self.validate_chain()
        is_authentic = hash_matched and chain_validation["valid"]

        result_entry = {
            "found": True,
            "certificate_id": matched_block.certificate_id,
            "employee_id": matched_block.employee_id,
            "employee_name": matched_block.employee_name,
            "employer": matched_block.employer,
            "job_role": matched_block.job_role,
            "experience_duration": matched_block.experience_duration,
            "employment_start_date": matched_block.employment_start_date,
            "employment_end_date": matched_block.employment_end_date,
            "issue_date": matched_block.issue_date,
            "department": matched_block.department,
            "employment_type": matched_block.employment_type,
            "certificate_status": matched_block.certificate_status,
            "block_index": matched_block.index,
            "transaction_id": matched_block.transaction_id,
            "transaction_type": matched_block.transaction_type,
            "stored_hash": matched_block.hash,
            "recalculated_hash": recalculated_hash,
            "previous_hash": matched_block.previous_hash,
            "hash_matched": hash_matched,
            "blockchain_status": "VALID" if chain_validation["valid"] else "INVALID",
            "record_status": "AUTHENTIC" if is_authentic else "TAMPERED_OR_CORRUPT",
            "is_revoked": matched_block.certificate_status == "Revoked",
            "reason": matched_block.reason,
            "steps": [
                {"step": 1, "name": "Finding Certificate", "status": "success", "detail": f"Matched Certificate {matched_block.certificate_id}"},
                {"step": 2, "name": "Retrieving Blockchain Record", "status": "success", "detail": f"Block #{matched_block.index} retrieved from ledger"},
                {"step": 3, "name": "Recalculating SHA-256 Hash", "status": "success", "detail": f"SHA-256 recalculated: {recalculated_hash[:16]}..."},
                {"step": 4, "name": "Comparing Stored Hash", "status": "success" if hash_matched else "failed", "detail": "Hash matches stored block hash" if hash_matched else "HASH MISMATCH! Stored hash differs from recalculated hash."},
                {"step": 5, "name": "Verification Complete", "status": "success" if is_authentic else "failed", "detail": "Certificate verified authentic against blockchain ledger." if is_authentic else "Certificate integrity could not be confirmed."}
            ]
        }

        # Record in verification history
        history_item = {
            "certificate_id": matched_block.certificate_id,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "result": "VERIFIED" if is_authentic and not result_entry["is_revoked"] else ("REVOKED" if result_entry["is_revoked"] else "FAILED"),
            "blockchain_status": "VALID" if chain_validation["valid"] else "INVALID",
            "hash_status": "MATCHED" if hash_matched else "MISMATCH"
        }
        self.verification_history.insert(0, history_item)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO verification_history (certificate_id, timestamp, result, blockchain_status, hash_status, details)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                history_item["certificate_id"], history_item["timestamp"],
                history_item["result"], history_item["blockchain_status"],
                history_item["hash_status"], json.dumps(result_entry)
            ))
            conn.commit()

        self.log_activity("verified", f"Certificate {matched_block.certificate_id} verified ({history_item['result']})", matched_block.certificate_id)

        return result_entry

    def revoke_certificate(self, certificate_id: str, reason: str = "Revoked by employer") -> dict:
        """
        Creates an immutable REVOCATION block on the blockchain.
        Does NOT alter previous blocks; preserves complete historical ledger.
        """
        target_block = None
        for b in self.chain:
            if b.certificate_id == certificate_id:
                target_block = b
                break

        if not target_block:
            return {"success": False, "message": f"Certificate {certificate_id} not found."}

        revocation_data = {
            "certificate_id": target_block.certificate_id,
            "employee_id": target_block.employee_id,
            "employee_name": target_block.employee_name,
            "employer": target_block.employer,
            "job_role": target_block.job_role,
            "employment_start_date": target_block.employment_start_date,
            "employment_end_date": target_block.employment_end_date,
            "experience_duration": target_block.experience_duration,
            "issue_date": target_block.issue_date,
            "department": target_block.department,
            "employment_type": target_block.employment_type,
            "certificate_status": "Revoked",
            "reason": reason or "Revoked by authorized organization"
        }

        new_block = self.add_block(revocation_data, transaction_type="CERTIFICATE_REVOKED", reason=reason)
        return {
            "success": True,
            "message": f"Certificate {certificate_id} has been revoked. Revocation block #{new_block.index} appended.",
            "block": new_block.to_dict()
        }

    def simulate_tamper(self, certificate_id: str, field: str, modified_value: str) -> dict:
        """
        Simulates malicious tampering on a certificate block:
        Alters the block's in-memory data without recalculating its cryptographic hash.
        This immediately breaks the SHA-256 hash match and chain integrity.
        """
        target_block = None
        target_index = -1
        for idx, b in enumerate(self.chain):
            if b.certificate_id == certificate_id:
                target_block = b
                target_index = idx
                break

        if not target_block or target_index <= 0:
            return {"success": False, "message": "Valid non-genesis certificate block not found."}

        # Backup original block for restoration
        self.tampered_block_index = target_index
        self.original_tampered_block = Block(
            index=target_block.index,
            timestamp=target_block.timestamp,
            transaction_id=target_block.transaction_id,
            transaction_type=target_block.transaction_type,
            certificate_id=target_block.certificate_id,
            employee_id=target_block.employee_id,
            employee_name=target_block.employee_name,
            employer=target_block.employer,
            job_role=target_block.job_role,
            employment_start_date=target_block.employment_start_date,
            employment_end_date=target_block.employment_end_date,
            experience_duration=target_block.experience_duration,
            issue_date=target_block.issue_date,
            previous_hash=target_block.previous_hash,
            department=target_block.department,
            employment_type=target_block.employment_type,
            certificate_status=target_block.certificate_status,
            reason=target_block.reason,
            current_hash=target_block.hash
        )

        original_val = getattr(target_block, field, "")
        setattr(target_block, field, modified_value)

        # Calculate what hash would be now vs stored hash
        stored_hash = target_block.hash
        recalculated_hash = target_block.calculate_hash()
        validation = self.validate_chain()

        self.log_activity(
            "tamper",
            f"TAMPER SIMULATED: Changed {field} on Block #{target_block.index} ({certificate_id}) from '{original_val}' to '{modified_value}'",
            certificate_id
        )

        return {
            "success": True,
            "message": "Tampering simulated! Block data modified without updating stored hash.",
            "tampered_block_index": target_index,
            "certificate_id": certificate_id,
            "field": field,
            "original_value": original_val,
            "modified_value": modified_value,
            "stored_hash": stored_hash,
            "recalculated_hash": recalculated_hash,
            "hash_mismatch": stored_hash != recalculated_hash,
            "chain_validation": validation
        }

    def restore_tamper(self) -> dict:
        """
        Restores the original untampered block from the backup.
        Recalculates chain validation to prove cryptographic consistency is restored.
        """
        if self.tampered_block_index is None or not self.original_tampered_block:
            return {"success": False, "message": "No active tampering session to restore."}

        idx = self.tampered_block_index
        self.chain[idx] = self.original_tampered_block

        validation = self.validate_chain()
        restored_block = self.chain[idx]

        self.log_activity("restored", f"RECORD RESTORED: Block #{idx} ({restored_block.certificate_id}) restored to original verified state", restored_block.certificate_id)

        self.tampered_block_index = None
        self.original_tampered_block = None

        return {
            "success": True,
            "message": "Record restored! Blockchain verified and internally consistent.",
            "restored_block": restored_block.to_dict(),
            "chain_validation": validation
        }

    def log_activity(self, event_type: str, description: str, ref_id: str = ""):
        entry = {
            "id": f"ACT-{int(time.time() * 1000)}",
            "type": event_type,
            "description": description,
            "reference_id": ref_id,
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        }
        self.activity_log.insert(0, entry)
        if len(self.activity_log) > 50:
            self.activity_log = self.activity_log[:50]

    def load_demo_data(self) -> list[dict]:
        """
        Loads 5 fictional demonstration certificates as explicitly specified in prompt:
        EC-2026-001 (Alex Johnson)
        EC-2026-002 (Priya Sharma)
        EC-2026-003 (Arjun Rao)
        EC-2026-004 (Maya Patel)
        EC-2026-005 (Kiran Kumar)
        """
        demo_certs = [
            {
                "certificate_id": "EC-2026-001",
                "employee_id": "EMP001",
                "employee_name": "Alex Johnson",
                "employer": "TechNova Solutions",
                "job_role": "Software Engineer",
                "employment_start_date": "2019-06-01",
                "employment_end_date": "2022-08-31",
                "experience_duration": "3 Years 3 Months",
                "issue_date": "2022-09-05",
                "department": "Engineering & Technology",
                "employment_type": "Full Time",
                "certificate_status": "Active"
            },
            {
                "certificate_id": "EC-2026-002",
                "employee_id": "EMP002",
                "employee_name": "Priya Sharma",
                "employer": "DigitalWorks",
                "job_role": "Data Analyst",
                "employment_start_date": "2020-01-10",
                "employment_end_date": "2024-02-15",
                "experience_duration": "4 Years 1 Month",
                "issue_date": "2024-02-20",
                "department": "Analytics & BI",
                "employment_type": "Full Time",
                "certificate_status": "Active"
            },
            {
                "certificate_id": "EC-2026-003",
                "employee_id": "EMP003",
                "employee_name": "Arjun Rao",
                "employer": "CloudSphere",
                "job_role": "Cloud Engineer",
                "employment_start_date": "2021-07-01",
                "employment_end_date": "2025-07-01",
                "experience_duration": "4 Years 0 Months",
                "issue_date": "2025-07-05",
                "department": "Cloud Infrastructure",
                "employment_type": "Full Time",
                "certificate_status": "Active"
            },
            {
                "certificate_id": "EC-2026-004",
                "employee_id": "EMP004",
                "employee_name": "Maya Patel",
                "employer": "InnovateLabs",
                "job_role": "Project Engineer",
                "employment_start_date": "2018-03-01",
                "employment_end_date": "2022-03-01",
                "experience_duration": "4 Years 0 Months",
                "issue_date": "2022-03-10",
                "department": "Product R&D",
                "employment_type": "Full Time",
                "certificate_status": "Active"
            },
            {
                "certificate_id": "EC-2026-005",
                "employee_id": "EMP005",
                "employee_name": "Kiran Kumar",
                "employer": "SecureNet",
                "job_role": "Security Analyst",
                "employment_start_date": "2022-01-15",
                "employment_end_date": "2026-01-15",
                "experience_duration": "4 Years 0 Months",
                "issue_date": "2026-01-20",
                "department": "Cybersecurity Operations",
                "employment_type": "Full Time",
                "certificate_status": "Active"
            },
        ]

        created = []
        for cert in demo_certs:
            # Check if already exists in chain
            if not any(b.certificate_id == cert["certificate_id"] for b in self.chain):
                block = self.add_block(cert)
                created.append(block.to_dict())

        return created

    def get_stats(self) -> dict:
        """
        Calculates live dynamic statistics from actual chain records.
        """
        # Unique certificates by ID
        unique_certs = set()
        active_count = 0
        revoked_count = 0

        # Latest status per certificate ID
        cert_latest_status = {}
        for block in self.chain:
            if block.index == 0:
                continue
            unique_certs.add(block.certificate_id)
            cert_latest_status[block.certificate_id] = block.certificate_status

        for status in cert_latest_status.values():
            if status == "Revoked":
                revoked_count += 1
            else:
                active_count += 1

        validation = self.validate_chain()

        total_certs = len(unique_certs)
        verified_pct = 100 if total_certs == 0 else round((active_count / max(1, total_certs)) * 100)

        return {
            "total_certificates": total_certs,
            "active_certificates": active_count,
            "valid_certificates": active_count,
            "revoked_certificates": revoked_count,
            "total_blocks": len(self.chain),
            "chain_height": len(self.chain) - 1,
            "chain_integrity": "100%" if validation["valid"] else "0%",
            "is_valid": validation["valid"],
            "latest_hash": self.get_latest_block().hash,
            "latest_block_index": self.get_latest_block().index,
            "total_verifications": len(self.verification_history),
            "verified_percentage": verified_pct
        }

    def get_organizations(self) -> list[dict]:
        """
        Aggregates organizations from blockchain records with rich metadata.
        """
        industry_map = {
            "TechNova Solutions": ("Cloud Software & AI Systems", "2012"),
            "DigitalWorks": ("Digital Media & Analytics", "2016"),
            "CloudSphere": ("Cloud Infrastructure & DevOps", "2018"),
            "FinTech Global": ("Financial Technology & Banking", "2010"),
            "Nexus HealthTech": ("Healthcare Systems & Data", "2015")
        }

        org_map = {}
        for block in self.chain:
            if block.index == 0 or not block.employer:
                continue
            org = block.employer
            if org not in org_map:
                ind, est = industry_map.get(org, ("Enterprise Technology", "2015"))
                org_map[org] = {
                    "name": org,
                    "total_certificates": 0,
                    "certificates_issued": 0,
                    "active_certificates": 0,
                    "revoked_certificates": 0,
                    "active_employees": 140,
                    "industry": ind,
                    "established": est,
                    "verifier_id": f"VRF-{hashlib.md5(org.encode()).hexdigest()[:6].upper()}",
                    "blockchain_address": f"0x{hashlib.sha256(org.encode()).hexdigest()[:40]}",
                    "latest_certificate_id": block.certificate_id,
                    "latest_issue_date": block.issue_date,
                    "certificates": []
                }
            org_map[org]["total_certificates"] += 1
            org_map[org]["certificates_issued"] += 1
            if block.certificate_status == "Revoked":
                org_map[org]["revoked_certificates"] += 1
            else:
                org_map[org]["active_certificates"] += 1
            org_map[org]["certificates"].append(block.to_dict())
            org_map[org]["latest_certificate_id"] = block.certificate_id
            org_map[org]["latest_issue_date"] = block.issue_date

        if not org_map:
            # Provide standard accredited baseline partner profiles
            for org_name, (ind, est) in industry_map.items():
                org_map[org_name] = {
                    "name": org_name,
                    "total_certificates": 0,
                    "certificates_issued": 0,
                    "active_certificates": 0,
                    "revoked_certificates": 0,
                    "active_employees": 180,
                    "industry": ind,
                    "established": est,
                    "verifier_id": f"VRF-{hashlib.md5(org_name.encode()).hexdigest()[:6].upper()}",
                    "blockchain_address": f"0x{hashlib.sha256(org_name.encode()).hexdigest()[:40]}",
                    "latest_certificate_id": "None",
                    "latest_issue_date": "N/A",
                    "certificates": []
                }

        return list(org_map.values())


# Singleton instance for server process
blockchain_instance = Blockchain()
