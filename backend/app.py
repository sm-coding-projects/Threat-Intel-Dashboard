from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, IPAddress, Port
from shodan_utils import get_shodan_api, enrich_ip, validate_api_key
import os
import ipaddress
import datetime

app = Flask(__name__)
CORS(app) # Allow cross-origin requests

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# --- Initialize Database ---
with app.app_context():
    db.create_all()

# --- API Endpoints ---
@app.route('/api/validate-api-key', methods=['POST'])
def validate_key():
    """Validates a Shodan API key."""
    data = request.get_json()
    api_key = data.get('api_key')
    if not api_key:
        return jsonify({'error': 'API key is required'}), 400
    
    is_valid = validate_api_key(api_key)
    return jsonify({'is_valid': is_valid})

@app.route('/api/ips', methods=['GET'])
def get_all_ips():
    """Returns all IPs from the database."""
    ips = IPAddress.query.all()
    return jsonify([ip.to_dict() for ip in ips])

@app.route('/api/ips', methods=['POST'])
def add_ips():
    """Adds and enriches IPs from a text list or file."""
    api_key = request.headers.get('X-API-Key')
    if not api_key or not validate_api_key(api_key):
        return jsonify({'error': 'Invalid or missing API key'}), 401

    if 'file' in request.files:
        content = request.files['file'].read().decode('utf-8')
        ip_list = content.splitlines()
    else:
        data = request.get_json()
        ip_list = data.get('ips', '').split()

    if not ip_list:
        return jsonify({'error': 'No IPs provided'}), 400

    try:
        api = get_shodan_api(api_key)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
        
    enriched_ips = []
    errors = []

    for ip_str in ip_list:
        ip_str = ip_str.strip()
        if not ip_str:
            continue

        try:
            ipaddress.ip_address(ip_str)
        except ValueError:
            errors.append(f"Skipping invalid input: '{ip_str}' is not a valid IP address.")
            continue
            
        existing_ip = IPAddress.query.filter_by(ip_address=ip_str).first()
        if existing_ip:
            db.session.delete(existing_ip)
            db.session.commit()

        data = enrich_ip(api, ip_str)
        if 'error' in data:
            errors.append(f"Could not enrich {ip_str}: {data['error']}")
            continue

        new_ip = IPAddress(
            ip_address=data['ip_address'],
            country=data['country'],
            city=data['city'],
            org=data['org'],
            os=data['os'],
            hostname=data['hostname'],
            isp=data['isp'],
            asn=data['asn'],
            last_shodan_update=data['last_shodan_update'],
            vulns=data['vulns'],
            last_updated=datetime.datetime.utcnow()
        )
        
        for port_num in data['ports']:
            new_ip.ports.append(Port(port_number=port_num))
        
        db.session.add(new_ip)
        enriched_ips.append(new_ip.to_dict())

    db.session.commit()
    
    if errors:
        return jsonify({'enriched_ips': enriched_ips, 'errors': errors}), 207
        
    return jsonify(enriched_ips), 201


@app.route('/api/ips/<int:ip_id>', methods=['DELETE'])
def delete_ip(ip_id):
    """Deletes an IP address from the database."""
    ip_to_delete = IPAddress.query.get(ip_id)
    if not ip_to_delete:
        return jsonify({'error': 'IP address not found'}), 404
    
    db.session.delete(ip_to_delete)
    db.session.commit()
    
    return jsonify({'message': 'IP address deleted successfully'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
