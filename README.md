# 📚 BookMind — Frontend

A modern, feature-rich online bookstore frontend built with **React 19** and **Vite**. BookMind lets users browse and search for books, manage wishlists, add items to a shopping cart, place orders, and read AI-generated book summaries — all wrapped in a sleek, animated UI.

---

## ✨ Features

| Area | Highlights |
|---|---|
| **Authentication** | Register, login, JWT access + refresh tokens with proactive refresh |
| **Book Catalog** | Browse, search, and view detailed book pages |
| **AI Summaries** | AI-powered book summaries displayed on the detail page |
| **Shopping Cart** | Add / remove books, adjust quantities, and checkout |
| **Wishlists** | Create multiple named wishlists and manage books across them |
| **Orders** | Place orders and track order history with status updates |
| **Admin Panel** | Dashboard, book CRUD, order management, and user management |

---

## 🛠 Tech Stack

- **Framework** — [React 19](https://react.dev/) (with functional components & hooks)
- **Build Tool** — [Vite 7](https://vite.dev/)
- **Routing** — [React Router v7](https://reactrouter.com/)
- **HTTP Client** — [Axios](https://axios-http.com/) with interceptors for auth
- **Icons** — [Lucide React](https://lucide.dev/)
- **Animations** — [Framer Motion](https://www.framer.com/motion/)
- **Linting** — ESLint 9 with React hooks & refresh plugins

---

## 📁 Project Structure

```
src/
├── assets/             # Static assets (images, etc.)
├── components/         # Reusable UI components
│   ├── AISummary       # AI book summary widget
│   ├── AdminLayout     # Sidebar layout for admin routes
│   ├── BookCard        # Book preview card
│   ├── Footer          # Site footer
│   └── Navbar          # Top navigation bar
├── context/            # React context providers
│   ├── AuthContext      # Authentication state & actions
│   └── CartContext      # Shopping cart state & actions
├── hooks/              # Custom React hooks
├── pages/              # Route-level page components
│   ├── Home            # Landing page
│   ├── Login / Register# Auth pages
│   ├── BookList        # Catalog with search & filters
│   ├── BookDetail      # Single book view + AI summary
│   ├── Cart            # Shopping cart
│   ├── Wishlist        # Wishlist management
│   ├── Orders          # Order history
│   └── admin/          # Admin panel
│       ├── AdminDashboard
│       ├── AdminBooks
│       ├── AdminOrders
│       └── AdminUsers
├── services/
│   └── api.js          # Axios instance, interceptors & token refresh
├── App.jsx             # Root component with routing
├── main.jsx            # Entry point
└── index.css           # Global styles
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (or yarn / pnpm)
- A running instance of the [BookMind backend API](https://github.com/Hissamr/BookMind)

### Installation

```bash
# Clone the repository
git clone https://github.com/Hissamr/BookMind-FrontEnd.git
cd BookMind-FrontEnd

# Install dependencies
npm install
```

### Environment Setup

Copy the example environment file and update the values as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Base URL for the REST API |
| `VITE_AUTH_URL` | `http://localhost:8080/api/auth` | Base URL for auth endpoints |

### Development

```bash
npm run dev
```

The app will start at **http://localhost:5173** by default.

### Production Build

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## 🔐 Authentication Flow

BookMind uses **JWT-based authentication** with automatic token management:

1. On login, the server returns an **access token** and a **refresh token**.
2. The access token is attached to every API request via an Axios request interceptor.
3. A **proactive refresh timer** renews the access token 1 minute before it expires.
4. If a request fails with `401` / `403`, a **response interceptor** automatically attempts a token refresh and replays the failed request.
5. Concurrent failing requests are queued and replayed together once the refresh succeeds.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/my-feature`
3. Commit your changes — `git commit -m "Add my feature"`
4. Push to your branch — `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open-source. See the [LICENSE](LICENSE) file for details.
