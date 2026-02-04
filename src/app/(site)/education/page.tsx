"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import "./education.css";

const PHONE = "6281368236245";

type PublicClass = {
  id: number;
  title: string;
  description: string;
  instructor: string;
  schedule: string | null;
  duration: string | null;
  totalSessions: number;
  location: string;
  level: string;
  price: number;
  maxParticipants: number;
  enrolledCount: number;
  image: string;
  status: string;
  isActive: boolean;
};

type ApiClassItem = PublicClass & {
  capacity?: number;
  totalSessions?: number;
  _count?: {
    enrollments?: number;
  };
};

const FACILITY_ICONS = ["📖", "🏆", "☕", "👨‍🏫"];

const levelBadgeClass = (level: string) => {
  const normalized = level?.toLowerCase() ?? "";
  if (normalized.includes("advance") || normalized.includes("prof")) return "purple";
  if (normalized.includes("inter") || normalized.includes("menengah")) return "blue";
  if (normalized.includes("workshop") || normalized.includes("flex")) return "green";
  return "gold";
};

const normalizeImageSrc = (src?: string) => {
  if (!src) return "/images/menu/default.jpg";
  if (src.startsWith("http")) return src;
  return src.startsWith("/") ? src : `/${src}`;
};

const getAvailableSeats = (program: PublicClass) => {
  const total = Number(program.maxParticipants || 0);
  const enrolled = Number(program.enrolledCount || 0);
  return Math.max(total - enrolled, 0);
};

