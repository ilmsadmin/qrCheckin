# Frontend Web Applications

Multi-role web applications built with Next.js, TypeScript, and Tailwind CSS for the QR Check-in B2B SaaS platform.

## 🏗️ Architecture

### Current Implementation
- **Single Application**: Unified Next.js app with role-based routing
- **Multi-Role Support**: Different interfaces for each user role
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: GraphQL subscriptions for live data

### Planned Architecture  
- **Micro-frontend**: Separate apps for each user role
- **Shared Components**: Common UI library across all apps
- **Independent Deployment**: Each app can be deployed separately

## 🎯 User Roles & Features

### System Admin Portal
**Role**: `SYSTEM_ADMIN`
**Routes**: `/admin/*`

**Features**:
- Platform overview and analytics
- Club management (create, edit, deactivate)
- System user management
- Platform-wide billing and revenue
- Technical monitoring and logs

**Current Status**: 🔄 Basic structure implemented

### Club Admin Dashboard
**Role**: `CLUB_ADMIN`  
**Routes**: `/club-admin/*`

**Features**:
- Club overview and analytics
- Customer management
- Subscription package management
- Staff user management
- Club billing and revenue tracking
- Event management

**Current Status**: 🔄 Customer management implemented

### Club Staff Interface
**Role**: `CLUB_STAFF`
**Routes**: `/staff/*`

**Features**:
- QR code scanner interface
- Customer check-in/check-out
- Event selection and management
- Real-time check-in logs
- Customer lookup and verification

**Current Status**: 🔄 Basic QR scanner implemented

### Customer Portal
**Role**: `CUSTOMER`
**Routes**: `/customer/*`

**Features**:
- Subscription package browsing
- Package purchase and payment
- QR code access and display
- Check-in history
- Profile management

**Current Status**: ⏳ Planned for future implementation

## 🛠️ Technology Stack

### Core Technologies
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Apollo Client for GraphQL state
- **UI Components**: Custom component library with Radix UI

### Development Tools
- **Build Tool**: Next.js built-in bundler
- **Type Checking**: TypeScript with incremental compilation
- **Linting**: ESLint with custom rules
- **Code Formatting**: Prettier with Tailwind plugin
- **Testing**: Jest with React Testing Library

### Data Management
- **API**: GraphQL with Apollo Client
- **Caching**: Apollo Client cache with type policies
- **Real-time**: GraphQL subscriptions for live updates
- **Authentication**: JWT tokens with automatic refresh

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- Backend API running on port 4000
- Valid authentication tokens

### Installation
```bash
cd frontend
npm install
```

### Environment Configuration
```bash
cp .env.example .env.local
```

Required environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_APP_ENV=development
```

### Development
```bash
npm run dev          # Start development server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Run TypeScript checking
npm run lint         # Run ESLint
npm run test         # Run tests
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (buttons, forms, etc.)
│   │   ├── layout/         # Layout components (header, sidebar, etc.)
│   │   ├── charts/         # Analytics and chart components
│   │   └── qr/             # QR-related components
│   ├── contexts/           # React contexts for state management
│   │   ├── auth/           # Authentication context
│   │   └── theme/          # Theme and UI context
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication hooks
│   │   ├── useScanner.ts   # QR scanner hooks
│   │   └── useDashboard.ts # Dashboard data hooks
│   ├── lib/                # Utilities and configurations
│   │   ├── apollo/         # Apollo Client configuration
│   │   ├── graphql/        # GraphQL queries and mutations
│   │   └── utils/          # Helper functions
│   ├── pages/              # Next.js pages (file-based routing)
│   │   ├── api/            # API routes
│   │   ├── admin/          # System admin pages
│   │   ├── club-admin/     # Club admin pages
│   │   ├── staff/          # Club staff pages
│   │   └── auth/           # Authentication pages
│   ├── styles/             # Global styles and Tailwind config
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
├── docs/                   # Component documentation
└── tests/                  # Test files
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--color-primary-50: #eff6ff;
--color-primary-500: #3b82f6;
--color-primary-900: #1e3a8a;

/* Status Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;
```

### Component Library
- **Buttons**: Primary, secondary, ghost, danger variants
- **Forms**: Input fields, selects, checkboxes, radio buttons
- **Navigation**: Sidebar, breadcrumbs, tabs, pagination
- **Data Display**: Tables, cards, badges, avatars
- **Feedback**: Alerts, toasts, modals, loading states

## 📱 Responsive Design

### Breakpoints
```css
sm: '640px'   # Mobile landscape
md: '768px'   # Tablet portrait
lg: '1024px'  # Desktop
xl: '1280px'  # Large desktop
2xl: '1536px' # Extra large desktop
```

### Mobile-First Approach
- All interfaces optimized for mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interactions and navigation
- Responsive tables and data visualization

## 🔐 Authentication & Security

### Role-Based Access Control
```typescript
// Route protection example
function ProtectedRoute({ children, allowedRoles }: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }
  
  return <>{children}</>;
}
```

### Security Features
- JWT token automatic refresh
- Role-based route protection
- CSRF protection on forms
- Input validation and sanitization
- Secure API communication (HTTPS only in production)

## 📊 Performance Optimization

### Next.js Features
- **Static Generation**: Pre-rendered pages for better performance
- **Image Optimization**: Automatic image optimization and lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Analysis**: Regular bundle size monitoring

### GraphQL Optimization
- **Query Batching**: Multiple queries in single request
- **Caching Strategy**: Intelligent cache invalidation
- **Subscription Management**: Efficient real-time data handling

## 🧪 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Hook testing with React Hooks Testing Library
- Utility function testing with Jest

### Integration Tests
- API integration testing
- Authentication flow testing
- User journey testing

### E2E Tests (Planned)
- Critical user flows
- Cross-browser compatibility
- Mobile responsiveness

## 🚀 Deployment

### Build Process
```bash
npm run build    # Creates optimized production build
npm run start    # Starts production server
```

### Environment Variables
```env
# Production Environment
NEXT_PUBLIC_API_URL=https://api.qrcheckin.com
NEXT_PUBLIC_GRAPHQL_URL=https://api.qrcheckin.com/graphql
NEXT_PUBLIC_APP_ENV=production
```

### Hosting Options
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative with good Next.js support
- **Docker**: Containerized deployment option
- **CDN**: Static assets served via CDN

## 🔮 Future Enhancements

### Planned Features
- **Micro-frontend Architecture**: Split into separate deployable apps
- **PWA Support**: Offline capabilities and app-like experience
- **Advanced Analytics**: Custom dashboard builder
- **Multi-language Support**: Internationalization (i18n)
- **Dark Mode**: Complete dark theme implementation
- **Advanced QR Scanner**: Web-based QR scanning with WebRTC

### Performance Improvements
- **Server-Side Rendering**: Optimized SSR for better SEO
- **Edge Computing**: Deploy to edge locations for faster response
- **Advanced Caching**: Redis-based caching strategies
- **Real-time Optimizations**: Optimistic UI updates

## 📚 Documentation

- **Component Storybook**: Interactive component documentation
- **API Documentation**: GraphQL schema and query examples
- **Design Guidelines**: UI/UX standards and patterns
- **Development Guide**: Detailed development workflows
