# Setup Guide — Liam Gregor Portfolio

## Step 1 — Install dependencies

```bash
npm install
```

---

## Step 2 — Neon Database

1. Sign up at https://neon.tech (free)
2. Create a new project called "portfolio"
3. Copy the connection string from the dashboard
4. Go to **SQL Editor** in Neon and paste + run the contents of `db/schema.sql`

---

## Step 3 — Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project
3. Go to **APIs & Services → OAuth consent screen**
   - User type: External
   - App name: "Liam Gregor Portfolio"
   - Add your Gmail as a test user
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: Web application
   - Authorized redirect URIs: `https://your-site.vercel.app/api/auth/callback`
   - (Also add `http://localhost:3000/api/auth/callback` for local dev)
5. Copy Client ID and Client Secret

---

## Step 4 — Vercel

1. Push this project to GitHub
2. Sign up at https://vercel.com → Import the repo
3. Go to **Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://your-site.vercel.app/api/auth/callback` |
| `JWT_SECRET` | Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL` | `lamesgregor@gmail.com` |
| `BLOB_READ_WRITE_TOKEN` | Add Vercel Blob storage in the Storage tab (auto-generated) |

4. Deploy.

---

## Local development

```bash
# Create a .env file with your variables (copy .env.example)
cp .env.example .env
# Fill in all values, then:
npm run dev
```

The site runs at http://localhost:3000.

---

## After deploy checklist

- [ ] Update Google OAuth redirect URI to your live Vercel URL
- [ ] Add your photo in `public/assets/images/` and update `index.html`
- [ ] Add your real GitHub / Telegram / LinkedIn URLs in `index.html` contact section
- [ ] Add your first project through the admin panel at `/admin`
