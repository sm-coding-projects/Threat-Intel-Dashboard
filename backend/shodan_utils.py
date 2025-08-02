import os
import shodan
import ipaddress
import json

def get_shodan_api(api_key=None):
    """Initializes and returns the Shodan API client."""
    if not api_key:
        api_key = os.getenv('SHODAN_API_KEY')
    if not api_key:
        raise ValueError("Shodan API key must be provided.")
    return shodan.Shodan(api_key)

def validate_api_key(api_key):
    """Validates a Shodan API key."""
    try:
        api = shodan.Shodan(api_key)
        api.info()
        return True
    except shodan.APIError:
        return False

def enrich_ip(api, ip_str):
    """Enriches a single IP using the Shodan API."""
    try:
        # Validate if the string is a valid IP address
        ipaddress.ip_address(ip_str)
        host = api.host(ip_str)
        return {
            'ip_address': host.get('ip_str'),
            'country': host.get('country_name', 'N/A'),
            'city': host.get('city', 'N/A'),
            'org': host.get('org', 'N/A'),
            'os': host.get('os', 'N/A'),
            'hostname': ', '.join(host.get('hostnames', [])),
            'isp': host.get('isp', 'N/A'),
            'asn': host.get('asn', 'N/A'),
            'last_shodan_update': host.get('last_update', 'N/A'),
            'vulns': host.get('vulns', []),
            'ports': host.get('ports', [])
        }
    except shodan.APIError as e:
        if "No information available for that IP." in str(e):
            return {'error': 'Not found', 'ip_address': ip_str}
        print(f"Shodan API error for {ip_str}: {e}")
        return {'error': str(e), 'ip_address': ip_str}
    except ValueError:
        print(f"Invalid IP address format: {ip_str}")
        return {'error': 'Invalid IP address format', 'ip_address': ip_str}
    except Exception as e:
        print(f"An unexpected error occurred for {ip_str}: {e}")
        return {'error': 'Unexpected error', 'ip_address': ip_str}

def get_api_info(api):
    """Retrieves API plan information."""
    try:
        info = api.info()
        return {
            'plan': info.get('plan', 'N/A'),
            'query_credits': info.get('query_credits', 'N/A'),
            'scan_credits': info.get('scan_credits', 'N/A')
        }
    except shodan.APIError as e:
        return {'error': str(e)}
