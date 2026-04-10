# BlogSpace Frontend

React + Vite frontend for the BlogSpace app.

## Run Locally

1. Start the backend on `http://localhost:4005`
2. Install frontend dependencies:
```bash
npm install
```
3. Start the React app:
```bash
npm run dev
```

## Structure

- `src/components` reusable UI blocks
- `src/pages` route-level screens
- `src/layouts` shared app shell
- `src/services` API integration
- `src/context` auth state and session handling
- `src/styles` application theme

## Pages

- `/` Home
- `/login` Login
- `/signup` Signup
- `/posts/:id` Post details
- `/admin` Admin dashboard
