from flask import Flask, request, jsonify, Response, stream_with_context
import json
from flask_cors import CORS
from models import db, IPAddress, Port
from shodan_utils import get_shodan_api, enrich_ip, validate_api_key, get_api_info
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

@app.route('/api/api-info', methods=['GET'])
def get_shodan_api_info():
    """Returns Shodan API plan information."""
    api_key = request.headers.get('X-API-Key')
    if not api_key or not validate_api_key(api_key):
        return jsonify({'error': 'Invalid or missing API key'}), 401

    try:
        api = get_shodan_api(api_key)
        info = get_api_info(api)
        return jsonify(info)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/ips', methods=['GET'])
def get_all_ips():
    """Returns all IPs from the database."""
    ips = IPAddress.query.all()
    return jsonify([ip.to_dict() for ip in ips])




@app.route('/api/ips/stream', methods=['POST'])
def stream_ips():
    def generate():
        api_key = request.headers.get('X-API-Key')
        if not api_key or not validate_api_key(api_key):
            yield f"data: {json.dumps({'error': 'Invalid or missing API key'})}\n\n"
            return

        if 'file' in request.files:
            content = request.files['file'].read().decode('utf-8')
            ip_list = content.splitlines()
        else:
            data = request.get_json()
            ip_list = data.get('ips', '').split()

        if not ip_list:
            yield f"data: {json.dumps({'error': 'No IPs provided'})}\n\n"
            return

        try:
            api = get_shodan_api(api_key)
        except ValueError as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
            return

        for ip_str in ip_list:
            ip_str = ip_str.strip()
            if not ip_str:
                continue
            
            yield f"data: {json.dumps({'status': 'processing', 'ip_address': ip_str})}\n\n"

            try:
                ipaddress.ip_address(ip_str)
            except ValueError:
                yield f"data: {json.dumps({'status': 'error', 'ip_address': ip_str, 'message': 'Invalid IP address'})}\n\n"
                continue
            
            existing_ip = IPAddress.query.filter_by(ip_address=ip_str).first()
            if existing_ip:
                db.session.delete(existing_ip)
                db.session.commit()

            data = enrich_ip(api, ip_str)
            if 'error' in data:
                yield f"data: {json.dumps({'status': 'error', 'ip_address': ip_str, 'message': data['error']})}\n\n"
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
            db.session.commit()
            yield f"data: {json.dumps({'status': 'enriched', 'ip': new_ip.to_dict()})}\n\n"

    return Response(stream_with_context(generate()), mimetype='text/event-stream')


@app.route('/api/ips/<int:ip_id>', methods=['DELETE'])
def delete_ip(ip_id):
    """Deletes an IP address from the database."""
    ip_to_delete = IPAddress.query.get(ip_id)
    if not ip_to_delete:
        return jsonify({'error': 'IP address not found'}), 404
    
    db.session.delete(ip_to_delete)
    db.session.commit()
    
    return jsonify({'message': 'IP address deleted successfully'}), 200

@app.route('/api/ips/bulk-delete', methods=['POST'])
def delete_ips():
    """Deletes multiple IP addresses from the database."""
    data = request.get_json()
    ip_ids = data.get('ids')
    if not ip_ids:
        return jsonify({'error': 'No IP IDs provided'}), 400

    try:
        # First, delete the associated ports
        Port.query.filter(Port.ip_id.in_(ip_ids)).delete(synchronize_session=False)
        
        # Then, delete the IP addresses
        num_deleted = IPAddress.query.filter(IPAddress.id.in_(ip_ids)).delete(synchronize_session=False)
        
        db.session.commit()
        return jsonify({'message': f'{num_deleted} IP addresses deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for Docker health checks."""
    try:
        # Check database connection
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        db_status = 'healthy'
    except Exception as e:
        db_status = f'unhealthy: {str(e)}'
    
    return jsonify({
        'status': 'healthy' if db_status == 'healthy' else 'unhealthy',
        'timestamp': datetime.datetime.utcnow().isoformat(),
        'database': db_status,
        'version': '1.0.0'
    }), 200 if db_status == 'healthy' else 503

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
