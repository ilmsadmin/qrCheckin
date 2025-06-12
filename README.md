# QR Check-in System

A comprehensive QR code-based check-in system for clubs and events, built with modern web technologies.

## 🚀 Project Overview

This system provides a complete solution for managing club members and event check-ins using QR code technology. It consists of a backend API, web frontend, mobile applications, and comprehensive documentation.

## 📁 Project Structure

```
qrCheckin/
├── backend/          # NestJS API with GraphQL, Prisma, PostgreSQL, Redis
├── frontend/         # Next.js web application with Tailwind CSS
├── ios-app/          # iOS mobile application (Swift/SwiftUI)
├── android-app/      # Android mobile application (Kotlin/Compose)
├── docs/             # Comprehensive project documentation
├── mock/             # Mock data and HTML design templates
├── docker-compose.yml # Docker containerization setup
└── README.md         # This file
```

## 🛠 Technology Stack

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **API**: GraphQL with Apollo Server
- **Authentication**: JWT
- **Container**: Docker

### Frontend
- **Framework**: Next.js (React + TypeScript)
- **Styling**: Tailwind CSS
- **State Management**: Apollo Client
- **API**: GraphQL

### Mobile Apps
- **iOS**: Swift/SwiftUI
- **Android**: Kotlin/Jetpack Compose

## ✨ Key Features

### 👥 User Management
- Multi-role system (Admin, Staff, User)
- User registration and authentication
- Profile management
- Role-based access control

### 📦 Subscription Package System
- Admin package creation and management
- Flexible pricing with discount options
- Feature-based package differentiation
- Member package browsing and selection
- Popular package highlighting
- Multiple subscription types (Daily, Weekly, Monthly, Yearly, Event-specific)

### 🏢 Club & Event Management
- Create and manage clubs
- Event scheduling and capacity management
- Real-time attendance tracking
- Event analytics

### 📱 QR Code System
- Auto-generated QR codes for members
- QR code scanning for check-ins/check-outs
- Real-time attendance logging
- Shareable QR codes via messages/links

### 📊 Admin Dashboard
- Comprehensive system overview
- User and club management
- Event monitoring
- Analytics and reporting

### 📱 Mobile Applications
- Staff apps for QR scanning
- Real-time sync with backend
- Offline support
- Attendance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

### Using Docker (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd qrCheckin

# Start all services
docker-compose up -d

# Access the applications
# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# GraphQL Playground: http://localhost:4000/graphql
```

### Manual Setup

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database and environment variables
npm run prisma:migrate
npm run start:dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📱 Applications

### Web Frontend (Next.js)
- **URL**: http://localhost:3000
- **Purpose**: Main website and user interface
- **Features**: Landing page, user dashboard, admin panel

### Backend API (NestJS)
- **URL**: http://localhost:4000
- **GraphQL**: http://localhost:4000/graphql
- **Purpose**: Core API and business logic
- **Features**: User auth, data management, QR code generation

### Mobile Apps
- **iOS App**: Staff QR scanning application
- **Android App**: Staff QR scanning application
- **Purpose**: QR code scanning for check-ins/check-outs

## 🏗 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Mobile Apps   │    │   Admin Panel   │
│   (Next.js)     │    │   (iOS/Android) │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   GraphQL API   │
                    │   (NestJS)      │
                    └─────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ PostgreSQL  │  │    Redis    │  │    Files    │
   │ Database    │  │    Cache    │  │   Storage   │
   └─────────────┘  └─────────────┘  └─────────────┘
```

## 👤 User Roles

### System Administrator
- Full system access
- User and club management
- System configuration
- Analytics and reporting

### Staff Member
- QR code scanning
- Member check-in/check-out
- Event monitoring
- Basic reporting

### Club Member
- Profile management
- QR code access
- Check-in history
- Subscription management

## 📖 Documentation

Detailed documentation is available in the `/docs` folder:
- [Overview](./docs/overview.md)
- [Architecture](./docs/architecture.md)
- [Getting Started](./docs/getting-started.md)
- [API Documentation](./docs/api.md)
- [Database Schema](./docs/database.md)

## 🎨 Design & Mockups

HTML mockups and design templates are available in the `/mock` folder:
- Admin dashboard mockup
- Subscription package management interface
- Member package selection interface
- QR scanner interface
- Sample data for development

## 🔧 Development

### Backend Development
```bash
cd backend
npm run start:dev    # Start development server
npm run test        # Run tests
npm run lint        # Lint code
```

### Frontend Development
```bash
cd frontend
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Lint code
```

### Database Management
```bash
cd backend
npm run prisma:studio      # Open Prisma Studio
npm run prisma:migrate     # Run migrations
npm run prisma:generate    # Generate Prisma client
```

## 🚀 Deployment

The project is containerized with Docker for easy deployment:

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact the development team or create an issue in the repository.

---

Built with ❤️ using modern web technologies
