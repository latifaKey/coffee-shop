import { getSessionFromCookies } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import AdminShell from "./AdminShell";
import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin Dashboard | BARIZTA Coffee",
  description: "Panel administrasi untuk mengelola BARIZTA Coffee",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Server-side auth check
  const session = await getSessionFromCookies();
  
  if (!session) {
    redirect("/admin/login");
  }
  
  if (session.role !== "admin") {
    redirect("/member/dashboard");
  }

  return <AdminShell initialUser={session}>{children}</AdminShell>;
}
