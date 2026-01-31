# 🔧 Migration Script: Update All API Routes to Use JWT

## Files yang perlu diupdate (Base64 → JWT):

### ✅ Priority 1: Critical Auth Routes
- [x] src/app/api/auth/login/route.ts - **DONE**
- [ ] src/app/api/auth/me/route.ts
- [ ] src/app/api/auth/profile/route.ts
- [ ] src/app/api/auth/change-password/route.ts

### ⚠️ Priority 2: Admin Routes
- [ ] src/app/api/admin/class-registrations/route.ts
- [ ] src/app/api/admin/class-registrations/[id]/route.ts
- [ ] src/app/api/admin/class-registrations/[id]/certificate/route.ts
- [ ] src/app/api/admin/generate-certificate/route.ts
- [ ] src/app/api/admin/certificates/upload/route.ts

### 📝 Priority 3: Member Routes
- [ ] src/app/api/member/class-registrations/route.ts
- [ ] src/app/api/member/class-registrations/[id]/route.ts
- [ ] src/app/api/member/profile/route.ts

### 🔄 Priority 4: Other Routes
- [ ] src/app/api/enrollments/route.ts
- [ ] src/app/api/payment-proof/[id]/route.ts
- [ ] src/app/api/notifications/route.ts
- [ ] src/app/api/upload/route.ts
- [ ] src/app/api/classes/route.ts
- [ ] src/app/api/dev/login-admin/route.ts

## Pattern Replacement:

### OLD (Base64 - UNSAFE):
```typescript
function getSessionFromToken(authToken: string) {
  try {
    const sessionData = JSON.parse(
      Buffer.from(authToken, 'base64').toString('utf-8')
    );
    return sessionData;
  } catch {
    return null;
  }
}
```

### NEW (JWT - SAFE):
```typescript
import { verifyToken } from "@/lib/auth-utils";

// Replace all getSessionFromToken() calls with:
const session = await verifyToken(token);
```

## Action Plan:

1. Update critical auth routes first (login, me, profile, change-password)
2. Update all admin routes
3. Update all member routes
4. Update misc routes (enrollments, notifications, upload, etc.)
5. Remove all local getSessionFromToken() implementations
6. Add `await` to all session verification calls
7. Test each route after update

⚠️ **CRITICAL**: Semua route yang menggunakan JWT verification HARUS async!