export default function EducationPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const eduCopy = t.publicPages.education;
  const navCopy = t.nav;
  const currencyFormatter = useMemo(() => new Intl.NumberFormat(lang === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }), [lang]);
  const formatPrice = useCallback((price: number) => {
    if (!price || Number.isNaN(price)) return eduCopy.messages.priceFree;
    return currencyFormatter.format(price);
  }, [currencyFormatter, eduCopy.messages.priceFree]);

  const formatSchedule = useCallback((schedule: string | null) => {
    if (!schedule) return eduCopy.messages.schedulePending;
    try {
      const date = new Date(schedule);
      return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return eduCopy.messages.schedulePending;
    }
  }, [eduCopy.messages.schedulePending, lang]);

  const formatDuration = useCallback((duration: string | null) => {
    if (!duration) return eduCopy.messages.durationFlexible;
    const [hours = "0", minutes = "0"] = duration.split(":");
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const parts: string[] = [];
    if (h) parts.push(eduCopy.messages.durationHours(h));
    if (m) parts.push(eduCopy.messages.durationMinutes(m));
    return parts.length ? parts.join(" ") : eduCopy.messages.durationFlexible;
  }, [eduCopy.messages.durationFlexible, eduCopy.messages.durationHours, eduCopy.messages.durationMinutes]);
  const [classes, setClasses] = useState<PublicClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/classes?status=active", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      const normalized: PublicClass[] = data.map((item: ApiClassItem) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        instructor: item.instructor ?? "Instruktur BARIZTA",
        schedule: item.schedule ?? null,
        duration: item.duration ?? null,
        totalSessions: Number(item.totalSessions ?? 4),
        location: item.location ?? "Barizta Coffee Shop",
        level: item.level ?? "Pemula",
        price: Number(item.price ?? 0),
        maxParticipants: Number(item.maxParticipants ?? item.capacity ?? 0),
        enrolledCount: Number(item.enrolledCount ?? item._count?.enrollments ?? 0),
        image: item.image ?? "/images/menu/default.jpg",
        status: item.status ?? "active",
        isActive: item.isActive ?? true,
      }));
      setClasses(normalized);
    } catch (err) {
      console.error("Unable to load classes", err);
      setError(eduCopy.messages.fetchError);
    } finally {
      setLoading(false);
    }
  }, [eduCopy.messages.fetchError]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const visibleClasses = useMemo(
    () => classes.filter((cls) => cls.isActive && cls.status !== "inactive"),
    [classes]
  );

  useEffect(() => {
    if (selectedProgram && !visibleClasses.some((cls) => cls.id === selectedProgram)) {
      setSelectedProgram(null);
    }
  }, [selectedProgram, visibleClasses]);

  const handleDaftar = (classId?: number) => {
    const target = classId ? `/education/register?classId=${classId}` : "/education/register";
    router.push(target);
  };

  const handleKonsultasi = useCallback((programName?: string) => {
    const message = eduCopy.messages.whatsappGreeting(programName ?? eduCopy.hero.title);
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`, "_blank");
  }, [eduCopy.hero.title, eduCopy.messages]);

  return (
    <main className="education-page">
      {/* Hero Section */}
      <section className="edu-hero">
        <div className="edu-hero-overlay"></div>
        <div className="edu-hero-content">
          <span className="edu-breadcrumb">
            <Link href="/">{navCopy.beranda}</Link> <span className="separator">›</span>
            <span className="active">{eduCopy.hero.breadcrumb}</span>
          </span>
          <h1>{eduCopy.hero.title}</h1>
          <p>{eduCopy.hero.tagline}</p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="edu-intro">
        <div className="container">
          <div className="intro-badge">{eduCopy.intro.badge}</div>
          <h2>{eduCopy.intro.heading}</h2>
          <p>{eduCopy.intro.description}</p>
        </div>
      </section>

      {/* Programs Section */}
      <section className="edu-programs">
        <div className="container">
          <div className="section-header">
            <span className="label">{eduCopy.programs.label}</span>
            <h2>{eduCopy.programs.heading}</h2>
          </div>

          {loading ? null : error ? (
            <div className="program-empty error">
              <p>{error}</p>
              <button onClick={fetchClasses}>{eduCopy.programs.retry}</button>
            </div>
          ) : visibleClasses.length === 0 ? (
            <div className="program-empty">
              <h3>{eduCopy.programs.emptyHeading}</h3>
              <p>{eduCopy.programs.emptyDescription}</p>
              <button onClick={() => handleKonsultasi()}>{eduCopy.programs.contactButton}</button>
            </div>
          ) : (
            <div className="programs-grid">
              {visibleClasses.map((program) => {
                const badgeClass = levelBadgeClass(program.level);
                const imageSrc = normalizeImageSrc(program.image);
                const seatsLeft = getAvailableSeats(program);
                const hasLimitedSeats = program.maxParticipants > 0;
                const isFull = hasLimitedSeats && seatsLeft <= 0;
                const availabilityLabel = hasLimitedSeats
                  ? isFull
                    ? eduCopy.programs.availability.full
                    : eduCopy.programs.availability.slots(seatsLeft)
                  : eduCopy.programs.availability.open;

                return (
                  <div
                    key={program.id}
                    className={`program-card ${selectedProgram === program.id ? "expanded" : ""}`}
                  >
                    <div className="program-image">
                      <Image
                        src={imageSrc}
                        alt={program.title}
                        width={400}
                        height={250}
                        unoptimized={imageSrc.startsWith("http")}
                      />
                      <span className={`program-badge ${badgeClass}`}>{program.level}</span>
                      <span className="program-duration">{formatDuration(program.duration)}</span>
                    </div>

                    <div className="program-content">
                      <h3>{program.title}</h3>
                      <p className="program-desc">{program.description}</p>

                      {/* Training Package Info */}
                      <div className="training-package-box">
                        <span className="package-title">📦 Paket Pelatihan</span>
                        <div className="package-info-row">
                          <span className="package-info-item">📅 {program.totalSessions}x Pertemuan</span>
                          <span className="package-info-item">⏱️ {formatDuration(program.duration)} / Hari</span>
                        </div>
                        <div className="package-schedule-fixed">
                          <span className="schedule-label">🕘 Jam Pelaksanaan:</span>
                          <span className="schedule-times">09.00–11.30 • Istirahat • 13.30–16.00</span>
                        </div>
                      </div>

                      <div className="program-price">
                        <span className="price">{formatPrice(program.price)}</span>
                        <span className="per-person">{eduCopy.programs.perPerson}</span>
                      </div>

                      <div className="program-stats">
                        <span className="info-pill neutral">🗓 {formatSchedule(program.schedule)}</span>
                        <span className="info-pill neutral">📍 {program.location}</span>
                        <span className="info-pill neutral">👤 {program.instructor}</span>
                      </div>

                      <div className="program-stats">
                        <span className={`info-pill ${isFull ? "danger" : "positive"}`}>
                          👥 {availabilityLabel}
                        </span>
                        <span className="info-pill neutral">
                          📊 {eduCopy.programs.statusLabel}: {program.status === "active" ? eduCopy.programs.status.open : eduCopy.programs.status.closed}
                        </span>
                      </div>

                      {selectedProgram === program.id && (
                        <div className="program-details">
                          <div className="detail-grid">
                            <div className="detail-card">
                              <h5>{eduCopy.programs.details.schedule}</h5>
                              <p>{formatSchedule(program.schedule)}</p>
                            </div>
                            <div className="detail-card">
                              <h5>{eduCopy.programs.details.duration}</h5>
                              <p>{formatDuration(program.duration)}</p>
                            </div>
                            <div className="detail-card">
                              <h5>{eduCopy.programs.details.location}</h5>
                              <p>{program.location}</p>
                            </div>
                            <div className="detail-card">
                              <h5>{eduCopy.programs.details.capacity}</h5>
                              <p>
                                {program.maxParticipants > 0
                                  ? `${program.maxParticipants} ${eduCopy.programs.perPerson.replace("/", "").trim()}`
                                  : eduCopy.programs.details.flexible}
                              </p>
                            </div>
                          </div>
                          <div className="detail-desc">
                            {(() => {
                              const desc = program.description || '';
                              const regex = /(?:📚\s*)?(materi|tema)[^:\n]{0,80}:/i;
                              const match = desc.match(regex);
                              if (match) {
                                const label = match[0];
                                const idx = desc.toLowerCase().indexOf(label.toLowerCase());
                                const intro = desc.slice(0, idx);
                                const materiPart = desc.slice(idx + label.length);
                                const items = materiPart.split('•').map(s => s.trim()).filter(Boolean);
                                return (
                                  <>
                                    {intro && <p>{intro.trim()}</p>}
                                    <h5 className="materi-title">{label}</h5>
                                    <ul className="materi-list">
                                      {items.map((it, i) => (
                                        <li key={i}>{it}</li>
                                      ))}
                                    </ul>
                                  </>
                                );
                              }
                              // Fallback: if bullets exist without a heading, parse them as materi list
                              if (desc.includes('•')) {
                                const parts = desc.split('•').map(s => s.trim()).filter(Boolean);
                                if (parts.length > 1) {
                                  const intro = parts[0] || '';
                                  const items = parts.slice(1);
                                  return (
                                    <>
                                      {intro && <p>{intro}</p>}
                                      <h5 className="materi-title">Materi</h5>
                                      <ul className="materi-list">
                                        {items.map((it, i) => (
                                          <li key={i}>{it}</li>
                                        ))}
                                      </ul>
                                    </>
                                  );
                                }
                              }
                              // Fallback simple paragraph
                              return <p>{desc}</p>;
                            })()}
                          </div>
                          <div className="detail-actions">
                            <button
                              className="btn-secondary-barizta btn-secondary-barizta-lg"
                              onClick={() => handleKonsultasi(program.title)}
                            >
                              {eduCopy.programs.details.consult}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="program-actions">
                        <button
                          className="btn-secondary-barizta btn-secondary-barizta-lg"
                          onClick={() =>
                            setSelectedProgram(selectedProgram === program.id ? null : program.id)
                          }
                        >
                          {selectedProgram === program.id ? eduCopy.programs.details.close : eduCopy.programs.details.view}
                        </button>

                        <button
                          className="btn-barizta btn-barizta-lg"
                          onClick={() => handleDaftar(program.id)}
                          disabled={isFull}
                        >
                          {isFull ? eduCopy.programs.details.full : eduCopy.programs.details.register}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Facilities Section */}
      <section className="edu-facilities">
        <div className="container">
          <div className="section-header">
            <span className="label">{eduCopy.facilities.label}</span>
            <h2>{eduCopy.facilities.heading}</h2>
          </div>

          <div className="facilities-grid">
            {eduCopy.facilities.items.map((item, idx) => (
              <div key={idx} className="facility-card">
                <span className="facility-icon">{FACILITY_ICONS[idx % FACILITY_ICONS.length]}</span>
                <span className="facility-text">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="edu-cta">
        <div className="container">
          <div className="cta-content">
            <h2>{eduCopy.cta.heading}</h2>
            <p>{eduCopy.cta.description}</p>
            <div className="cta-buttons">
              <button onClick={() => handleDaftar()} className="btn-barizta">
                {eduCopy.cta.register}
              </button>
              <button className="btn-secondary-barizta" onClick={() => handleKonsultasi()}>
                {eduCopy.cta.consult}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
