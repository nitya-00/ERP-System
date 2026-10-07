# School ERP frontend

This is the Vite + React application, isolated from the backend workspace. Run
it from this directory with `npm run dev`.

## API transition plan

The UI currently uses mock state in `src/store/AppContext.tsx`. When the backend
is introduced, add this boundary without rewriting the screens:

```
frontend/
  src/
    api/          authenticated HTTP client and feature repositories
    components/   shared presentation components
    features/     feature-level screens and state
    pages/        route composition
```

First, route read-only student data through an `api/students.ts` repository behind
a `VITE_DATA_SOURCE=mock|api` setting. The frontend must only call the API; it must
never connect directly to PostgreSQL.
