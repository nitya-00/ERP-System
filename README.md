# School ERP

The codebase is intentionally separated into two workspaces:

- `frontend/` — the React/Vite ERP interface
- `backend/` — the backend architecture contract and future API service

For this first phase, the frontend continues to use mock data. The recommended
backend structure, module responsibilities, security rules, and first API slice
are documented in [backend/README.md](backend/README.md). Start the UI with:

```bash
cd frontend
npm run dev
```
