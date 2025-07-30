# 🛡️ Threat Intel Platform

A modern, containerized threat intelligence platform that enriches IP addresses using multiple threat intelligence APIs, starting with Shodan integration.

![Platform Screenshot](https://img.shields.io/badge/Status-Production%20Ready-green)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- **🔍 IP Enrichment**: Enrich IP addresses with comprehensive threat intelligence data
- **🎯 Multiple API Support**: Integrated support for Shodan, with VirusTotal and AbuseIPDB coming soon
- **📊 Modern UI**: Clean, responsive interface with tabbed settings and real-time status indicators
- **🔐 Secure**: Built-in API key validation and secure storage
- **📁 Bulk Processing**: Support for both text input and file uploads
- **🗄️ Data Persistence**: PostgreSQL database with full data history
- **🐳 Containerized**: Complete Docker deployment with health checks
- **⚡ Production Ready**: Optimized for performance and scalability

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (2.0+)

### One-Command Deployment

```bash
# Clone the repository
git clone https://github.com/sm-coding-projects/Threat-Intel-Dashboard.git
cd Threat-Intel-Dashboard

# Deploy with our automated script
./deploy.sh
```

That's it! 🎉 The deployment script will:
- ✅ Check Docker installation
- ✅ Set up environment configuration
- ✅ Build and start all services
- ✅ Verify deployment health
- ✅ Display access information

### Manual Deployment

If you prefer manual control:

```bash
# 1. Set up environment
cp .env.example .env

# 2. Build and start services
docker-compose up -d --build

# 3. Check status
docker-compose ps
```

## 🌐 Access Your Platform

Once deployed, access your application at:

- **🖥️ Web Interface**: http://localhost:3000
- **🔧 API Endpoint**: http://localhost:5001
- **📊 Health Check**: http://localhost:5001/api/health

## ⚙️ Configuration

### Environment Variables

The platform uses environment variables for configuration. Copy `.env.example` to `.env` and customize:

```bash
# Shodan API Configuration
SHODAN_API_KEY=your_shodan_api_key_here

# Database Configuration (defaults provided)
DB_USER=threat_intel_user
DB_PASSWORD=secure_password_123
DB_NAME=threat_intel_db

# Application Settings
FLASK_ENV=production
```

### Getting API Keys

1. **Shodan API**: 
   - Visit [Shodan Account](https://account.shodan.io/)
   - Sign up/login and copy your API key
   - Add it through the web interface or `.env` file

2. **VirusTotal API** (Coming Soon):
   - Visit [VirusTotal API](https://www.virustotal.com/gui/join-us)

3. **AbuseIPDB API** (Coming Soon):
   - Visit [AbuseIPDB API](https://www.abuseipdb.com/api)

## 📖 Usage Guide

### 1. Initial Setup
1. Open http://localhost:3000
2. Navigate to **Settings → API Integrations**
3. Add your Shodan API key
4. Verify the key is validated (green status)

### 2. Enriching IP Addresses

**Text Input:**
1. Go to the Dashboard
2. Enter IP addresses (one per line) in the text area
3. Click "Submit IPs"

**File Upload:**
1. Prepare a text file with one IP per line
2. Click "Choose File" and select your file
3. Click "Upload & Process"

### 3. Viewing Results
- View enriched data in the results table
- Click "Details" to see full JSON response
- Use the delete button to remove entries

## 🛠️ Management Commands

The deployment script provides several management commands:

```bash
# View service status
./deploy.sh status

# View live logs
./deploy.sh logs

# Restart services
./deploy.sh restart

# Stop services
./deploy.sh stop

# Clean up everything
./deploy.sh cleanup

# Show help
./deploy.sh help
```

### Docker Compose Commands

For direct Docker management:

```bash
# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Scale services
docker-compose up -d --scale backend=2

# Update and rebuild
docker-compose up -d --build

# Complete cleanup
docker-compose down -v --remove-orphans
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React/Nginx) │◄──►│   (Flask/API)   │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 5001    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Threat Intel   │
                    │     APIs        │
                    │ (Shodan, etc.)  │
                    └─────────────────┘
```

## 🔧 Development

### Local Development Setup

```bash
# Start in development mode
docker-compose -f docker-compose.dev.yml up -d

# Or run components separately
cd backend && python app.py
cd frontend && npm run dev
```

### Project Structure

```
threat-intel-platform/
├── backend/                 # Flask API server
│   ├── app.py              # Main application
│   ├── models.py           # Database models
│   ├── shodan_utils.py     # Shodan integration
│   └── requirements.txt    # Python dependencies
├── frontend/               # React web application
│   ├── src/                # Source code
│   ├── public/             # Static assets
│   └── package.json        # Node dependencies
├── docker-compose.yml      # Production deployment
├── deploy.sh              # Deployment script
└── README.md              # This file
```

## 🚨 Troubleshooting

### Common Issues

**Services won't start:**
```bash
# Check Docker is running
docker info

# View detailed logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

**Database connection issues:**
```bash
# Check database health
docker-compose exec db pg_isready -U threat_intel_user

# Reset database
docker-compose down -v
docker-compose up -d
```

**API key validation fails:**
- Verify your Shodan API key at https://account.shodan.io/
- Check network connectivity
- Ensure API key has sufficient credits

### Health Checks

The platform includes comprehensive health monitoring:

- **Backend Health**: http://localhost:5001/api/health
- **Frontend Health**: http://localhost:3000/health
- **Database Health**: Automatic via Docker health checks

## 🔒 Security Considerations

- Change default database credentials in production
- Use environment variables for sensitive data
- Consider running behind a reverse proxy (nginx/traefik)
- Regularly update Docker images
- Monitor API usage and rate limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shodan](https://www.shodan.io/) for threat intelligence data
- [Material-UI](https://mui.com/) for the beautiful React components
- [Flask](https://flask.palletsprojects.com/) for the robust backend framework
- [PostgreSQL](https://www.postgresql.org/) for reliable data storage

## 📞 Support

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/sm-coding-projects/Threat-Intel-Dashboard/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/sm-coding-projects/Threat-Intel-Dashboard/discussions)
- 📧 **Contact**: [Project Maintainer](mailto:your-email@example.com)

---

**Made with ❤️ for the cybersecurity community**