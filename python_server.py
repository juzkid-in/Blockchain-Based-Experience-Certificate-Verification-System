"""
VERICERT - Built-in Python REST Server (Zero-Dependency)
Implements all VERICERT API endpoints using Python's standard library http.server.
Directly interfaces with blockchain.py (SHA-256, Genesis Block, SQLite).
Runs on port 5001.
"""

import json
import os
import re
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

from blockchain import blockchain_instance

PORT = int(os.environ.get("PYTHON_SERVER_PORT", 5001))


class VericertAPIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def _read_json(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > 0:
                body = self.rfile.read(content_length).decode("utf-8")
                return json.loads(body)
        except Exception as e:
            print("Error parsing JSON body:", e)
        return {}

    def _send_json(self, data, status=200):
        self._set_headers(status)
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        query = parse_qs(parsed.query)

        try:
            if path == "/api/health":
                self._send_json({"status": "healthy", "service": "VERICERT Python Blockchain Core", "version": "1.0.0"})
                return

            if path == "/api/stats":
                self._send_json(blockchain_instance.get_stats())
                return

            if path == "/api/blockchain":
                self._send_json({
                    "total_blocks": len(blockchain_instance.chain),
                    "chain": [b.to_dict() for b in blockchain_instance.chain],
                    "validation": blockchain_instance.validate_chain()
                })
                return

            if path == "/api/blockchain/verify":
                self._send_json(blockchain_instance.validate_chain())
                return

            # Match /api/blockchain/<index>
            match_block = re.match(r"^/api/blockchain/(\d+)$", path)
            if match_block:
                idx = int(match_block.group(1))
                if 0 <= idx < len(blockchain_instance.chain):
                    b = blockchain_instance.chain[idx]
                    self._send_json({
                        "block": b.to_dict(),
                        "recalculated_hash": b.calculate_hash(),
                        "hash_valid": b.hash == b.calculate_hash()
                    })
                else:
                    self._send_json({"error": f"Block index {idx} not found"}, 404)
                return

            if path == "/api/certificates":
                cert_map = {}
                for block in blockchain_instance.chain:
                    if block.index == 0:
                        continue
                    cert_map[block.certificate_id] = block.to_dict()
                self._send_json(list(cert_map.values()))
                return

            # Match /api/certificates/<id>/history
            match_hist = re.match(r"^/api/certificates/([^/]+)/history$", path)
            if match_hist:
                cert_id = match_hist.group(1)
                hist = [b.to_dict() for b in blockchain_instance.chain if b.certificate_id.lower() == cert_id.lower()]
                self._send_json({"certificate_id": cert_id, "history": hist})
                return

            # Match /api/certificates/<id>
            match_cert = re.match(r"^/api/certificates/([^/]+)$", path)
            if match_cert:
                cert_id = match_cert.group(1)
                for b in reversed(blockchain_instance.chain):
                    if b.certificate_id.lower() == cert_id.lower():
                        self._send_json({
                            "certificate": b.to_dict(),
                            "recalculated_hash": b.calculate_hash(),
                            "hash_matched": b.hash == b.calculate_hash()
                        })
                        return
                self._send_json({"error": "Certificate not found"}, 404)
                return

            if path == "/api/activity":
                self._send_json(blockchain_instance.activity_log)
                return

            if path == "/api/organizations":
                self._send_json(blockchain_instance.get_organizations())
                return

            if path == "/api/verification-history":
                self._send_json(blockchain_instance.verification_history)
                return

            self._send_json({"error": f"Endpoint '{path}' not found"}, 404)

        except Exception as e:
            print("Exception in GET handler:", e)
            self._send_json({"error": str(e)}, 500)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        data = self._read_json()

        try:
            if path == "/api/certificates":
                required = ["employee_name", "employer", "job_role", "employment_start_date", "employment_end_date"]
                for f in required:
                    if not data.get(f):
                        self._send_json({"error": f"Field '{f}' is required."}, 400)
                        return

                if not data.get("certificate_id"):
                    data["certificate_id"] = f"EC-2026-{len(blockchain_instance.chain):03d}"
                if not data.get("employee_id"):
                    data["employee_id"] = f"EMP{len(blockchain_instance.chain):03d}"

                for b in blockchain_instance.chain:
                    if b.certificate_id == data["certificate_id"] and b.transaction_type == "CERTIFICATE_ISSUED":
                        self._send_json({"error": f"Certificate ID '{data['certificate_id']}' already exists."}, 409)
                        return

                new_block = blockchain_instance.add_block(data, transaction_type="CERTIFICATE_ISSUED")
                self._send_json({
                    "success": True,
                    "message": f"Certificate {new_block.certificate_id} committed to blockchain.",
                    "block": new_block.to_dict()
                }, 201)
                return

            # Match /api/certificates/<id>/revoke
            match_revoke = re.match(r"^/api/certificates/([^/]+)/revoke$", path)
            if match_revoke:
                cert_id = match_revoke.group(1)
                reason = data.get("reason", "Revoked by authorized organization")
                res = blockchain_instance.revoke_certificate(cert_id, reason)
                status = 200 if res.get("success") else 404
                self._send_json(res, status)
                return

            if path == "/api/verify":
                query = data.get("query") or data.get("certificate_id") or data.get("employee_id") or ""
                if not query:
                    self._send_json({"error": "Query or certificate_id parameter is required."}, 400)
                    return
                result = blockchain_instance.verify_certificate(query)
                self._send_json(result)
                return

            if path == "/api/blockchain/verify":
                val = blockchain_instance.validate_chain()
                self._send_json(val)
                return

            if path == "/api/tamper/simulate":
                cert_id = data.get("certificate_id", "EC-2026-001")
                field = data.get("field", "employer")
                modified_value = data.get("modified_value", "Fake Organization")
                res = blockchain_instance.simulate_tamper(cert_id, field, modified_value)
                self._send_json(res)
                return

            if path == "/api/tamper/restore":
                res = blockchain_instance.restore_tamper()
                self._send_json(res)
                return

            if path == "/api/demo/load":
                created = blockchain_instance.load_demo_data()
                self._send_json({
                    "success": True,
                    "message": f"Loaded {len(created)} demonstration certificates.",
                    "created_blocks": created,
                    "stats": blockchain_instance.get_stats()
                })
                return

            self._send_json({"error": f"Endpoint '{path}' not found"}, 404)

        except Exception as e:
            print("Exception in POST handler:", e)
            self._send_json({"error": str(e)}, 500)

    def log_message(self, format, *args):
        # Concise logging to stdout
        sys.stdout.write("%s - - [%s] %s\n" % (self.address_string(), self.log_date_time_string(), format % args))


def run_server():
    # Preload demo data so first load has rich certificates
    blockchain_instance.load_demo_data()
    server_address = ("127.0.0.1", PORT)
    httpd = HTTPServer(server_address, VericertAPIHandler)
    print(f"VERICERT Python Core running on http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()


if __name__ == "__main__":
    run_server()
