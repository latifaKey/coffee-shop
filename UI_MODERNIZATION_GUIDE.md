# 🎨 UI Modernization Guide - BARIZTA Coffee

## 📋 Overview

Dokumentasi ini menjelaskan bagaimana menggantikan CSS manual di `globals.css` dengan komponen React reusable yang menggunakan Tailwind CSS v4 utilities.

---

## 🎯 Keuntungan Migrasi

### Sebelum (CSS Manual)
❌ **1800+ baris CSS custom**  
❌ Duplikasi style di berbagai file  
❌ Sulit maintenance dan konsistensi  
❌ Bundle size besar  
❌ Tidak reusable  

### Sesudah (Tailwind Components)
✅ **Komponen reusable & type-safe**  
✅ Tailwind utilities (JIT compilation)  
✅ Konsistensi design system  
✅ Bundle size optimal  
✅ Mudah maintenance  

---

## 📦 Komponen UI yang Tersedia

### 1. **Card Components** (`components/ui/Card.tsx`)

#### `<Card>` - Base Card Component
```tsx
import { Card } from '@/components/ui';

// Basic usage
<Card>Content here</Card>

// With variants
<Card variant="glass">Glass effect</Card>
<Card variant="gradient">Gradient background</Card>
<Card variant="default">Default style</Card>

// Disable hover effect
<Card hover={false}>No hover animation</Card>
```

#### `<StatCard>` - Dashboard Statistics
```tsx
import { StatCard } from '@/components/ui';

<StatCard 
  icon="📦"
  label="Total Produk"
  value={100}
  href="/admin/products"
  variant="success"
/>

// Variants: default, warning, info, success, pending, ongoing, completed
```

**Menggantikan CSS:**
```css
/* LAMA - globals.css */
.stat-card {
  background: var(--member-bg-gradient);
  border: 1px solid var(--member-border);
  /* ... 20+ baris CSS */
}
```

**Menjadi:**
```tsx
/* BARU - Component */
<StatCard icon="📦" label="Total Produk" value={100} />
```

#### `<ActionCard>` - Quick Actions Menu
```tsx
import { ActionCard } from '@/components/ui';

<ActionCard 
  icon="📦"
  label="Kelola Produk"
  href="/admin/products"
/>
```

#### `<InfoCard>` - Info Tips & Messages
```tsx
import { InfoCard } from '@/components/ui';

<InfoCard
  icon="💡"
  title="Tips Admin"
  description="Periksa pesan masuk secara berkala"
/>
```

#### `<ActivityCard>` - Recent Activities
```tsx
import { ActivityCard } from '@/components/ui';

<ActivityCard
  icon="📩"
  title="Pesan Terbaru"
  viewAllHref="/admin/messages"
  emptyMessage="Tidak ada pesan"
  items={[
    {
      id: 1,
      title: "Subject pesan",
      subtitle: "dari User · 1 Jan 2026",
      isUnread: true,
      badge: {
        text: "published",
        variant: "published"
      }
    }
  ]}
/>
```

#### `<ProductCard>` - Product Showcase
```tsx
import { ProductCard } from '@/components/ui';

<ProductCard
  image="/images/product.jpg"
  title="BARIZTA Signature"
  price="Rp 45.000"
  description="Premium coffee blend"
  tone="noir"
  actions={
    <>
      <Button size="sm">Lihat Detail</Button>
      <Button size="sm" variant="outline">Tambah</Button>
    </>
  }
/>
```

---

### 2. **Button Components** (`components/ui/Button.tsx`)

#### `<Button>` - Primary Button Component
```tsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="cta">Call to Action</Button>
<Button variant="outline">Outline</Button>
<Button variant="danger">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// With icon
<Button icon={<Icon />}>With Icon</Button>

// Loading state
<Button loading>Loading...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

**Menggantikan CSS:**
```css
/* LAMA - globals.css */
.btn--primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-2));
  color: white;
  /* ... 15+ baris CSS */
}
```

**Menjadi:**
```tsx
/* BARU - Component */
<Button variant="primary">Submit</Button>
```

#### `<ButtonLink>` - Link styled as Button
```tsx
import { ButtonLink } from '@/components/ui';

<ButtonLink href="/products" variant="primary">
  View Products
</ButtonLink>
```

#### `<IconButton>` - Icon Only Button
```tsx
import { IconButton } from '@/components/ui';

<IconButton 
  icon={<TrashIcon />}
  variant="danger"
  ariaLabel="Delete item"
/>
```

#### `<ButtonGroup>` - Group Multiple Buttons
```tsx
import { ButtonGroup } from '@/components/ui';

<ButtonGroup>
  <Button>Edit</Button>
  <Button variant="danger">Delete</Button>
</ButtonGroup>

