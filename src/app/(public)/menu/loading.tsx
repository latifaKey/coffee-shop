import MenuSkeleton from "@/components/public/MenuSkeleton";

export default function LoadingMenu() {
  return (
    <main>
      {/* Hero section - can show immediately */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="breadcrumb">
            <span>Beranda</span>
            <span className="separator">›</span>
            <span className="active">Menu</span>
          </div>
          <h1>Temukan Menu Barizta Specialty Coffee</h1>
          <p className="muted" style={{ maxWidth: 900, marginInline: "auto" }}>Pilihan kopi, minuman, dan makanan ringan yang dikurasi dengan cermat untuk menyesuaikan dengan selera dan suasana hati Anda.</p>
        </div>
      </section>

      {/* Loading skeleton for products */}
      <section className="section">
        <div className="container">
          <MenuSkeleton />
        </div>
      </section>
    </main>
  );
}
