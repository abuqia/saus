# 📋 Biolink SaaS Documentation

## 🎯 Project Overview
BioLink SaaS platform mirip lynk.id dengan fitur lebih lengkap, built dengan Laravel 12 backend dan Next.js frontend.

## 🏗️ Architecture

### Tech Stack
**Backend:**
- Laravel 12 + Laradashboard
- MySQL Database
- Laravel Sanctum (API Authentication)
- Module-based Architecture

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/ui
- Zustand (State Management)
- Axios (HTTP Client)

### Domain Structure
```
Backend:  api.biolink-saas.com
Frontend: biolink-saas.com
```

## 📁 Project Structure

### Backend Structure
```
app/
├── Modules/
│   ├── UserManagement/     # From Laradashboard
│   ├── Settings/          # From Laradashboard
│   ├── Translation/       # From Laradashboard
│   ├── BioLinks/
│   │   ├── Entities/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Routes/
│   │   │   ├── api.php
│   │   │   └── web.php
│   │   ├── Database/
│   │   │   ├── Migrations/
│   │   │   └── Seeders/
│   │   └── Services/
│   ├── ProfilePages/
│   ├── Analytics/
│   ├── Templates/
│   ├── Billing/
│   ├── FileManager/
│   └── API/
```

### Frontend Structure
```
frontend/
├── app/
│   ├── [username]/
│   │   └── page.tsx           # Public profile page
│   ├── dashboard/
│   │   ├── page.tsx           # Dashboard main
│   │   ├── links/
│   │   │   ├── page.tsx       # Links management
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Edit link
│   │   ├── profile/
│   │   │   └── page.tsx       # Profile customization
│   │   └── analytics/
│   │       └── page.tsx       # Analytics dashboard
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── api/                   # Frontend API routes
├── components/
│   ├── ui/                    # Shadcn/ui components
│   ├── forms/                 # Form components
│   ├── layout/                # Layout components
│   ├── dashboard/             # Dashboard specific
│   └── public/                # Public profile components
├── lib/
│   ├── axios.ts               # Axios configuration
│   ├── auth.ts                # Authentication utilities
│   ├── utils.ts               # Utility functions
│   └── validations.ts         # Form validations
├── stores/
│   ├── auth-store.ts          # Authentication store
│   ├── links-store.ts         # Links management store
│   └── profile-store.ts       # Profile store
├── types/
│   ├── api.ts                 # API response types
│   ├── auth.ts                # Authentication types
│   └── components.ts          # Component prop types
└── hooks/
    ├── use-auth.ts            # Authentication hook
    ├── use-links.ts           # Links management hook
    └── use-analytics.ts       # Analytics hook
```

## 🗄️ Database Schema

### Core Tables
```sql
-- Users table (extended from Laradashboard)
ALTER TABLE users ADD COLUMN (
    username VARCHAR(100) UNIQUE,
    subscription_plan ENUM('free', 'pro', 'business') DEFAULT 'free',
    subscription_ends_at TIMESTAMP NULL,
    storage_used BIGINT DEFAULT 0
);

-- Links table
CREATE TABLE links (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(50) NULL,
    `order` INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    click_count INT DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_order (user_id, `order`)
);

-- User profiles table
CREATE TABLE user_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT NULL,
    avatar VARCHAR(500) NULL,
    template VARCHAR(50) DEFAULT 'default',
    customization JSON NULL,
    meta_title VARCHAR(255) NULL,
    meta_description TEXT NULL,
    meta_image VARCHAR(500) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics table
CREATE TABLE link_analytics (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    link_id BIGINT UNSIGNED NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    referrer VARCHAR(500) NULL,
    country VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    device_type ENUM('desktop', 'mobile', 'tablet') NULL,
    created_at TIMESTAMP NULL,
    FOREIGN KEY (link_id) REFERENCES links(id) ON DELETE CASCADE,
    INDEX idx_link_created (link_id, created_at)
);
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/logout       # User logout
GET    /api/auth/user         # Get current user
POST   /api/auth/refresh      # Refresh token
```

### BioLinks Management
```
GET    /api/links             # Get user's links
POST   /api/links             # Create new link
GET    /api/links/{id}        # Get specific link
PUT    /api/links/{id}        # Update link
DELETE /api/links/{id}        # Delete link
PUT    /api/links/order       # Update links order
```

### Profile Management
```
GET    /api/profile           # Get user profile
PUT    /api/profile           # Update profile
GET    /api/profile/{username} # Get public profile (no auth)
POST   /api/profile/avatar    # Upload avatar
```

### Analytics
```
GET    /api/analytics/overview           # Overview statistics
GET    /api/analytics/links              # Links analytics
GET    /api/analytics/geographic         # Geographic data
GET    /api/analytics/devices            # Device analytics
```