// Vertical
<ButtonGroup orientation="vertical">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</ButtonGroup>
```

---

### 3. **Badge Components** (`components/ui/Badge.tsx`)

#### `<Badge>` - Basic Badge
```tsx
import { Badge } from '@/components/ui';

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// With dot indicator
<Badge variant="success" dot>Active</Badge>
```

#### `<StatusBadge>` - Auto Status Badge
```tsx
import { StatusBadge } from '@/components/ui';

// Auto warna & label based on status
<StatusBadge status="active" />
<StatusBadge status="pending" />
<StatusBadge status="approved" />
<StatusBadge status="rejected" />
<StatusBadge status="published" />
<StatusBadge status="draft" />
```

#### `<HeroBadge>` - Hero Section Badge
```tsx
import { HeroBadge } from '@/components/ui';

<HeroBadge>NEW PRODUCT</HeroBadge>
```

#### `<Tag>` - Content Tag
```tsx
import { Tag } from '@/components/ui';

<Tag variant="light">Coffee</Tag>
<Tag variant="dark">Premium</Tag>

// Removable tag
<Tag removable onRemove={() => console.log('removed')}>
  Filter: Active
</Tag>
```

#### `<NotificationBadge>` - Notification Counter
```tsx
import { NotificationBadge } from '@/components/ui';

<div className="relative">
  <BellIcon />
  <NotificationBadge count={5} />
</div>

// With max limit
<NotificationBadge count={150} max={99} /> // Shows "99+"
```

#### `<CategoryBadge>` - Product Category
```tsx
import { CategoryBadge } from '@/components/ui';

<CategoryBadge category="Coffee" icon="☕" />
```

---

## 🔧 Utility Functions (`lib/utils.ts`)

### `cn()` - Classname Merger
```tsx
import { cn } from '@/lib/utils';

// Combine classnames
<div className={cn("base-class", isActive && "active-class", className)} />

// Merge Tailwind classes (prevents conflicts)
<div className={cn("p-4", "p-6")} /> // Result: p-6
```

### `formatCurrency()`
```tsx
import { formatCurrency } from '@/lib/utils';

formatCurrency(45000) // "Rp 45.000"
```

### `formatDate()` & `formatDateTime()`
```tsx
import { formatDate, formatDateTime } from '@/lib/utils';

formatDate(new Date()) // "31 Jan 2026"
formatDateTime(new Date()) // "31 Jan 2026, 14:30"
```

### `getGreeting()`
```tsx
import { getGreeting } from '@/lib/utils';

getGreeting() // "Selamat Pagi" / "Selamat Siang" / etc
```

### `truncate()`
```tsx
import { truncate } from '@/lib/utils';

truncate("Long text here...", 20) // "Long text here..."
```

---

## 🔄 Contoh Migrasi - Dashboard Admin

### ❌ SEBELUM (CSS Manual)

```tsx
// src/app/admin/dashboard/page.tsx (LAMA)
<div className="stats-grid">
  <Link href="/admin/products" className="stat-card">
    <div className="stat-icon">📦</div>
    <div className="stat-info">
      <span className="stat-number">{stats.totalProducts}</span>
      <span className="stat-label">Total Produk</span>
    </div>
  </Link>
  {/* ... 20+ baris HTML repetitive */}
</div>

<div className="quick-actions">
  <Link href="/admin/products" className="action-card">
    <span className="action-icon">📦</span>
    <span className="action-label">Kelola Produk</span>
  </Link>
  {/* ... 15+ baris HTML repetitive */}
</div>
```

**CSS Dependencies:**
```css
/* shared-admin.css - 100+ baris CSS */
.stat-card { /* ... */ }
.stat-card:hover { /* ... */ }
.stat-card.warning { /* ... */ }
.stat-icon { /* ... */ }
.stat-info { /* ... */ }
.action-card { /* ... */ }
/* dll... */
```

---

### ✅ SESUDAH (Tailwind Components)

```tsx
// src/app/admin/dashboard/page.tsx (BARU)
import { StatCard, ActionCard, InfoCard, ActivityCard } from '@/components/ui';
import { getGreeting, formatDate } from '@/lib/utils';

