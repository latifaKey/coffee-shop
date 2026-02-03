# 🚀 BARIZTA Coffee - Production Ready

**Fullstack Coffee Shop Management System**

Next.js 15 • React 19 • PostgreSQL • Prisma • TypeScript

---

## 📋 Overview

BARIZTA Coffee adalah platform e-commerce dan education portal untuk coffee shop dengan teknologi modern.

### Features:
- ☕ **Public**: Digital menu, news, contact form
- 👤 **Member**: Class registration, certificates
- 🛡️ **Admin**: Full management dashboard

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jose) with bcrypt
- **Validation**: Zod
- **Styling**: Tailwind CSS 4.0

## 📦 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` dengan database credentials dan JWT secret:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/barizta"
JWT_SECRET="generate-with-crypto-randomBytes-64"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npm run seed:all
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
