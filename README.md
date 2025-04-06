# Organ Finder Authentication System

A modern authentication system for the Organ Finder website using React, Node.js, TypeScript, and MySQL.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MySQL server (v5.7 or higher)

### Database Setup

1. Install MySQL server on your system if you haven't already
2. Create a new MySQL user or use an existing one
3. Update the database configuration in the `.env` file:
```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=organ_finder_db
DB_PORT=3306
```
4. Run the database initialization script:
```bash
npm run init-db
```

This will create:
- The `organ_finder_db` database if it doesn't exist
- The `users` table with necessary fields

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd organ-finder-auth
```

2. Install dependencies
```bash
npm install --legacy-peer-deps
```

3. Install client dependencies
```bash
cd src/client && npm install --legacy-peer-deps && cd ../..
```

### Development

To run both the client and server in development mode:
```bash
npm run dev
```

To run only the server:
```bash
npm run dev:server
```

To run only the client:
```bash
npm run dev:client
```

### Building for Production

To build both client and server:
```bash
npm run build
```

To start the production server:
```bash
npm start
```

## Project Structure

- `/src/components/` - React components
- `/src/server/` - Express server files
- `/src/server/config/` - Server configuration files
- `/src/server/models/` - Data models
- `/src/server/routes/` - API routes
- `/src/server/middleware/` - Express middleware
- `/public/` - Static public files

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### User
- `GET /api/user/me` - Get current user (Protected)

## Environment Variables

The following environment variables are used:
- `PORT` - Server port (default: 5001)
- `JWT_SECRET` - Secret key for JWT token generation
- `REACT_APP_API_URL` - URL for API requests from the frontend
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL user
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name
- `DB_PORT` - MySQL port

## Features

- User signup with email and password
- User login with secure authentication
- JWT token-based authentication
- Database storage with MySQL
- Protected routes with authentication middleware
- Modern UI with responsive design

## Note

This project uses in-memory storage for user data. In a production environment, you should implement a proper database solution.

## License

MIT 