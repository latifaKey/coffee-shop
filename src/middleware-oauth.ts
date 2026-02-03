import { auth } from "@/lib/auth";

export { auth as middleware } from "@/lib/auth";

export const config = {
  matcher: [
    "/admin/:path*",
    "/member/:path*",
    "/api/admin/:path*",
    "/api/member/:path*",
  ],
};
