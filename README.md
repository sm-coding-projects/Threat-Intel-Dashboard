# Threat Intel Platform

This is a simple threat intelligence platform that uses the Shodan API to enrich IP addresses.

## Features

- Add IP addresses from text or file.
- View enriched IP address information from Shodan.
- API key validation and storage.
- View full JSON details for each IP address.

## Setup

1. Clone the repository.
2. Create a `.env` file in the root directory.
3. Run `docker-compose up -d --build` to start the services.
4. Access the application at `http://localhost:3000`.

## Usage

1. Enter your Shodan API key on the API Key page.
2. On the dashboard, add IP addresses using the text input or by uploading a file.
3. View the enriched IP address information in the table.
4. Click the "View" button to see the full JSON details for an IP address.
