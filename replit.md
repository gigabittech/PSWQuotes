# Overview

This is a full-stack solar quote management system for Perth Solar Warehouse. The application allows customers to request solar system quotes through a multi-step form and provides an admin dashboard for managing leads. The system handles solar power, battery storage, and EV charging product configurations with automated pricing calculations and quote generation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript SPA**: Built with Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components with Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming and responsive design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Express.js**: RESTful API server with middleware for logging, CORS, and JSON parsing
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **File Uploads**: Multer middleware for handling switchboard photo uploads
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints for quotes, products, and admin operations

## Database Design
- **Products Table**: Solar panels, batteries, and EV chargers with pricing and specifications
- **Quotes Table**: Customer quote requests with system selections and contact details
- **Quote Items Table**: Junction table for quote-product relationships
- **Schema Management**: Drizzle migrations for version-controlled database changes

## Core Features
- **Multi-step Quote Form**: Progressive form with system selection, product configuration, and customer details
- **Dynamic Pricing**: Real-time price calculations based on product selections and government rebates
- **Product Catalog**: Configurable product database with specifications and pricing
- **Admin Dashboard**: Quote management with status tracking and lead conversion
- **PDF Generation**: Automated quote document generation with company branding

## Data Flow
1. Customer selects systems (solar/battery/EV) and power supply type
2. System displays relevant products with pricing calculations
3. Customer provides property details and optional switchboard photo
4. Quote is generated and stored in database
5. PDF quote is created and emailed to customer
6. Admin can track and update quote status

# External Dependencies

## Database & Infrastructure
- **Neon Database**: PostgreSQL hosting with serverless connections
- **Drizzle ORM**: Type-safe database toolkit with migrations

## Email Services  
- **Brevo (Sendinblue)**: Transactional email service for quote delivery

## UI & Frontend Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent UI elements

## Development Tools
- **Vite**: Build tool with TypeScript support and hot module replacement
- **ESBuild**: Fast JavaScript bundler for production builds
- **TanStack Query**: Server state management with caching and synchronization

## File Processing
- **Multer**: Node.js middleware for handling multipart/form-data uploads
- **jsPDF**: Client-side PDF generation for quote documents

## Validation & Type Safety
- **Zod**: TypeScript-first schema validation for forms and API data
- **TypeScript**: End-to-end type safety across frontend and backend