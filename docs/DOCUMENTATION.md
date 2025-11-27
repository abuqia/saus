# SAUS Documentation

## Overview
- SAUS adalah platform Link-in-Bio SaaS modern dengan fitur advanced dan siap dikembangkan menuju roadmap di `docs/saus_features_doc.md`.
- Backend menggunakan Laravel 12 dengan Inertia.js (React) untuk rendering sisi server yang mulus.
- Database utama PostgreSQL; caching dan queues menggunakan Redis (opsional).

## Architecture
- Backend: Laravel 12, Inertia.js, Spatie Permission, Laravel Fortify (auth), Sonner (toast), Shadcn/ui (komponen UI), TailwindCSS.
- Frontend: React + TypeScript (di `backend/resources/js`), TanStack Table, Inertia router.
- Observability: Laravel Telescope/Pulse (direncanakan), Horizon (direncanakan), Activity log.

## Project Structure
```
backend/
├── app/
│   └── Http/Controllers/ (Users, Roles, Permissions, Tenants, Themes, Settings)
├── resources/js/
│   ├── layouts/app-layout.tsx
│   ├── components/ (ui, data-table, toolbar, pagination)
│   └── pages/
│       ├── users/
│       ├── roles/
│       ├── permissions/
│       ├── tenants/
│       ├── themes/
│       └── settings/
├── database/
│   ├── migrations/ (roles: label, description; permissions: description)
│   └── seeders/RoleAndPermissionSeeder.php
└── routes/web.php (Inertia pages & actions)
```

## Core Features (Planned & In Progress)
- AI-Powered Smart Features: smart link optimization, predictive analytics, auto A/B testing.
- Advanced Analytics Dashboard: real-time analytics, UTM & referrer tracking, device insights.
- Advanced Page Builder: drag & drop, templates, dynamic blocks, custom styling.
- Smart Link Management: conditional links (geo/device/time/UTM), QR, short URLs.
- E-Commerce Integration: marketplace & payment gateways.
- Marketing Automation: email/SMS/push, lead magnets, segments.
- Multi-Brand & Team Management: granular RBAC, audit trail, invitations.
- Security & Privacy: 2FA, rate limiting, backups, GDPR tooling.
- SEO & Performance: meta/OG, schema, sitemap, CDN, caching.
- Developer Tools: public API, webhooks, integrations.
- Mobile & PWA: offline mode, push.
- Content Management: blog, digital products, membership.

Detail lengkap fitur dan roadmap: lihat `docs/saus_features_doc.md`.

## Current Implementations
- User Management: listing, bulk actions, sonner confirmations.
- Role Management: index/create/edit/show; label & description pada roles; client-side search & selection.
- Permission Management:
  - Index dengan client-side filtering, guard filter, bulk delete.
  - Create/Edit dengan `description`.
  - Sync canonical permissions dengan deskripsi otomatis.
  - Manage role permissions (group by module/model, select all).

## Routes (Web)
Beberapa route penting (lihat `backend/routes/web.php` untuk lengkap):
- Users: `resource('users')`, bulk destroy, status update.
- Roles: `resource('roles')`, `roles/{role}/permissions`, `roles/{role}/sync-permissions`, bulk destroy.
- Permissions: `resource('permissions')->except(['show'])`, `permissions/bulk-destroy`, `permissions/sync`.
- Tenants, Themes, Settings, Activity Log, Backups: masing-masing resource & aksi khusus.

## Database
- Roles: kolom tambahan `label` (string, nullable) dan `description` (text, nullable).
- Permissions: kolom `description` (text, nullable); grouping bersifat fleksibel (module/group/prefix nama).
- Seeder: mengisi permissions dot-style dan backfill `description`; role Super Admin memiliki semua izin.

## UI Components
- GenericDataTable: pencarian, filter, pagination, row click, row selection, toolbar, pagination.
- Sonner: konfirmasi aksi destruktif (bulk delete, delete), sukses/gagal.
- Shadcn/ui: tombol, badge, dropdown, kartu, tabel.

## Development Setup
```bash
# Backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=RoleAndPermissionSeeder
php artisan serve

# Frontend (Inertia React berada di resources/js; dibangun dengan Vite)
npm install
npm run dev
```

### Environment
```env
APP_URL=http://localhost:8000
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=saus
DB_USERNAME=postgres
DB_PASSWORD=secret
```

## Security & Authorization
- Auth middleware: `auth`, `verified`.
- RBAC: Spatie Permission, permissions dot-style (mis. `permissions.view`).
- CSRF: gunakan `router.post` Inertia untuk aksi POST agar token terkelola otomatis.

## Roadmap Phases
- Phase 1 (Foundation): User, Roles & Permissions, Settings, Team, API structure.
- Phase 2 (Core): Page Builder, Link Management, QR, Basic Analytics, Media Library UI.
- Phase 3 (Advanced): AI Features, Advanced Analytics, Marketing Automation, E-commerce, Payment.
- Phase 4 (Scale): Multi-tenancy, White-label, Mobile Apps, API Marketplace, Enterprise.

## Troubleshooting
- 419 Page Expired: gunakan `router.post` (Inertia) alih-alih `fetch` manual.
- Column not found (group/module): controller menggunakan fallback prefix nama permission.
- Click row membuka detail saat klik actions: table menghentikan propagasi di kolom `select` dan `actions`.

## Testing & Quality
- Typecheck: `npm run types`
- Lint: `npm run lint`
- Laravel tests: `php artisan test` (tambahkan sesuai kebutuhan proyek).

## Maintainer
- achmadjp
