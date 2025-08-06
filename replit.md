# Stars Flock - Creator Platform

## Overview

Stars Flock is a full-stack creator platform that connects content creators and influencers with brands for paid collaborations. The platform features separate experiences for creators and brands, campaign management, user registration, testimonials, and a newsletter system. Built with modern web technologies, it provides both online and onsite campaign opportunities with a tiered creator system (Rising Star and Legendary Star).

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
- **Users**: Creator profiles with social media integration, follower counts, earnings tracking, and referral system
- **Campaigns**: Brand campaigns with requirements, compensation, deadlines, and participant limits
- **Applications**: Campaign application tracking with status management
- **Testimonials**: Creator testimonials with visibility controls
- **Blog Posts**: Content management for platform blog
- **Newsletter**: Email subscription management

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL storage
- **User Tiers**: Two-tier system (Rising Star, Legendary Star) with different privileges
- **Profile Validation**: Zod schemas for user registration and profile updates

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