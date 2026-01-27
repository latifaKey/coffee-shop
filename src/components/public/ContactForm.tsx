"use client";

import { useState } from "react";

type Topic = "Umum" | "Kolaborasi" | "Kemitraan" | "Komplain" | "Lainnya";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("+62");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState<Topic | "">("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const errors: Partial<Record<string, string>> = {};
  const emailOk = /^\S+@\S+\.\S+$/.test(email);
  const phoneOk = /\d{8,}/.test(phone.replace(/[^\d]/g, ""));
  if (!name) errors.name = "Wajib diisi";
  if (!email || !emailOk) errors.email = "Email tidak valid";
  if (!phone || !phoneOk) errors.phone = "Nomor tidak valid";
  if (!subject) errors.subject = "Wajib diisi";
  if (!message) errors.message = "Wajib diisi";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;
    try {
      setSending(true);
      setServerErr(null);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, code, phone, topic: topic || undefined, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerErr(data?.error || "Gagal mengirim. Coba lagi.");
        return;
      }
      setSent(true);
      // optional: clear fields
      setName(""); setEmail(""); setPhone(""); setTopic(""); setSubject(""); setMessage("");
  } catch {
      setServerErr("Terjadi kesalahan jaringan.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      <div className="inline">
        <div className="field">
          <label className="label" htmlFor="name">Nama Lengkap</label>
          <input
            id="name"
            className="input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-invalid={!!errors.name}
          />
          {errors.name && <span className="helper" role="alert">{errors.name}</span>}
        </div>
        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="helper" role="alert">{errors.email}</span>}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="wa">Nomor WhatsApp</label>
        <div className="wa-row">
          <select className="select code" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Kode negara">
            <option value="+62">(ID) +62</option>
            <option value="+60">(MY) +60</option>
            <option value="+65">(SG) +65</option>
            <option value="+1">(US) +1</option>
          </select>
          <input
            id="wa"
            className="input"
            inputMode="numeric"
            placeholder="81234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            aria-invalid={!!errors.phone}
          />
        </div>
        {errors.phone && <span className="helper" role="alert">{errors.phone}</span>}
      </div>

      <div className="field">
        <label className="label" htmlFor="topic">Topik <span className="muted tiny">(opsional)</span></label>
        <select id="topic" className="select" value={topic} onChange={(e) => setTopic(e.target.value as Topic | "")}> 
          <option value="">Pilih topik</option>
          <option>Umum</option>
          <option>Kolaborasi</option>
          <option>Kemitraan</option>
          <option>Komplain</option>
          <option>Lainnya</option>
        </select>
      </div>

      <div className="field">
        <label className="label" htmlFor="subject">Subjek</label>
        <input
          id="subject"
          className="input"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          aria-invalid={!!errors.subject}
        />
        {errors.subject && <span className="helper" role="alert">{errors.subject}</span>}
      </div>

      <div className="field">
        <label className="label" htmlFor="message">Pesan</label>
        <textarea
          id="message"
          className="textarea"
          rows={5}
          placeholder="Ceritakan tentang proyek Anda..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          aria-invalid={!!errors.message}
        />
        {errors.message && <span className="helper" role="alert">{errors.message}</span>}
      </div>

      <p className="muted tiny">Semua kolom wajib diisi kecuali topik.</p>

      {serverErr && <p className="helper" role="alert">{serverErr}</p>}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
          <button className="btn-barizta" type="submit" disabled={sending}>
          {sending ? "Mengirim..." : "Kirim →"}
        </button>
        {sent && <span className="muted tiny" role="status">Terkirim. Terima kasih!</span>}
      </div>

      <p className="muted tiny" style={{ marginTop: 8 }}>
        Atau email kami di <a className="link" href="mailto:info@barizta.com?subject=Kontak%20BARIZTA">info@barizta.com</a>
      </p>
    </form>
  );
}
