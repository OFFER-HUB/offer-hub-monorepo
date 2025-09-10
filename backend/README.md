# 🚀 OFFER-HUB Backend

This is the backend for **OFFER-HUB**, a freelance platform powered by Supabase and Node.js. It handles user management, services, project workflows, reviews, and more — using Express and PostgreSQL.

---

## ⚙️ Technologies Used

- **Node.js**
- **Express**
- **TypeScript**
- **Supabase (PostgreSQL)**
- **ts-node**
- **dotenv**
- **CORS**

---

## 📁 Folder Structure

```
backend/
├── src/
│   ├── controller/         # Route handlers
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   └── index.ts            # App entry point
├── supabase/
│   └── migrations/         # One .sql file per DB table
├── .env.example
├── README.md
```

---

## 🔐 Environment Setup

1. Duplicate the `.env.example` file and rename it to `.env`
2. Add your Supabase credentials:

```env
# =================================
#  PORT
# ================================

PORT=4000

# =================================
#  SUPABASE
# ================================

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

```

> You can find these keys in your Supabase [dashboard](https://supabase.com/dashboard), under **Project Settings → API**.

---

## 🧪 Database Setup with Supabase

### 1. Create a Supabase Project

- Go to [https://supabase.com](https://supabase.com)
- Create a new project
- Save the project ref and password

### 2. Link Your Supabase Project

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

You’ll be asked to enter your database password.

---

### 3. Apply Migrations

Once linked, push your SQL migrations:

```bash
npx supabase db push
```

This will create all tables defined in `supabase/migrations/` in your Supabase project.

---

## 🚀 Run the Backend

### Development Mode

```bash
npm install
npm run dev
```

### Production Mode

```bash
npm run start
```

---

## ✅ Notes

- Do **not** commit your real `.env` file — it’s ignored via `.gitignore`.
- Each migration is in its own file and auto-applies via `supabase db push`.
- You must test each endpoint with the **Supabase DB** and provide **screenshots** before any pull request is approved.

---
