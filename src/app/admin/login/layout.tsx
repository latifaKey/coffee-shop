export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Layout tanpa AdminShell untuk halaman login
  return <>{children}</>;
}
