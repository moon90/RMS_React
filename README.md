# RMS React Frontend

The primary administrative and Point of Sale (POS) interface for the Restaurant Management System.

## Technologies

- **Framework**: React 18+ (Vite)
- **Styling**: Tailwind CSS, CSS Modules
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: Lucide React / Custom Assets
- **Internationalization**: i18next
- **Real-time**: SignalR

## Project Structure

```text
src/
├── assets/         # Static assets, icons, and images
├── components/     # Reusable UI components (AiPulse, Card, Sidebar, etc.)
├── context/        # Global state (Auth, Layout, Permissions)
├── data/           # Static data and configuration (sidebar menus)
├── layouts/        # Page layout templates (MainLayout, POSLayout)
├── locales/        # Translation files (en, bn, es, fr)
├── pages/          # Page components (Dashboard, POS, Inventory, etc.)
├── routes/         # Routing logic and protected routes
├── services/       # API service layers
├── styles/         # Global styles
├── utils/          # Helper functions
├── App.jsx         # Main application component
└── main.jsx        # Application entry point
```

## Key Features

- **POS System**: Interactive and touch-optimized Point of Sale.
- **Voice-Activated POS**: Hands-free ordering and checkout using voice commands.
- **Inventory Management**: Real-time tracking of ingredients and stocks.
- **Kitchen Display**: Live synchronization with the kitchen.
- **AI Insights**: Pulse indicators and data trends.
- **Multi-Branch Support**: Easily switch between different branches.
- **Role-Based Access**: Granular permissions for users, staff, and admins.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
