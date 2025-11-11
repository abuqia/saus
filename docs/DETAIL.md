## 🗂️ Rencana & Struktur

### **Repository Structure:**
```bash
# 🏆 REKOMENDASI: Monorepo di b:\PROJECTS\my-bio
my-bio/
├── backend/          # Laravel 12 + Laradashboard
├── frontend/         # Next.js 14 + TypeScript
├── docker/           # Docker config (optional)
└── README.md         # Project documentation
```

**Alasan:** Lebih mudah untuk development, sharing code, dan deployment coordination.

### **Module System:**
```bash
# ✅ REKOMENDASI: nwidart/laravel-modules
composer require nwidart/laravel-modules
```

**Alasan:** Sudah terintegrasi baik dengan Laravel, documentation lengkap, dan support Laravel 12.

## 🔐 Backend (Laravel 12)

### **Autentikasi:**
```env
# .env
SESSION_DOMAIN=.biolink-saas.test
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,biolink-saas.com
```

```php
// config/cors.php
'allowed_origins' => ['http://localhost:3000', 'https://biolink-saas.com'],
'supports_credentials' => true,
```

**Rekomendasi:** Sanctum dengan **cookie-based** untuk security yang lebih baik.

### **Email & Security:**
```bash
# ✅ AKTIFKAN: Email verification & password reset
php artisan make:notification VerifyEmail
php artisan make:notification ResetPassword
```

**Rekomendasi:** Aktifkan dari awal untuk production readiness.

### **File Storage:**
```php
// config/filesystems.php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],

// Validation rules
'avatar' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // 2MB max
'file' => 'file|mimes:pdf,doc,docx,txt|max:102400', // 100MB max
```

**Rekomendasi:** Local storage dulu, S3 nanti saat scale.

### **Billing:**
```php
// 🎯 REKOMENDASI: Stripe stub dulu
// Buat interface untuk mudah switch nanti

interface PaymentGateway {
    public function createSubscription($user, $plan);
    public function cancelSubscription($user);
}

class StripeService implements PaymentGateway {
    // Implementation nanti
}

class MockPaymentService implements PaymentGateway {
    // Untuk development
}
```

### **Analytics:**
```php
// ✅ REKOMENDASI: IP geolocation gratis dulu
public function getLocationData($ip) {
    if ($ip === '127.0.0.1') return null;
    
    // Free service: ipapi.co (1000 requests/hari gratis)
    $response = Http::get("http://ipapi.co/{$ip}/json/");
    return $response->json();
}
```

**Privacy:** Tambah consent banner nanti untuk GDPR compliance.

## 🗄️ Database & Model

### **Links Order:**
```php
// Migration
$table->integer('order')->default(0);

// Service method
public function setLinkOrder($userId, $linkId, $newOrder) {
    // Reorder logic di service
    DB::transaction(function() use ($userId, $linkId, $newOrder) {
        // Update order numbers
    });
}
```

**Rekomendasi:** Biarkan 0, handle reordering di service layer.

### **Reserved Usernames:**
```php
// config/reserved.php
return [
    'reserved_usernames' => [
        'admin', 'api', 'dashboard', 'auth', 'login', 'register',
        'profile', 'settings', 'billing', 'analytics', 'help',
        'support', 'blog', 'docs', 'api-docs', 'adminer', 'horizon',
        'telescope', 'log-viewer', 'storage', 'assets', 'css', 'js',
        'img', 'images', 'static', 'media', 'files'
    ]
];

// Validation rule
'username' => [
    'required',
    'string',
    'alpha_dash',
    'min:3',
    'max:30',
    'unique:users',
    'not_in:'.implode(',', config('reserved.usernames'))
]
```

### **Seeders:**
```php
// ✅ REKOMENDASI: Buat demo data
php artisan make:seeder DemoUserSeeder

// DatabaseSeeder.php
public function run() {
    $this->call([
        DemoUserSeeder::class,
    ]);
}
```

**Demo data:** 2 users (free & pro), 5-10 links each.

## ⚡ Frontend (Next.js 14 App Router)

### **Public Profile Page:**
```typescript
// app/[username]/page.tsx
export const revalidate = 60; // ISR every 60 seconds

export async function generateStaticParams() {
  // Pre-generate popular profiles
  return [{ username: 'demo' }];
}

export async function generateMetadata({ params }: { params: { username: string } }) {
  const profile = await fetchProfile(params.username);
  
  return {
    title: profile.meta_title || `${profile.username} - BioLinks`,
    description: profile.meta_description || profile.bio,
    openGraph: {
      images: [profile.meta_image || profile.avatar],
    },
  };
}

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const profile = await fetchProfile(params.username);
  
  return <ProfileView profile={profile} />;
}
```

### **Branding & UI:**
```typescript
// 🎨 REKOMENDASI: Shadcn/ui dengan custom theme
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        500: '#3b82f6', // Blue
        900: '#1e3a8a',
      }
    },
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
    }
  }
}

// Install shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input form // etc
```

**Rekomendasi:** 
- **Warna:** Blue primary (profesional)
- **Font:** Inter (modern & readable)
- **Tema:** Light mode dulu, dark mode nanti

### **Auth Flow:**
```typescript
// ✅ REKOMENDASI: Email/password dulu
// components/auth/login-form.tsx
"use client";
import { useForm } from "react-hook-form";

export function LoginForm() {
  // Simple form implementation
  return (
    <Form>
      <Input name="email" type="email" />
      <Input name="password" type="password" />
      <Button type="submit">Login</Button>
    </Form>
  );
}
```

**Social login:** Tambahkan nanti (Google/OAuth) setelah MVP.

### **State Management:**
```typescript
// 🏗️ REKOMENDASI: Modular stores
// stores/auth-store.ts
interface AuthStore {
  user: User | null;
  login: (credentials: LoginData) => Promise<void>;
  logout: () => void;
}

// stores/links-store.ts
interface LinksStore {
  links: Link[];
  addLink: (link: CreateLinkData) => Promise<void>;
  reorderLinks: (links: Link[]) => Promise<void>;
}

// stores/profile-store.ts
interface ProfileStore {
  profile: UserProfile | null;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}
```

## 🚀 Deployment & DevOps

### **Domain Strategy:**
```bash
# 🎯 REKOMENDASI: Development dulu, domain nanti
Development:
- Backend: http://localhost:8000
- Frontend: http://localhost:3000

Production Planning:
- Backend: api.biolink-saas.com
- Frontend: biolink-saas.com
```

### **CI/CD:**
```yaml
# ✅ REKOMENDASI: Setup basic CI dari awal
# .github/workflows/laravel.yml
name: Laravel CI

on:
  push:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install dependencies
        run: composer install --prefer-dist --no-progress
      - name: Execute tests
        run: vendor/bin/phpunit
```

### **Queue & Supervisor:**
```bash
# ❌ TUNDA DULU: No queues for MVP
# Focus on synchronous operations first
# Add queues later for:
# - Email sending
# - Analytics processing
# - File optimization
```

## 🎯 Immediate Action Plan:

### **Hari 1-2: Setup Foundation**
```bash
# Backend
composer create-project laravel/laravel backend
cd backend
composer require nwidart/laravel-modules laravel/sanctum

# Frontend
npx create-next-app@latest frontend --typescript --tailwind --eslint --app
cd frontend
npx shadcn@latest init
```

### **Hari 3-5: Core Modules**
```bash
php artisan module:make BioLinks
php artisan module:make ProfilePages
php artisan module:make Analytics
```

### **Hari 6-7: Integration**
- Setup authentication flow
- Create basic frontend pages
- Implement link CRUD