# System Architecture

## High-Level Architecture

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
                    ┌─────────────────┐
                    │   Services      │
                    │   Layer         │
                    └─────────────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
   │ PostgreSQL  │  │    Redis    │  │  File       │
   │ Database    │  │    Cache    │  │  Storage    │
   └─────────────┘  └─────────────┘  └─────────────┘
```

## Backend Architecture

### Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  GraphQL    │  │    REST     │  │   WebSocket     │ │
│  │  Resolvers  │  │ Controllers │  │   Gateways      │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │    Auth     │  │   Users     │  │     Events      │ │
│  │   Service   │  │   Service   │  │    Service      │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Check-in   │  │Subscription │  │    QR Code      │ │
│  │   Service   │  │   Service   │  │    Service      │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Prisma    │  │    Redis    │  │   External      │ │
│  │ Repository  │  │   Client    │  │     APIs        │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ PostgreSQL  │  │    Redis    │  │   File System   │ │
│  │  Database   │  │    Cache    │  │   / S3 Bucket   │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Database Design

### Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▷│Subscription │◁────│    Club     │
│             │     │             │     │             │
│ - id        │     │ - id        │     │ - id        │
│ - email     │     │ - userId    │     │ - name      │
│ - username  │     │ - clubId    │     │ - isActive  │
│ - role      │     │ - type      │     └─────────────┘
│ - isActive  │     │ - startDate │
└─────────────┘     │ - endDate   │
        │           └─────────────┘
        │                   │
        │                   │
        ▽                   ▽
┌─────────────┐     ┌─────────────┐
│   QRCode    │     │    Event    │
│             │     │             │
│ - id        │     │ - id        │
│ - code      │     │ - name      │
│ - userId    │     │ - clubId    │
│ - subId     │     │ - startTime │
│ - isActive  │     │ - endTime   │
└─────────────┘     └─────────────┘
        │                   │
        └───────┬───────────┘
                ▽
        ┌─────────────┐
        │ CheckinLog  │
        │             │
        │ - id        │
        │ - userId    │
        │ - eventId   │
        │ - qrCodeId  │
        │ - type      │
        │ - timestamp │
        └─────────────┘
```

## Frontend Architecture

### Component Structure

```
src/
├── components/
│   ├── ui/               # Reusable UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── pages/
│   ├── index.tsx         # Landing page
│   ├── admin/            # Admin panel pages
│   ├── auth/             # Authentication pages
│   └── user/             # User dashboard pages
├── lib/
│   ├── apollo.ts         # GraphQL client setup
│   ├── auth.ts           # Authentication utilities
│   └── utils.ts          # Helper functions
├── types/                # TypeScript type definitions
├── graphql/              # GraphQL queries and mutations
└── hooks/                # Custom React hooks
```

## Mobile App Architecture

### iOS Architecture (MVVM)
```
QRCheckin/
├── App/
│   └── QRCheckinApp.swift
├── Models/               # Data models
├── Views/                # SwiftUI views
├── ViewModels/           # View models (MVVM)
├── Services/             # API and business logic
└── Utils/                # Helper utilities
```

### Android Architecture (Clean + MVVM)
```
app/src/main/java/com/qrcheckin/
├── data/
│   ├── local/            # Room database
│   ├── remote/           # API services
│   └── repository/       # Repository implementations
├── domain/
│   ├── model/            # Domain models
│   ├── repository/       # Repository interfaces
│   └── usecase/          # Use cases
├── presentation/
│   ├── ui/               # Compose UI
│   └── viewmodel/        # ViewModels
└── di/                   # Dependency injection
```

## Security Architecture

### Authentication Flow
```
Client → GraphQL API → JWT Validation → Service Layer → Database
```

### Authorization Levels
- **Admin**: Full system access
- **Staff**: QR scanning, event monitoring
- **User**: Profile management, QR code access

### Data Protection
- JWT tokens for session management
- Role-based access control (RBAC)
- Input validation and sanitization
- Encrypted password storage
- HTTPS/TLS encryption

## Deployment Architecture

### Docker Containerization
```
┌─────────────────┐
│   Load Balancer │
│     (Nginx)     │
└─────────────────┘
         │
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│  (Next.js)      │    │   (NestJS)      │
└─────────────────┘    └─────────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         │                      │                      │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │     Redis       │    │   File Storage  │
│    Database     │    │     Cache       │    │   (Optional)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Scalability Considerations

1. **Horizontal Scaling**: Multiple backend instances behind load balancer
2. **Database Optimization**: Connection pooling, query optimization
3. **Caching Strategy**: Redis for session storage and frequent queries
4. **CDN Integration**: Static asset delivery
5. **Microservices**: Modular service architecture for independent scaling