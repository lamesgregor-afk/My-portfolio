# Portfolio Site — Liam Gregor

## Overview

Personal portfolio website with:
- Stunning GSAP scroll animations and parallax effects
- Google OAuth for visitors to leave reviews
- Admin dashboard to manage works and moderate reviews
- PostgreSQL database (Neon) for all dynamic content
- Vercel hosting (free tier)

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | HTML + CSS + Vanilla JS | Full control, no framework overhead |
| Animations | GSAP + ScrollTrigger | Smooth, performant, professional |
| Backend | Vercel Serverless Functions (Node.js) | Free, auto-scaling |
| Database | PostgreSQL on Neon | Free 0.5GB, native Vercel integration |
| Auth | Google OAuth 2.0 + JWT cookies | Free, no password management |
| File Storage | Vercel Blob | 256MB free, enough for portfolio images |
| Hosting | Vercel Hobby | Free .vercel.app domain |

---

## Pages & Sections

### Public Site (index.html)
1. **Hero** — Full-screen landing with GSAP entrance animations, name + tagline
2. **About** — "I'm Liam Gregor. I build websites, bots, and mini apps."
3. **Works** — Project cards loaded from DB, filterable by technology
4. **Reviews** — User testimonials, Google login to submit
5. **Contact** — Social links + email

### Admin Panel (admin.html)
- Login with hardcoded Gmail
- Add/edit/delete portfolio works
- Upload project images
- View and delete reviews
- Dashboard with basic stats

---

## Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE works (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  technologies TEXT[] NOT NULL DEFAULT '{}',
  image_urls TEXT[] DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) >= 10),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## API Endpoints

### Auth
| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | /api/auth/google | Redirect to Google OAuth | Public |
| GET | /api/auth/callback | Handle Google callback | Public |
| GET | /api/auth/me | Get current user | Authenticated |
| POST | /api/auth/logout | Clear session | Authenticated |

### Works
| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | /api/works | List visible works | Public |
| POST | /api/works | Create work | Admin |
| PUT | /api/works/[id] | Update work | Admin |
| DELETE | /api/works/[id] | Delete work | Admin |
| POST | /api/works/upload | Upload image | Admin |

### Reviews
| Method | Path | Description | Access |
|--------|------|-------------|--------|
| GET | /api/reviews | List all reviews | Public |
| POST | /api/reviews | Submit review | Authenticated |
| DELETE | /api/reviews/[id] | Delete review | Admin |

---

## Authentication Flow

1. User clicks "Sign in with Google"
2. Frontend redirects to `/api/auth/google`
3. Server redirects to Google OAuth consent screen
4. User approves -> Google redirects to `/api/auth/callback`
5. Server creates/updates user in DB, generates JWT
6. JWT set as HttpOnly cookie, redirect back to site
7. Frontend calls `/api/auth/me` to check login state

Admin: `if (user.email === process.env.ADMIN_EMAIL) -> is_admin = true`

---

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=https://your-site.vercel.app/api/auth/callback
JWT_SECRET=random-64-char-string
ADMIN_EMAIL=your-gmail@gmail.com
BLOB_READ_WRITE_TOKEN=auto-generated-by-vercel
```

---

## Setup Steps

1. Create GitHub repo, push project
2. Sign up at vercel.com, import repo
3. Sign up at neon.tech, create PostgreSQL database
4. Connect Neon to Vercel via integration
5. Run schema.sql in Neon SQL Editor
6. Google Cloud Console -> OAuth 2.0 credentials
7. Set env variables in Vercel dashboard
8. Deploy

---

## Animation Plan (GSAP + ScrollTrigger)

### Hero
- Text reveal with letter stagger
- Parallax floating geometric shapes
- Bouncing scroll indicator

### About
- Fade + slide from left on scroll
- Skills icons stagger in
- Parallax decorative elements

### Works
- Cards scale 0.85 -> 1.0 on viewport enter
- Hover lift + shadow
- Image parallax within cards

### Reviews
- Alternating left/right slide in
- Star ratings animate sequentially

### Contact
- Icons bounce in with elastic easing
- Gradient background shift

---

## Implementation Phases

### Phase 1: Static Frontend + Animations
- HTML sections with semantic markup
- CSS: layout, typography, colors, responsive
- GSAP animations for all sections
- Mobile/tablet/desktop testing

### Phase 2: Backend API
- Node.js project with Neon client (@neondatabase/serverless)
- Google OAuth (4 endpoints)
- Works CRUD (5 endpoints)
- Reviews CRUD (3 endpoints)
- Auth + admin middleware

### Phase 3: Integration
- Wire works section to API
- Reviews display + submit
- Google login + user state
- Admin panel functionality
- Image upload flow

### Phase 4: Polish
- Loading states, skeletons
- Error handling, toasts
- SEO + Open Graph
- Lazy loading
- Deploy
