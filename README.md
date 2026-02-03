# Chat Application Frontend

A modern real-time chat application built with React, TypeScript, and SignalR for instant messaging capabilities.

## Features

- **Real-time Messaging**: Instant message delivery using SignalR WebSocket connections
- **User Authentication**: Secure login and registration system
- **Message Status**: Double checkmark system for message delivery and read receipts
- **Conversation Management**: Create and manage multiple conversations
- **Modern UI**: Clean, responsive interface built with Tailwind CSS
- **Type Safety**: Full TypeScript support for robust development

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **SignalR** - Real-time bidirectional communication
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Lucide React** - Modern icon library

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running (default: `http://localhost:5078/api`)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-app-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables (optional):
```bash
# Create .env file
VITE_API_URL=http://localhost:5078/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## Project Structure

```
src/
├── features/
│   ├── auth/          # Authentication features
│   │   ├── api/       # API calls for auth
│   │   ├── components/# Auth components (Login, RequireAuth)
│   │   ├── context/   # Auth context and hooks
│   │   ├── types/     # Auth TypeScript types
│   │   └── utils/     # Config and utilities
│   └── chat/          # Chat features
│       ├── components/# Chat components (ChatWindow, MessageBubble, etc.)
│       └── ChatPage.tsx
├── hooks/             # Custom React hooks (useChatSignalR)
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Key Features Implementation

### Real-time Communication
The application uses SignalR for WebSocket-based real-time messaging. The connection is managed through the `useChatSignalR` hook, enabling instant message delivery and status updates.

### Authentication
Protected routes are implemented using the `RequireAuth` component, ensuring only authenticated users can access the chat interface.

### Message Status
Messages display delivery and read status using a double checkmark system, updated in real-time through SignalR events.

## Configuration

### API Base URL
Configure the backend API URL using the `VITE_API_URL` environment variable. If not set, it defaults to `http://localhost:5078/api`.

### Tailwind CSS
Tailwind CSS v4 is configured with Vite plugin for optimal performance and development experience.

## Development

### Code Quality
The project uses ESLint for code quality and consistency. Run `npm run lint` to check for issues.

### Type Checking
TypeScript is configured with strict mode for maximum type safety. Run `npm run build` to check for type errors.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory, ready for deployment.

