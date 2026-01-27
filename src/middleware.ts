import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper to decode auth token and get session data
function getSessionFromToken(authToken: string): { role?: string; userId?: number } | null {
  try {
    const sessionData = JSON.parse(
      Buffer.from(authToken, 'base64').toString('utf-8')
    );
    return sessionData;
  } catch {
    return null;
  }
}

export default function middleware(request: NextRequest) {
  // Gunakan cookie yang berbeda untuk admin dan member
  const memberToken = request.cookies.get('member_token')?.value;
  const adminToken = request.cookies.get('admin_token')?.value;
  // Backward compatibility dengan auth_token lama
  const legacyToken = request.cookies.get('auth_token')?.value;
  
  const pathname = request.nextUrl.pathname;
  
  // =====================
  // ADMIN ROUTES PROTECTION
  // =====================
  if (pathname.startsWith('/admin')) {
    // Skip login page untuk admin
    if (pathname === '/admin/login') {
      // Jika sudah login sebagai admin, redirect ke dashboard
      if (adminToken) {
        const session = getSessionFromToken(adminToken);
        if (session?.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
      return NextResponse.next();
    }
    
    // Cek admin token
    const tokenToCheck = adminToken || legacyToken;
    if (!tokenToCheck) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    const session = getSessionFromToken(tokenToCheck);
    if (!session || session.role !== 'admin') {
      // Bukan admin, redirect ke member dashboard jika punya member token
      if (memberToken) {
        return NextResponse.redirect(new URL('/member/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // =====================
  // MEMBER ROUTES PROTECTION  
  // =====================
  if (pathname.startsWith('/member')) {
    const tokenToCheck = memberToken || legacyToken;
    
    if (!tokenToCheck) {
      // Simpan URL yang ingin diakses untuk redirect setelah login
      const returnUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/auth/login?redirect=${returnUrl}`, request.url));
    }
    
    const session = getSessionFromToken(tokenToCheck);
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Admin tidak boleh akses halaman member (gunakan dashboard admin)
    if (session.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }
  
  // =====================
  // AUTH PAGES (LOGIN/REGISTER)
  // =====================
  if (pathname.startsWith('/auth/login') || pathname === '/login') {
    // Hanya cek member token untuk halaman login member
    // Admin yang sudah login tidak di-redirect (mungkin ingin login sebagai akun lain)
    if (memberToken) {
      const session = getSessionFromToken(memberToken);
      if (session && session.role === 'member') {
        // Cek apakah ada redirect URL
        const redirectUrl = request.nextUrl.searchParams.get('redirect');
        if (redirectUrl && !redirectUrl.startsWith('/admin')) {
          return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.redirect(new URL('/member/dashboard', request.url));
      }
    }
  }
  
  if (pathname.startsWith('/auth/register') || pathname === '/register') {
    // Untuk halaman register, HANYA cek member token
    // Admin yang sudah login masih boleh mengakses halaman register (untuk membuat akun member baru)
    // Hanya member yang sudah login yang akan di-redirect
    if (memberToken) {
      const session = getSessionFromToken(memberToken);
      if (session && session.role === 'member') {
        return NextResponse.redirect(new URL('/member/dashboard', request.url));
      }
    }
    // Tidak redirect admin dari halaman register - biarkan mereka register member baru jika mau
  }
  
  // =====================
  // EDUCATION REGISTRATION
  // =====================
  if (pathname.startsWith('/education/register')) {
    const tokenToCheck = memberToken || legacyToken;
    
    if (!tokenToCheck) {
      // Not logged in - redirect to register page
      const returnUrl = encodeURIComponent(pathname);
      return NextResponse.redirect(new URL(`/auth/register?redirect=${returnUrl}`, request.url));
    }
    
    const session = getSessionFromToken(tokenToCheck);
    if (!session) {
      return NextResponse.redirect(new URL('/auth/register', request.url));
    }
    
    // If logged in as member, redirect to member's class registration
    if (session.role === 'member') {
      return NextResponse.redirect(new URL('/member/classes/register', request.url));
    }
    
    // If admin, redirect to admin panel
    if (session.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/classes', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*', 
    '/member/:path*', 
    '/education/register/:path*',
    '/auth/login',
    '/auth/register',
    '/login',
    '/register'
  ],
};
