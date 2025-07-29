# Threat Intel Platform

This is a simple threat intelligence platform that uses the Shodan API to enrich IP addresses.

## Features

- Add IP addresses from text or file.
- View enriched IP address information from Shodan.
- API key validation and storage.
- View full JSON details for each IP address.

## Setup

1. Clone the repository.
2. Create a `.env` file by copying the example file: `cp .env.example .env`.
3. Fill in the values in the `.env` file. See the `.env` File section below for details.
4. Run `docker-compose up -d --build` to start the services.
5. Access the application at `http://localhost:3000`.

## .env File

The `.env` file should contain the following variables:

- `SHODAN_API_KEY`: Your Shodan API key. You can get your API key from https://account.shodan.io/
- `DB_USER`: The username for the PostgreSQL database.
- `DB_PASSWORD`: The password for the PostgreSQL database.
- `DB_NAME`: The name of the PostgreSQL database.

The `.env.example` file includes default values for the database configuration. You can use these values or change them to whatever you want.

Example from `.env.example`:
```
# Shodan API Key
# You can get your API key from https://account.shodan.io/
SHODAN_API_KEY=

# PostgreSQL Database Configuration
# These are the credentials for the PostgreSQL database that will be created by Docker Compose.
# You can change these values to whatever you want.
DB_USER=user
DB_PASSWORD=password
DB_NAME=threat_intel_db
```

## Usage

1. Enter your Shodan API key on the API Key page.
2. On the dashboard, add IP addresses using the text input or by uploading a file.
3. View the enriched IP address information in the table.
4. Click the "View" button to see the full JSON details for an IP address.