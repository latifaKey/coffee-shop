import Nav from "@/components/public/Nav";
import Footer from "@/components/public/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="public-main">{children}</main>
      <Footer />
    </>
  );
}
