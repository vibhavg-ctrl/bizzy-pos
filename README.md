# Bizzy POS 🛒

A modern, full-featured Point of Sale system built for supermarkets and retail stores. Designed and developed by **Vibhav Gupta**.

## What it does

Bizzy POS is a complete retail management system that handles everything from checkout to inventory, online orders, staff management, and business reports — all in one clean, fast interface.

### Key Features

- **POS Terminal** — Fast checkout with barcode scanning, product grid with category filters, numpad for quantity/discount, cash change calculator, and keyboard shortcuts (F2/F3/F4/F12)
- **Inventory Management** — Full product catalogue with stock tracking, low stock alerts, margin analysis, and bulk CSV import with a sample sheet
- **Online Orders** — Manage Blinkit, Zepto, Swiggy Instamart, BigBasket, and Dunzo orders from one screen with one-click status updates
- **Purchase Orders** — Create and receive goods from suppliers with automatic stock updates on GRN
- **Reports** — Download Daily Sales, GST, Product, Stock Movement, and Purchase reports in PDF, Excel, or CSV
- **Multi-outlet Support** — Switch between store locations from the top bar; each outlet has its own data
- **User & Role Management** — Add staff with 5 access roles: Admin, Manager, Cashier, Inventory Manager, and Reports Viewer
- **Real-time Sync** — Every action (checkout, stock update, user change) syncs instantly with a live indicator in the top bar
- **Settings** — Store info, billing & tax config, notifications, security (PIN/auto-lock), printing, and third-party integrations

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing fast builds
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Recharts** for analytics charts
- **Radix UI / shadcn** for accessible components
- **Sonner** for toast notifications

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Screenshots

The app includes:
- A clean white dashboard with live sales charts and low stock alerts
- A full-screen POS terminal with colourful product cards by category
- An inventory table with stock progress bars and margin percentages
- An online orders board with platform badges and one-click fulfilment
- A reports page with real downloadable PDF, Excel, and CSV files

## Made by

**Vibhav Gujrani**
GitHub: [@vibhavg-ctrl](https://github.com/vibhavg-ctrl)
