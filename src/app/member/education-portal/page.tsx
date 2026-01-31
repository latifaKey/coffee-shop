'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Alert } from '@/components/ui';
import './education-portal.css';

interface EducationClass {
  id: number;
  title: string;
  instructor: string;
  duration: string;
  totalSessions: number;
  schedule: string | null;
  price: number;
  maxParticipants: number;
  enrolledCount: number;
  level: string;
  description: string;
  image: string;
}

interface RegistrationFormData {
  fullName: string;
  birthDate: string;
  gender: 'Laki-laki' | 'Perempuan' | '';
  address: string;
  phone: string;
  email: string;
  trainingPackage: string;
  schedule: 'Weekday' | 'Weekend' | '';
  experience: 'Belum Ada' | '0-6 bulan' | '6-12 bulan' | '1 tahun ke atas' | '';
  previousTraining: 'yes' | 'no' | '';
  previousTrainingDetails: string;
  paymentProof: string | null;
  paymentProofName: string | null;
}

interface MemberRegistration {
  id: number;
  programId: string;
  status: string;
}

const levelColors: Record<string, string> = {
  'Pemula': '#4caf50',
  'Intermediate': '#2196f3',
  'Advanced': '#9c27b0',
  'Professional': '#ff9800'
};

const SCHEDULE_OPTIONS = [
  { value: 'Weekday', label: 'Weekday (Senin–Jumat)' },
  { value: 'Weekend', label: 'Weekend (Sabtu–Minggu)' }
] as const;

const EXPERIENCE_OPTIONS = [
  { value: 'Belum Ada', label: 'Belum Ada' },
  { value: '0-6 bulan', label: '0-6 bulan' },
  { value: '6-12 bulan', label: '6-12 bulan' },
  { value: '1 tahun ke atas', label: '1 tahun ke atas' }
] as const;

const createInitialFormState = (trainingPackage = ''): RegistrationFormData => ({
  fullName: '',
  birthDate: '',
  gender: '',
  address: '',
  phone: '',
  email: '',
  trainingPackage,
  schedule: '',
  experience: '',
  previousTraining: '',
  previousTrainingDetails: '',
  paymentProof: null,
  paymentProofName: null
});

