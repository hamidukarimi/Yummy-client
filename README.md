# AuthForge Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-06B6D4?logo=tailwindcss)

A clean and scalable authentication frontend starter built with React and TypeScript. Includes login, registration, protected routes, token refresh, and session management — ready to drop into any project.

---

## 🔹 Features

- ✅ Login & Registration with form validation
- ✅ JWT access token stored in `sessionStorage`
- ✅ Refresh token via `httpOnly` cookie (handled automatically)
- ✅ Silent token refresh via Axios interceptor
- ✅ Protected & public route guards
- ✅ Global auth state with Zustand
- ✅ Server state management with TanStack Query
- ✅ Schema validation with Zod + React Hook Form
- ✅ Smooth animations with Framer Motion
- ✅ Fully typed with TypeScript (strict mode)
- ✅ Feature-based scalable folder structure

---

## 🔹 Tech Stack

| Tool | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| TypeScript | Type safety (strict mode) |
| Tailwind CSS v4 | Styling |
| TanStack Query | Server state & mutations |
| Zustand | Global client state |
| Axios | HTTP client + interceptors |
| React Hook Form | Form management |
| Zod | Schema validation |
| Framer Motion | Animations |
| React Router v7 | Routing & navigation |

---

## 🔹 Project Structure

```bash
src/
├─ api/
│  ├─ axios.ts               # Axios instance + token interceptors
│  └─ endpoints.ts           # All API endpoint constants
│
├─ features/
│  ├─ auth/
│  │  ├─ components/
│  │  │  ├─ LoginForm.tsx
│  │  │  └─ RegisterForm.tsx
│  │  ├─ hooks/
│  │  │  ├─ useLogin.ts
│  │  │  └─ useRegister.ts
│  │  ├─ schemas/
│  │  │  ├─ login.schema.ts
│  │  │  └─ register.schema.ts
│  │  ├─ services/
│  │  │  └─ auth.service.ts
│  │  └─ types/
│  │     └─ auth.types.ts
│  │
│  ├─ home/
│  │  ├─ components/
│  │  │  └─ DashboardCard.tsx
│  │  └─ pages/
│  │     └─ HomePage.tsx
│  │
│  └─ user/
│     ├─ components/
│     │  └─ ChangePasswordForm.tsx
│     ├─ hooks/
│     │  └─ useChangePassword.ts
│     ├─ schemas/
│     │  └─ changePassword.schema.ts
│     ├─ services/
│     │  └─ user.service.ts
│     └─ types/
│        └─ user.types.ts
│
├─ components/
│  ├─ ui/
│  │  ├─ Button.tsx
│  │  ├─ Input.tsx
│  │  ├─ Spinner.tsx
│  │  └─ Alert.tsx
│  └─ layout/
│     ├─ Navbar.tsx
│     ├─ ProtectedRoute.tsx
│     └─ PublicRoute.tsx
│
├─ context/
│  └─ AuthContext.tsx
│
├─ hooks/
│  ├─ useAuth.ts
│  └─ useLogout.ts
│
├─ lib/
│  └─ queryClient.ts
│
├─ pages/
│  ├─ LoginPage.tsx
│  ├─ RegisterPage.tsx
│  └─ NotFoundPage.tsx
│
├─ routes/
│  └─ AppRouter.tsx
│
├─ store/
│  └─ authStore.ts
│
├─ types/
│  └─ api.types.ts
│
└─ utils/
   ├─ token.ts
   └─ errorHandler.ts
```

---

## 🔹 Getting Started

### Prerequisites

- Node.js v18+
- A running backend that supports:
  - `POST /api/users` — register
  - `POST /api/sessions` — login
  - `POST /api/token` — refresh access token (via httpOnly cookie)
  - `POST /api/logout` — logout
  - `POST /api/logout/all` — logout all devices
  - `PUT /api/users/me/password` — change password

> This frontend is designed to work with [authforge-express](https://github.com/hamidukarimi/authforge-express) but can be adapted to any backend.

### 1️⃣ Clone the repository

```bash
git clone https://github.com/hamidukarimi/authforge-client.git
cd authforge-client
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create `.env` file

```bash
VITE_API_URL=http://localhost:5000
```

### 4️⃣ Start the development server

```bash
npm run dev
```

The app runs on `http://localhost:5173` by default.

---

## 🔹 How Authentication Works

```
Login / Register
      ↓
API returns { user, accessToken }
      ↓
accessToken → sessionStorage
user → Zustand store
refreshToken → httpOnly cookie (set by backend)
      ↓
On page refresh → ProtectedRoute calls /api/token
                → new accessToken issued from cookie
                → user restored from response
      ↓
On 401 error → Axios interceptor auto-refreshes token
             → failed requests retried automatically
      ↓
On logout → token cleared, store cleared, cookie deleted
```

---

## 🔹 Key Architectural Decisions

**Feature-based structure** — each feature (`auth`, `user`, `home`) owns its own components, hooks, services, schemas, and types. Easy to scale, easy to delete.

**Axios interceptor** — handles token refresh silently. If a request fails with `401`, the interceptor calls `/api/token`, gets a new access token, and retries the original request — all without the user noticing.

**Zustand for auth state** — lightweight global state for `user` and `isAuthenticated`. No boilerplate, no context prop drilling.

**Zod as single source of truth** — form validation schemas also export their inferred TypeScript types, so there's no duplication between Zod schemas and TypeScript interfaces.

**`sessionStorage` for access token** — access tokens are cleared when the browser tab closes. Refresh tokens live in `httpOnly` cookies managed entirely by the backend.

---

## 🔹 Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of your backend API | `http://localhost:5000` |

---

## 🔹 Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

---

## 🔹 Adapting to Your Backend

To connect to a different backend:

1. Update `src/api/endpoints.ts` with your API routes
2. Update `src/types/api.types.ts` to match your user shape
3. Update `src/features/auth/types/auth.types.ts` with your payload shapes
4. Update `src/features/auth/schemas/` to match your validation rules

---

## 🔹 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

```bash
git checkout -b feature/my-feature
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

---

## 🔹 License

This project is licensed under the MIT License.
See the [LICENSE](./LICENSE) file for details.

---

## ⭐ Support

If you find this project useful, consider giving it a star ⭐ on GitHub.

Made with ❤️ by Hamid Karimi