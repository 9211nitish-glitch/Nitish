# TaskFlow - Admin/User Task Management Platform

## Overview

TaskFlow is a comprehensive admin/user task management platform where admins can post tasks with file uploads (up to 1GB per file), assign them to users, and manage reviews. Users can accept/skip tasks, submit work with file uploads, and earn through a 5-level referral system (10%, 5%, 4%, 3%, 2%). The platform includes wallet functionality for earnings tracking, withdrawal requests, transaction management, and a complete authentication system with bcrypt password hashing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **Styling**: Tailwind CSS with shadcn/ui component library using the "new-york" theme
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **3D Graphics**: Three.js for interactive visual effects and particle systems
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with Express routes
- **Development**: Hot module replacement with Vite integration
- **Error Handling**: Centralized error middleware with structured error responses
- **Logging**: Custom request/response logging middleware for API endpoints

### Data Storage Solutions
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple

### Database Schema Design
- **Users**: User profiles with authentication, admin privileges, wallet tracking, and referral codes
- **Tasks**: Admin-created tasks with file attachments, compensation, deadlines, and assignment limits
- **Task Assignments**: Assignment tracking between users and tasks with status management (pending, accepted, submitted, approved, rejected)
- **Wallets**: User wallet tracking with balance, total earned, and total withdrawn
- **Wallet Transactions**: Transaction history for payments, referral bonuses, and withdrawals
- **Withdrawal Requests**: User withdrawal requests with admin approval workflow
- **Referrals**: 5-level referral system tracking with commission rates (10%, 5%, 4%, 3%, 2%)

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL storage and bcrypt password hashing
- **User Roles**: Two-tier system (Admin, User) with different privileges and dashboard access
- **Profile Validation**: Zod schemas for user registration, login, and task management
- **File Upload Security**: Object storage integration with 1GB file upload limits

### Component Architecture
- **Design System**: Consistent component library with variant-based styling
- **Responsive Design**: Mobile-first approach with breakpoint-based layouts
- **Animation System**: CSS animations with intersection observer for scroll-triggered effects
- **3D Components**: Modular Three.js components for enhanced visual experience

### Development Workflow
- **Build System**: Vite for frontend, esbuild for backend bundling
- **Type Safety**: Full TypeScript coverage across frontend, backend, and shared schemas
- **Code Organization**: Monorepo structure with shared types and utilities
- **Asset Management**: Vite asset processing with path resolution

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **CDN**: Unsplash for placeholder imagery
- **Development**: Replit development environment with live preview

### UI and Styling
- **Component Library**: Radix UI for accessible component primitives
- **Styling Framework**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Animations**: Class Variance Authority for component variants

### Data and State Management
- **API Client**: Native fetch with React Query for caching and synchronization
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Validation**: Zod for runtime type validation and schema parsing
- **Date Handling**: date-fns for date manipulation and formatting

### Development Tools
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Database Tools**: Drizzle Kit for schema management and migrations
- **Development Utilities**: tsx for TypeScript execution, nanoid for ID generation
- **Error Handling**: Replit-specific error overlay for development