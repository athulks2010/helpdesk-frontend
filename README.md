# HelpDesk Admin (Angular 18)

Angular NgModule app (GeoHaul `core/` + `views/` layout) with HelpDesk Tailwind UI. **No NgRx** — AuthService + BehaviorSubject only.

## Setup

```bash
cd D:/Projects/HelpDesk/helpdesk-admin
npm install
npm start
```

- App: http://localhost:4200  
- API: http://localhost:3000 (`src/environments/environment.ts`)

Set `pusherKey` / `pusherCluster` in environment for realtime chat.

## Auth

Sanctum Bearer token in `localStorage` (`helpdesk_token`). Interceptor attaches `Authorization`; 401 clears session (no refresh flow).

## Structure

- `src/app/core` — services, guards, interceptor, api.config, pusher
- `src/app/views/theme` — dashboard shell
- `src/app/views/pages` — auth, tickets, chat, CRM, CMS, settings, …
