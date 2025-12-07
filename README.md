# taskmasterpro-fullstack

Full-stack TaskMaster Pro (Angular + Tailwind, dark mode, filters, Kanban) with .NET 8 API (JWT, EF Core, global error middleware). Includes tests, example configs, zero-cost deploy path (Vercel frontend, Railway API + Postgres), optional AWS Lambda + API GW demo, IaC refs, and CI-ready (lint/build/test).

## Run locally

Backend:
1. `cd src/TaskMasterPro.API`
2. Set env vars (override defaults): `CONNECTION_STRING`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`, `USE_LOCALSTACK=true` (optional)
3. `dotnet ef database update`
4. `dotnet run`

Frontend:
1. `cd taskmasterpro_FE`
2. `npm install`
3. `npm start`

## Config
- Copy `src/TaskMasterPro.API/appsettings.example.json` → `appsettings.json` and adjust for local dev.
- Prefer env vars in production (connection string, JWT secret, AWS, CORS).

## Tests / lint
- Backend: `cd tests/TaskMasterPro.Tests && dotnet test`
- Frontend: `cd taskmasterpro_FE && npm run test` / `npm run build`

## Notes
- Dev env auto-applies EF migrations on startup (only if relational provider).
- API docs at `/swagger` in Development.
