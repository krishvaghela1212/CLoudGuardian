<<<<<<< HEAD
# CLoudGuardian
=======
# CloudGuardian AI - Sprint 1

A production-ready SaaS application utilizing the MERN stack with JWT authentication and a TailwindCSS UI.

## Project Structure

- `/server` - Backend Node.js & Express application
- `/client` - Frontend React application created with Vite

## Prerequisites

- Node.js (v16 or higher)
- MongoDB running locally (default: `mongodb://127.0.1.1:27017/cloudguardian`)

## Installation

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```

## Features

- **Authentication**: JWT-based login and registration, passwords hashed with bcrypt.
- **Protected Routes**: React router protected routes that require a valid JWT.
- **MVC Architecture**: Backend organized into controllers, routes, models, and middleware.
- **Global Error Handling**: Standardized API response format for all backend routes.
- **Modern UI**: Built with React, Vite, Tailwind CSS, and Lucide Icons.
>>>>>>> a6ae1f1 (Setup Done !)