export default async function AdminDashboard() {
  const { stats, recentMessages, recentNews } = await getDashboardData();

  return (
    <div className="admin-dashboard">
      {/* Stats Grid - Clean & Reusable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon="📦"
          label="Total Produk"
          value={stats.totalProducts}
          href="/admin/products"
        />
        <StatCard 
          icon="📰"
          label="Berita Aktif"
          value={stats.activeNews}
          variant="info"
          href="/admin/news"
        />
        <StatCard 
          icon="📩"
          label="Pesan Baru"
          value={stats.unreadMessages}
          variant="warning"
          href="/admin/messages"
        />
      </div>

      {/* Quick Actions - Simple & Clean */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ActionCard icon="📦" label="Kelola Produk" href="/admin/products" />
        <ActionCard icon="📰" label="Kelola Berita" href="/admin/news" />
        <ActionCard icon="📩" label="Pesan Masuk" href="/admin/messages" />
      </div>

      {/* Activities - Type-safe & Auto-formatted */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ActivityCard
          icon="📩"
          title="Pesan Terbaru"
          viewAllHref="/admin/messages"
          items={recentMessages.map(msg => ({
            id: msg.id,
            title: msg.subject,
            subtitle: `dari ${msg.name} · ${formatDate(msg.createdAt)}`,
            isUnread: !msg.isRead,
          }))}
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard
          icon="💡"
          title="Tips Admin"
          description="Periksa pesan masuk secara berkala"
        />
      </div>
    </div>
  );
}
```

**CSS Dependencies:** ✨ **NONE!** Semua styling menggunakan Tailwind utilities.

---

## 📊 Perbandingan

| Aspek | CSS Manual | Tailwind Components |
|-------|-----------|-------------------|
| **Lines of Code** | ~300 baris | ~80 baris |
| **CSS Dependencies** | 1800+ baris CSS | 0 baris CSS |
| **Type Safety** | ❌ No types | ✅ Full TypeScript |
| **Reusability** | ❌ Copy-paste | ✅ Import component |
| **Consistency** | ⚠️ Manual | ✅ Auto consistent |
| **Bundle Size** | ⚠️ Large | ✅ JIT optimized |
| **Maintenance** | ❌ Hard | ✅ Easy |

---

## 🚀 Migration Checklist

### Phase 1: Setup ✅
- [x] Install `clsx` dan `tailwind-merge`
- [x] Create `lib/utils.ts` dengan `cn()` function
- [x] Create `components/ui/Card.tsx`
- [x] Create `components/ui/Button.tsx`
- [x] Create `components/ui/Badge.tsx`
- [x] Create `components/ui/index.ts` barrel export

### Phase 2: Migrate Pages
- [x] ✅ Migrate `/admin/dashboard` - **DONE** (Contoh di atas)
- [ ] ⏳ Migrate `/member/dashboard`
- [ ] ⏳ Migrate `/admin/products`
- [ ] ⏳ Migrate `/admin/news`
- [ ] ⏳ Migrate `/admin/messages`
- [ ] ⏳ Migrate public pages (hero, menu, about)

### Phase 3: Cleanup
- [ ] Remove unused CSS dari `globals.css`
- [ ] Remove unused CSS dari `shared-admin.css`
- [ ] Remove unused CSS dari `dashboard.css`
- [ ] Test all pages
- [ ] Bundle size audit

---

## 💡 Best Practices

### 1. Import dari Index
```tsx
// ✅ GOOD - Single import
import { StatCard, ActionCard, Button } from '@/components/ui';

// ❌ BAD - Multiple imports
import { StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
```

### 2. Use Type-Safe Props
```tsx
// ✅ GOOD - TypeScript akan warning jika salah
<StatCard variant="success" /> // OK
<StatCard variant="invalid" /> // Error!

// ❌ BAD - CSS classes prone to typos
<div className="stat-card sucess" /> // Typo, no warning!
```

### 3. Compose Components
```tsx
// ✅ GOOD - Compose untuk custom needs
<Card className="p-6 bg-gradient-to-br from-blue-500 to-purple-600">
  <h3>Custom Card</h3>
  <p>With custom styling</p>
</Card>

// Tailwind akan merge classnames dengan benar
```

### 4. Extend Components
```tsx
// Buat variant baru jika perlu
export function DangerCard({ children, ...props }: CardProps) {
  return (
    <Card 
      className="border-red-500 bg-red-500/10" 
      {...props}
    >
      {children}
    </Card>
  );
}
```

---

## 🎨 Design System Tokens

Komponen-komponen ini sudah menggunakan BARIZTA design tokens:

```tsx
// Colors
--primary: #8B4513 (Brown)
--primary-2: #D2B48C (Tan)
--accent: #5A7A5A (Green)
--danger: #EF4444 (Red)

// Text
--text: #F7F2EE (Light)
--muted: #B6B3AC (Gray)

// Backgrounds
--bg: #1D1714 (Dark)
--surface: #26201D (Surface)
--glass: rgba(255,255,255,.06)

// Effects
--radius: 16px
--shadow: 0 10px 30px rgba(0,0,0,.35)
```

Semua ini sudah ter-integrasi di komponen!

---

## 📚 Additional Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/)
- [clsx Documentation](https://github.com/lukeed/clsx)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)

---

## 🤝 Contributing

Jika membuat komponen UI baru:
1. Tambahkan di `components/ui/[ComponentName].tsx`
2. Export di `components/ui/index.ts`
3. Tambahkan dokumentasi di file ini
4. Pastikan type-safe dengan TypeScript
5. Follow BARIZTA design tokens

---

**Happy Coding! ☕✨**