### Public APIs
```
GET    /api/public/profile/{username}    # Public profile data
POST   /api/public/click/{linkId}        # Track link click
```

## 🚀 Development Setup

### Backend Setup
```bash
# 1. Clone and setup Laravel
git clone [repository]
cd biolink-backend
composer install

# 2. Environment setup
cp .env.example .env
php artisan key:generate

# 3. Database setup
# Configure .env with database credentials
php artisan migrate
php artisan db:seed

# 4. Install Laradashboard and modules
php artisan vendor:publish --tag=laradashboard-assets
php artisan module:enable BioLinks ProfilePages Analytics

# 5. Serve application
php artisan serve
```

### Frontend Setup
```bash
# 1. Clone frontend
git clone [frontend-repo]
cd biolink-frontend

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.example .env.local
# Configure NEXT_PUBLIC_API_URL and other variables

# 4. Run development server
npm run dev
```

### Environment Variables

**Backend (.env):**
```env
APP_NAME=BioLinkSaaS
APP_ENV=local
APP_KEY=
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=biolink_saas
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:3000

STRIPE_KEY=
STRIPE_SECRET=
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔒 Security Configuration

### CORS Configuration (Backend)
```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### Rate Limiting
```php
// app/Providers/RouteServiceProvider.php
protected function configureRateLimiting()
{
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(100)->by($request->user()?->id ?: $request->ip());
    });
}
```

## 📊 Performance Optimization

### Frontend Optimizations
```typescript
// Static Generation for public profiles
export async function generateStaticParams() {
  return [{ username: 'demo' }];
}

export async function getStaticProps({ params }: { params: { username: string } }) {
  const profile = await fetchProfile(params.username);
  return { props: { profile }, revalidate: 60 };
}
```

### Backend Optimizations
```php
// Caching strategies
public function getProfile($username)
{
    return Cache::remember("profile.{$username}", 3600, function () use ($username) {
        return UserProfile::with(['links' => function($query) {
            $query->where('is_active', true)->orderBy('order');
        }])->where('username', $username)->firstOrFail();
    });
}

// Eager loading
$user->load(['links' => function($query) {
    $query->orderBy('order');
}]);
```

## 🎨 UI/UX Components

### Core Components Structure
```typescript
// components/ui/ (Shadcn/ui based)
- button.tsx
- input.tsx
- card.tsx
- dialog.tsx
- dropdown-menu.tsx
- form.tsx
- table.tsx
- tabs.tsx

// components/forms/
- link-form.tsx
- profile-form.tsx
- analytics-filters.tsx

// components/dashboard/
- stats-cards.tsx
- links-list.tsx
- quick-actions.tsx

// components/public/
- profile-header.tsx
- links-grid.tsx
- social-icons.tsx
```

## 📈 Deployment

### Backend Deployment (VPS)
```bash
# Server requirements
- PHP 8.2+
- MySQL 8.0+
- Redis (optional)
- Supervisor (for queues)

# Deployment steps
1. Clone repository
2. Composer install --no-dev
3. Setup environment variables
4. Run migrations
5. Configure web server (Nginx/Apache)
6. Setup SSL certificate
```

### Frontend Deployment (Vercel)
```bash
# Vercel configuration
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

# vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "cleanUrls": true
}
```

## 🔄 Development Workflow

### Feature Development Process
1. **Database Migration** → 2. **Backend Module** → 3. **API Routes** → 4. **Frontend Integration** → 5. **Testing**

### Git Branch Strategy
```
main          → Production ready
develop       → Development branch
feature/*     → New features
bugfix/*      → Bug fixes
release/*     → Release preparation
```

## 🧪 Testing

### Backend Tests
```bash
# Run tests
php artisan test

# Test structure
tests/
├── Feature/
│   ├── AuthTest.php
│   ├── LinksTest.php
│   └── ProfileTest.php
└── Unit/
    └── Services/
        └── LinkServiceTest.php
```

### Frontend Tests
```bash
# Run tests
npm run test

# Test structure
__tests__/
├── components/
├── pages/
└── utils/
```

## 📝 API Documentation

API documentation will be auto-generated using Laravel API Documentation Generator and available at `/api/documentation`.

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors** - Check FRONTEND_URL in .env
2. **Authentication Issues** - Verify Sanctum configuration
3. **Module Not Found** - Run `php artisan module:enable [module]`
4. **Static Generation Fails** - Check API endpoint accessibility

### Debug Mode
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

## 📞 Support

For development support:
- Backend Issues: Check Laravel logs in `storage/logs/`
- Frontend Issues: Check browser console and network tab
- Database Issues: Check query logs and migrations

---

**Last Updated:** ${new Date().toLocaleDateString()}

**Maintainer:** achmadjp
