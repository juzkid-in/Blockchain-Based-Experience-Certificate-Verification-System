"""
VERICERT - Flask API Backend
Provides REST endpoints for Experience Certificate Blockchain.
Run with:
  pip install flask flask-cors
  python app.py
"""

from flask import Flask, jsonify, request
import os
from blockchain import blockchain_instance

app = Flask(__name__)

# Basic CORS headers support
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "service": "VERICERT Blockchain Engine", "version": "1.0.0"})


@app.route("/api/stats", methods=["GET"])
def get_stats():
    return jsonify(blockchain_instance.get_stats())


@app.route("/api/blockchain", methods=["GET"])
def get_blockchain():
    return jsonify({
        "total_blocks": len(blockchain_instance.chain),
        "chain": [block.to_dict() for block in blockchain_instance.chain],
        "validation": blockchain_instance.validate_chain()
    })


@app.route("/api/blockchain/<int:index>", methods=["GET"])
def get_block_by_index(index):
    if 0 <= index < len(blockchain_instance.chain):
        block = blockchain_instance.chain[index]
        return jsonify({
            "block": block.to_dict(),
            "recalculated_hash": block.calculate_hash(),
            "hash_valid": block.hash == block.calculate_hash()
        })
    return jsonify({"error": f"Block index {index} not found"}), 404


@app.route("/api/blockchain/verify", methods=["GET", "POST"])
def verify_blockchain():
    validation = blockchain_instance.validate_chain()
    return jsonify(validation)


@app.route("/api/certificates", methods=["GET"])
def get_certificates():
    # Return unique certificates (latest state)
    cert_map = {}
    for block in blockchain_instance.chain:
        if block.index == 0:
            continue
        cert_map[block.certificate_id] = block.to_dict()
    return jsonify(list(cert_map.values()))


@app.route("/api/certificates", methods=["POST"])
def issue_certificate():
    data = request.get_json() or {}

    # Validation
    required = ["employee_name", "employer", "job_role", "employment_start_date", "employment_end_date"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"Field '{field}' is required."}), 400

    # Auto-generate certificate_id if not supplied
    if not data.get("certificate_id"):
        data["certificate_id"] = f"EC-2026-{len(blockchain_instance.chain):03d}"

    # Auto-generate employee_id if not supplied
    if not data.get("employee_id"):
        data["employee_id"] = f"EMP{len(blockchain_instance.chain):03d}"

    # Check duplicate certificate_id among active issuances
    for b in blockchain_instance.chain:
        if b.certificate_id == data["certificate_id"] and b.transaction_type == "CERTIFICATE_ISSUED":
            return jsonify({"error": f"Certificate ID '{data['certificate_id']}' already exists on blockchain."}), 409

    new_block = blockchain_instance.add_block(data, transaction_type="CERTIFICATE_ISSUED")
    return jsonify({
        "success": True,
        "message": f"Certificate {new_block.certificate_id} successfully committed to blockchain.",
        "block": new_block.to_dict()
    }), 201


@app.route("/api/certificates/<certificate_id>", methods=["GET"])
def get_certificate_details(certificate_id):
    for block in reversed(blockchain_instance.chain):
        if block.certificate_id.lower() == certificate_id.lower():
            return jsonify({
                "certificate": block.to_dict(),
                "recalculated_hash": block.calculate_hash(),
                "hash_matched": block.hash == block.calculate_hash()
            })
    return jsonify({"error": "Certificate not found"}), 404


@app.route("/api/certificates/<certificate_id>/revoke", methods=["POST"])
def revoke_certificate(certificate_id):
    data = request.get_json() or {}
    reason = data.get("reason", "Revoked by authorized organization")
    res = blockchain_instance.revoke_certificate(certificate_id, reason)
    if not res.get("success"):
        return jsonify(res), 404
    return jsonify(res)


@app.route("/api/certificates/<certificate_id>/history", methods=["GET"])
def get_certificate_history(certificate_id):
    history_blocks = [
        block.to_dict() for block in blockchain_instance.chain
        if block.certificate_id.lower() == certificate_id.lower()
    ]
    return jsonify({
        "certificate_id": certificate_id,
        "history": history_blocks
    })


@app.route("/api/verify", methods=["POST"])
def verify_certificate_endpoint():
    data = request.get_json() or {}
    query = data.get("query") or data.get("certificate_id") or data.get("employee_id") or ""
    if not query:
        return jsonify({"error": "Query or certificate_id parameter is required."}), 400

    result = blockchain_instance.verify_certificate(query)
    return jsonify(result)


@app.route("/api/tamper/simulate", methods=["POST"])
def simulate_tamper():
    data = request.get_json() or {}
    certificate_id = data.get("certificate_id", "EC-2026-001")
    field = data.get("field", "employer")
    modified_value = data.get("modified_value", "Fake Organization")

    res = blockchain_instance.simulate_tamper(certificate_id, field, modified_value)
    return jsonify(res)


@app.route("/api/tamper/restore", methods=["POST"])
def restore_tamper():
    res = blockchain_instance.restore_tamper()
    return jsonify(res)


@app.route("/api/demo/load", methods=["POST"])
def load_demo_data():
    created = blockchain_instance.load_demo_data()
    return jsonify({
        "success": True,
        "message": f"Loaded {len(created)} demonstration certificates.",
        "created_blocks": created,
        "stats": blockchain_instance.get_stats()
    })


@app.route("/api/activity", methods=["GET"])
def get_activity():
    return jsonify(blockchain_instance.activity_log)


@app.route("/api/organizations", methods=["GET"])
def get_organizations():
    return jsonify(blockchain_instance.get_organizations())


@app.route("/api/verification-history", methods=["GET"])
def get_verification_history():
    return jsonify(blockchain_instance.verification_history)


if __name__ == "__main__":
    # Ensure demo data is seeded
    blockchain_instance.load_demo_data()
    port = int(os.environ.get("FLASK_PORT", 5001))
    print(f"Starting VERICERT Flask Server on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=False)
