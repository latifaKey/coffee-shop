"use client";

import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";
import { usePathname } from "next/navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Don't show Nav/Footer on admin, member, auth routes
  const isAdminRoute = pathname?.startsWith("/admin");
  const isMemberRoute = pathname?.startsWith("/member");
  const isAuthRoute = pathname?.startsWith("/auth");
  const isCertificateRoute = pathname?.startsWith("/certificates");
  
  const showPublicLayout = !isAdminRoute && !isMemberRoute && !isAuthRoute && !isCertificateRoute;
  
  if (!showPublicLayout) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Nav />
      <main className="public-main">{children}</main>
      <Footer />
    </>
  );
}