export default function EducationPortalPage() {
  const [classes, setClasses] = useState<EducationClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<EducationClass | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>(createInitialFormState());
  const [registeredProgramIds, setRegisteredProgramIds] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning' | ''; text: string }>({ type: '', text: '' });
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = (type: 'success' | 'error' | 'info' | 'warning', text: string) => {
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    setAlertMessage({ type, text });
    alertTimeoutRef.current = setTimeout(() => {
      setAlertMessage({ type: '', text: '' });
      alertTimeoutRef.current = null;
    }, 4000);
  };

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchClasses(), fetchRegistrations()]);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes?status=active');
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const res = await fetch('/api/member/class-registrations?type=active');
      if (!res.ok) {
        throw new Error('Failed to fetch registrations');
      }
      const data: MemberRegistration[] = await res.json();
      const programIds = data
        .filter((registration) => registration && registration.programId)
        .map((registration) => registration.programId.toString());
      setRegisteredProgramIds(programIds);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegisteredProgramIds([]);
    }
  };

  const handleRegister = (classItem: EducationClass) => {
    const alreadyRegisteredForThisClass = registeredProgramIds.includes(classItem.id.toString());

    if (alreadyRegisteredForThisClass) {
      showAlert('info', 'Anda sudah terdaftar di kelas ini.');
      return;
    }

    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
    setAlertMessage({ type: '', text: '' });
    setSelectedClass(classItem);
    setFormData(createInitialFormState(classItem.title));
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(createInitialFormState());
    setSelectedClass(null);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = null;
    }
    setAlertMessage({ type: '', text: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputElement = e.target;
    const file = inputElement.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      inputElement.value = '';
      showAlert('error', 'Ukuran file maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) {
        inputElement.value = '';
        showAlert('error', 'Gagal membaca file bukti pembayaran');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        paymentProof: result,
        paymentProofName: file.name
      }));
      inputElement.value = '';
    };

    reader.onerror = () => {
      inputElement.value = '';
      showAlert('error', 'Terjadi kesalahan saat memproses file');
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    // Validation
    if (!formData.fullName.trim() || !formData.birthDate || !formData.gender || !formData.address.trim() || !formData.phone.trim()) {
      showAlert('error', 'Mohon lengkapi data diri peserta yang wajib diisi');
      return;
    }

    if (!formData.schedule) {
      showAlert('error', 'Mohon pilih jadwal pelatihan yang diinginkan');
      return;
    }

    if (!formData.experience) {
      showAlert('error', 'Mohon pilih pengalaman barista sebelumnya');
      return;
    }

    if (!formData.previousTraining) {
      showAlert('error', 'Mohon pilih apakah pernah mengikuti pelatihan barista sebelumnya');
      return;
    }

    if (formData.previousTraining === 'yes' && !formData.previousTrainingDetails.trim()) {
      showAlert('error', 'Mohon sebutkan pelatihan barista yang pernah diikuti');
      return;
    }

    if (!formData.paymentProof) {
      showAlert('error', 'Bukti pembayaran wajib diunggah');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        programId: selectedClass.id.toString(),
        programName: selectedClass.title,
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address.trim(),
        whatsapp: formData.phone.trim(),
        email: formData.email ? formData.email.trim() : null,
        selectedPackages: [formData.trainingPackage || selectedClass.title],
        schedulePreference: formData.schedule,
        experience: formData.experience,
        previousTraining: formData.previousTraining === 'yes',
        trainingDetails: formData.previousTraining === 'yes' ? formData.previousTrainingDetails.trim() : null,
        paymentProof: formData.paymentProof
      };

      console.log('Submitting registration payload:', {
        ...payload,
        paymentProof: payload.paymentProof ? `[${payload.paymentProof.substring(0, 30)}...]` : 'null'
      });

      const res = await fetch('/api/member/class-registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json().catch((e) => {
        console.error('Failed to parse response:', e);
        return null;
      });

      console.log('Registration response:', { status: res.status, data: responseData });

      if (!res.ok) {
        const errorMessage = responseData?.error || 'Gagal mendaftar kelas. Silakan coba lagi.';
        console.error('Registration failed:', errorMessage, responseData);
        showAlert('error', errorMessage);
        return;
      }

      handleCloseModal();
      showAlert('success', 'Pendaftaran berhasil! Menunggu konfirmasi admin.');
      await Promise.all([fetchClasses(), fetchRegistrations()]);
    } catch (error) {
      console.error('Error registering:', error);
      showAlert('error', 'Gagal mendaftar kelas. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderStructuredDescription = (desc?: string | null) => {
    const d = desc || '';
    const regex = /(?:📚\s*)?(materi|tema)[^:\n]{0,80}:/i;
    const match = d.match(regex);
    if (match) {
      const label = match[0];
      const idx = d.toLowerCase().indexOf(label.toLowerCase());
      const intro = d.slice(0, idx);
      const materiPart = d.slice(idx + label.length);
      const items = materiPart.split('•').map(s => s.trim()).filter(Boolean);
      return (
        <div>
          {intro && <p>{intro}</p>}
          <h5 className="materi-title">{label}</h5>
          <ul className="materi-list">
            {items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </div>
      );
    }
    if (d.includes('•')) {
      const parts = d.split('•').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        const intro = parts[0] || '';
        const items = parts.slice(1);
        return (
          <div>
            {intro && <p>{intro}</p>}
            <h5 className="materi-title">Materi</h5>
            <ul className="materi-list">
              {items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        );
      }
    }
    return <p>{d}</p>;
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) return null;

  return (
    <div className="education-portal">
      <div className="portal-header">
        <h1>📚 Daftar Kelas Edukasi</h1>
        <p>Pilih kelas yang sesuai dengan kebutuhan Anda dan daftar sekarang!</p>
      </div>

        {!showModal && alertMessage.type && (
          <Alert
            type={alertMessage.type as 'success' | 'error'}
            message={alertMessage.text}
            onClose={() => setAlertMessage({ type: '', text: '' })}
          />
        )}

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Tidak ada kelas tersedia</h3>
          <p>Belum ada kelas tersedia saat ini, silakan cek kembali nanti.</p>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map((classItem) => (
            <div key={classItem.id} className="class-card">
              <div className="class-image">
                <Image 
                  src={classItem.image || '/images/menu/default.jpg'} 
                  alt={classItem.title}
                  width={300}
                  height={200}
                  style={{ objectFit: 'cover' }}
                  unoptimized
                />
                <span 
                  className="class-level-badge"
                  style={{ background: levelColors[classItem.level] || '#999' }}
                >
                  {classItem.level}
                </span>
              </div>
              <div className="class-body">
                <h3>{classItem.title}</h3>
                <div className="class-description">
                  {(() => {
                    const desc = classItem.description || '';
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
                    return <p>{desc}</p>;
                  })()}
                </div>
                
                {/* Training Package Info */}
                <div className="training-package-section">
                  <span className="package-header">📦 Paket Pelatihan</span>
                  <div className="package-grid">
                    <span className="package-chip">📅 {classItem.totalSessions || 4}x Pertemuan</span>
                    <span className="package-chip">⏱️ ±{classItem.duration || '4-5'} Jam / Hari</span>
                  </div>
                  <div className="schedule-fixed-box">
                    <span className="schedule-title">🕘 Jam Pelaksanaan:</span>
                    <span className="schedule-detail">09.00–11.30 • Istirahat 11.30–13.30 • 13.30–16.00</span>
                  </div>
                  <p className="schedule-note">
                    * Hari pelaksanaan menyesuaikan pilihan Weekday / Weekend, 
                    namun jam kelas mengikuti ketetapan yang berlaku.
                  </p>
                </div>
                
                <div className="class-details">
                  <span className="detail-item">
                    <span className="detail-icon">👨‍🏫</span>
                    {classItem.instructor}
                  </span>
                  <span className="detail-item">
                    <span className="detail-icon">👥</span>
                    Max {classItem.maxParticipants} peserta
                  </span>
                </div>
                <div className="class-footer">
                  <span className="class-price">{formatPrice(classItem.price)}</span>
                  {(() => {
                    const isRegistered = registeredProgramIds.includes(classItem.id.toString());
                    const isFull = classItem.enrolledCount >= classItem.maxParticipants;
                    const disabled = isRegistered || isFull;
                    let buttonLabel = '📝 Daftar Sekarang';
                    if (isRegistered) {
                      buttonLabel = '✔ Sudah Mendaftar';
                    } else if (isFull) {
                      buttonLabel = '✋ Penuh';
                    }

                    return (
                      <button
                        className="btn-barizta btn-barizta-sm"
                        onClick={() => handleRegister(classItem)}
                        disabled={disabled}
                      >
                        {buttonLabel}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      {showModal && selectedClass && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pendaftaran Kelas</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              {alertMessage.type && (
                <Alert
                  type={alertMessage.type as 'success' | 'error'}
                  message={alertMessage.text}
                  onClose={() => setAlertMessage({ type: '', text: '' })}
                />
              )}
              <div className="selected-class-info">
                <h3>{selectedClass.title}</h3>
                <p>{selectedClass.instructor} • {selectedClass.level}</p>
                <p className="price">{formatPrice(selectedClass.price)}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-intro">
                  <h3>FORM REGISTRASI PELATIHAN BARISTA</h3>
                  <p>Barizta Specialty Coffee</p>
                  <p className="selected-package-note">Paket pelatihan otomatis: <strong>{selectedClass.title}</strong></p>
                </div>

                <div className="form-section">
                  <h3>A. Data Diri Peserta</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nama Lengkap *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Masukkan nama sesuai KTP"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Tanggal Lahir *</label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        max={today}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Jenis Kelamin *</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="Laki-laki"
                          checked={formData.gender === 'Laki-laki'}
                          onChange={() => setFormData({ ...formData, gender: 'Laki-laki' })}
                        />
                        Laki-laki
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="gender"
                          value="Perempuan"
                          checked={formData.gender === 'Perempuan'}
                          onChange={() => setFormData({ ...formData, gender: 'Perempuan' })}
                        />
                        Perempuan
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Alamat Lengkap *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      placeholder="Tulis alamat lengkap domisili Anda"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nomor WhatsApp *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email (Opsional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="Masukkan email aktif (jika ada)"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>B. Jadwal Pelatihan yang Dipilih</h3>
                  <div className="form-group">
                    <div className="radio-group">
                      {SCHEDULE_OPTIONS.map((option) => (
                        <label key={option.value} className="radio-label">
                          <input
                            type="radio"
                            name="schedule"
                            value={option.value}
                            checked={formData.schedule === option.value}
                            onChange={() => setFormData({ ...formData, schedule: option.value })}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>C. Pengalaman</h3>
                  <div className="form-group">
                    <label>Pengalaman Barista sebelumnya *</label>
                    <div className="radio-group">
                      {EXPERIENCE_OPTIONS.map((option) => (
                        <label key={option.value} className="radio-label">
                          <input
                            type="radio"
                            name="experience"
                            value={option.value}
                            checked={formData.experience === option.value}
                            onChange={() => setFormData({ ...formData, experience: option.value })}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Pernah mengikuti pelatihan barista sebelumnya? *</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="previousTraining"
                          value="yes"
                          checked={formData.previousTraining === 'yes'}
                          onChange={() => setFormData({ ...formData, previousTraining: 'yes' })}
                        />
                        Ya
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name="previousTraining"
                          value="no"
                          checked={formData.previousTraining === 'no'}
                          onChange={() => setFormData({ ...formData, previousTraining: 'no', previousTrainingDetails: '' })}
                        />
                        Tidak
                      </label>
                    </div>
                  </div>
                  {formData.previousTraining === 'yes' && (
                    <div className="form-group">
                      <label>Jika Ya, sebutkan tempat atau pelatihan yang pernah diikuti *</label>
                      <textarea
                        value={formData.previousTrainingDetails}
                        onChange={(e) => setFormData({ ...formData, previousTrainingDetails: e.target.value })}
                        rows={3}
                        placeholder="Tulis nama pelatihan barista sebelumnya"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h3>D. Bukti Pembayaran</h3>
                  <p className="section-desc">Silakan lakukan pembayaran sesuai nominal dan unggah bukti transfer untuk mempercepat proses verifikasi.</p>
                  <div className="payment-info">
                    <div className="payment-method">
                      <h4>Transfer Bank</h4>
                      <p>Bank: <strong>BCA</strong></p>
                      <p>No. Rekening:</p>
                      <p className="account-number">1234567890</p>
                      <p>Atas Nama: <strong>BARIZTA COFFEE</strong></p>
                      <p>Jumlah: <strong>{formatPrice(selectedClass.price)}</strong></p>
                    </div>
                    <div className="payment-method">
                      <h4>Konfirmasi</h4>
                      <p>Harap kirim bukti pembayaran melalui form ini.</p>
                      <p>Kami akan menghubungi via WhatsApp setelah verifikasi.</p>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Upload Bukti Transfer *</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                    <small>Format: JPG, PNG, PDF (Maksimum 5MB)</small>
                    {formData.paymentProofName && (
                      <p className="selected-file-name">File dipilih: {formData.paymentProofName}</p>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseModal}>
                    Batal
                  </button>
                  <button type="submit" className="btn-barizta" disabled={submitting}>
                    {submitting ? 'Mengirim...' : '✅ Daftar Sekarang'}
                  </button>
                </div>
              </form>
            </div>

              <div className="selected-class-desc">
                {renderStructuredDescription(selectedClass.description)}
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
