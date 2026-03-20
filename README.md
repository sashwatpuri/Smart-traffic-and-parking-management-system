# Dynamic AI Traffic Flow Optimizer & Emergency Grid

## System Overview
A comprehensive Smart Traffic Management Platform with AI-powered traffic optimization, parking management, emergency vehicle routing, and real-time monitoring.

## Features

### Admin Dashboard
- Real-time traffic monitoring with AI camera feeds
- Automated signal control based on traffic density
- Inter-signal coordination and synchronization
- Parking violation detection and fine issuance
- Emergency green corridor management
- Traffic analytics and reporting

### Citizen Dashboard
- Online parking booking and allocation
- Real-time parking availability (INR pricing)
- Illegal parking warnings
- Fine payment gateway
- Parking history and receipts

## Tech Stack
- **Frontend**: React + Vite, TailwindCSS, Recharts
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Real-time**: Socket.io
- **AI Models**: YOLOv8 (simulated)

## Project Structure
```
├── backend/          # Node.js Express API
├── frontend/         # React Dashboard
└── README.md
```

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Default Credentials

### Admin
- Email: admin@traffic.gov
- Password: admin123

### Citizen
- Email: citizen@example.com
- Password: citizen123

## Screenshots

### Admin Dashboard
Admin portal with traffic monitoring, parking management, and violation detection:

![Admin Dashboard 1](docs/screenshots/admin_portal/Screenshot%202026-03-14%20013048.png)
*Main admin dashboard with traffic signals and parking analytics*

![Admin Dashboard 2](docs/screenshots/admin_portal/Screenshot%202026-03-14%20013038.png)
*Real-time parking violation alerts and management*

![Admin Dashboard 3](docs/screenshots/admin_portal/Screenshot%202026-03-14%20013031.png)
*Traffic signal monitoring and control interface*

### Citizen Portal
Citizen dashboard for parking bookings and fine management:

![Citizen Portal 1](docs/screenshots/citizen_portal/Screenshot%202026-03-14%20012948.png)
*Parking booking interface with available spots*

![Citizen Portal 2](docs/screenshots/citizen_portal/Screenshot%202026-03-14%20012939.png)
*My bookings and parking reservations*

![Citizen Portal 3](docs/screenshots/citizen_portal/Screenshot%202026-03-14%20012926.png)
*Fine payment and traffic violation tracking*
