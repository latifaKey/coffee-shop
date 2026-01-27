export default function KeunggulanPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="section__head">
          <h2 className="h2">Mengapa BARIZTA?</h2>
          <p className="muted">Lebih dari sekadar kopi, kami menciptakan pengalaman.</p>
        </div>
        <div className="grid-3 notes">
          <div className="note">
            <div className="note__icon">☕</div>
            <h4>Biji Kopi Pilihan</h4>
            <p className="muted">Kami hanya menggunakan biji kopi lokal terbaik dari petani yang etis.</p>
          </div>
          <div className="note">
            <div className="note__icon">🛋️</div>
            <h4>Suasana Nyaman</h4>
            <p className="muted">Tempat yang ideal untuk bekerja, belajar, atau bersantai bersama teman.</p>
          </div>
          <div className="note">
            <div className="note__icon">👩‍🍳</div>
            <h4>Barista Berpengalaman</h4>
            <p className="muted">Setiap cangkir disiapkan dengan presisi oleh para ahli kami.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
