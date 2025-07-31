from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import INET
import datetime

db = SQLAlchemy()

class IPAddress(db.Model):
    __tablename__ = 'ip_addresses'
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(INET, unique=True, nullable=False)
    country = db.Column(db.String(100))
    city = db.Column(db.String(100))
    org = db.Column(db.String(255))
    os = db.Column(db.String(100))
    hostname = db.Column(db.String(1024))
    isp = db.Column(db.String(255))
    asn = db.Column(db.String(100))
    last_shodan_update = db.Column(db.String(100))
    vulns = db.Column(db.JSON)
    last_updated = db.Column(db.DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    ports = db.relationship('Port', backref='ip_address_ref', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'ip_address': self.ip_address,
            'country': self.country,
            'city': self.city,
            'org': self.org,
            'os': self.os,
            'hostname': self.hostname,
            'isp': self.isp,
            'asn': self.asn,
            'last_shodan_update': self.last_shodan_update,
            'vulns': self.vulns,
            'last_updated': self.last_updated.isoformat(),
            'ports': [port.port_number for port in self.ports]
        }

class Port(db.Model):
    __tablename__ = 'ports'
    id = db.Column(db.Integer, primary_key=True)
    port_number = db.Column(db.Integer, nullable=False)
    ip_id = db.Column(db.Integer, db.ForeignKey('ip_addresses.id'), nullable=False)
