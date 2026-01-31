# 🚀 Quick Start - UI Components

## 📦 Installation

Dependencies sudah terinstall:
```bash
npm install clsx tailwind-merge
```

## 🎯 Import Components

```tsx
// Import dari barrel export
import { 
  Card, StatCard, ActionCard, InfoCard, ActivityCard, ProductCard,
  Button, ButtonLink, IconButton, ButtonGroup,
  Badge, StatusBadge, HeroBadge, Tag, NotificationBadge,
} from '@/components/ui';

// Import utilities
import { cn, formatDate, formatCurrency, getGreeting } from '@/lib/utils';
```

## 🔥 Common Patterns

### 1. Dashboard Stats
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard icon="📦" label="Products" value={100} href="/products" />
  <StatCard icon="👥" label="Users" value={250} variant="success" />
  <StatCard icon="📩" label="Messages" value={5} variant="warning" />
</div>
```

### 2. Quick Actions Grid
```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <ActionCard icon="📦" label="Products" href="/admin/products" />
  <ActionCard icon="📰" label="News" href="/admin/news" />
  <ActionCard icon="📩" label="Messages" href="/admin/messages" />
</div>
```

### 3. Button Group
```tsx
<ButtonGroup>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
  <Button variant="danger">Delete</Button>
</ButtonGroup>
```

### 4. Form with Loading
```tsx
<form onSubmit={handleSubmit}>
  {/* form fields */}
  <Button 
    type="submit" 
    loading={isSubmitting}
    disabled={isSubmitting}
  >
    {isSubmitting ? 'Saving...' : 'Save Changes'}
  </Button>
</form>
```

### 5. Status Display
```tsx
<div className="flex items-center gap-2">
  <StatusBadge status="published" />
  <StatusBadge status="pending" />
  <StatusBadge status="rejected" />
</div>
```

### 6. Activity Feed
```tsx
<ActivityCard
  icon="📩"
  title="Recent Messages"
  viewAllHref="/messages"
  items={messages.map(msg => ({
    id: msg.id,
    title: msg.subject,
    subtitle: `from ${msg.sender} · ${formatDate(msg.createdAt)}`,
    isUnread: !msg.read,
  }))}
/>
```

### 7. Product Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {products.map(product => (
    <ProductCard
      key={product.id}
      image={product.image}
      title={product.name}
      price={formatCurrency(product.price)}
      description={product.description}
      actions={
        <>
          <Button size="sm" href={`/products/${product.id}`}>View</Button>
          <Button size="sm" variant="outline">Add to Cart</Button>
        </>
      }
    />
  ))}
</div>
```

### 8. Info Messages
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <InfoCard 
    icon="💡" 
    title="Pro Tip" 
    description="Check your inbox daily for best response time"
  />
  <InfoCard 
    icon="📊" 
    title="Statistics" 
    description={`${count} new registrations this month`}
  />
</div>
```

### 9. Notification Badge
```tsx
<button className="relative">
  <BellIcon />
  <NotificationBadge count={unreadCount} />
</button>
```

### 10. Custom Styling
```tsx
// Extend dengan Tailwind classes
<Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
  Custom styled card
</Card>

// Merge classes dengan cn()
<Button className={cn("extra-class", isActive && "active-state")}>
  Dynamic Button
</Button>
```

## 🎨 Variant Reference

### StatCard Variants
- `default` - No border color
- `warning` - Orange left border
- `info` - Blue left border  
- `success` - Green left border
- `pending` - Orange (alias for warning)
- `ongoing` - Blue (alias for info)
- `completed` - Green (alias for success)

### Button Variants
- `primary` - Brand gradient (Brown → Tan)
- `secondary` - Surface background
- `ghost` - Transparent with border
- `cta` - Bold primary gradient, rounded
- `outline` - Outlined with hover fill
- `danger` - Red gradient for destructive actions

### Badge Variants
- `default` - White/translucent
- `primary` - Brand colors
- `success` - Green
- `warning` - Orange
- `danger` - Red
- `info` - Blue
- `published` - Green (auto label)
- `draft` - Gray (auto label)
- `pending` - Orange (auto label)
- `approved` - Green (auto label)
- `rejected` - Red (auto label)

## 📱 Responsive Grid Classes

```tsx
// Mobile-first responsive grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 1 col on mobile, 2 on tablet, 4 on desktop */}
</div>

<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* 2 col on mobile, 3 on tablet, 4 on desktop */}
</div>
```

## 🔍 Type Safety Tips

```tsx
// ✅ Good - TypeScript will warn on invalid props
<StatCard 
  icon="📦"
  label="Products"
  value={100}
  variant="success" // Autocomplete shows valid options
/>

// ❌ Bad - Compile error
<StatCard variant="invalid" /> // TS Error: Type '"invalid"' is not assignable

// ✅ Good - Type-safe items
<ActivityCard
  items={[
    {
      id: 1,
      title: "Required",
      subtitle: "Required",
      // Optional: isUnread, badge
    }
  ]}
/>
```

## 🎯 When to Use Each Component

### Use `<Card>` when:
- Creating custom layouts
- Need flexible container
- Want to extend with custom styles

### Use `<StatCard>` when:
- Displaying statistics/metrics
- Dashboard overview numbers
- Clickable stats that navigate

### Use `<ActionCard>` when:
- Quick action menus
- Navigation tiles
- Icon-based shortcuts

### Use `<InfoCard>` when:
- Tips and information
- Help messages
- Non-actionable content

### Use `<ActivityCard>` when:
- Recent activity feeds
- List of items with metadata
- Need badges on items
- Empty state handling

### Use `<Button>` when:
- Form submissions
- Primary actions
- Need loading states
- Need icons with text

### Use `<ButtonLink>` when:
- Navigation that looks like button
- External links styled as buttons

### Use `<IconButton>` when:
- Icon-only actions (delete, edit, etc)
- Compact toolbars
- Must provide aria-label

## 🚨 Common Mistakes

### ❌ Don't Do This
```tsx
// Wrong - mixing old CSS classes with new components
<div className="stat-card"> {/* Old CSS class */}
  <StatCard /> {/* New component */}
</div>

// Wrong - not using type-safe variants
<Badge className="bg-green-500">Success</Badge> // Inconsistent

// Wrong - forgetting required props
<ActivityCard title="Activity" /> // Error: missing items, viewAllHref
```

### ✅ Do This
```tsx
// Right - use new components directly
<StatCard icon="📦" label="Products" value={100} />

// Right - use type-safe variants
<Badge variant="success">Success</Badge> // Consistent colors

// Right - provide all required props
<ActivityCard 
  title="Activity" 
  items={[]} 
  viewAllHref="/all"
  icon="📩"
/>
```

## 📖 Full Documentation

- **Complete Guide:** [UI_MODERNIZATION_GUIDE.md](./UI_MODERNIZATION_GUIDE.md)
- **Summary:** [UI_MODERNIZATION_SUMMARY.md](./UI_MODERNIZATION_SUMMARY.md)  
- **Visual Comparison:** [VISUAL_COMPARISON.md](./VISUAL_COMPARISON.md)

## 💬 Need Help?

1. Check TypeScript errors - props autocomplete in IDE
2. Reference [UI_MODERNIZATION_GUIDE.md](./UI_MODERNIZATION_GUIDE.md) for examples
3. Look at migrated Dashboard: `src/app/admin/dashboard/page.tsx`

---

**Happy Coding! ☕✨**
