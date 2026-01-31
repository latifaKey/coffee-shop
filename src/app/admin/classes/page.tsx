'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import '../shared-admin.css';
import './classes.css';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';
import { SearchBar, FilterSelect, Alert } from '@/components/ui';

// Types & Interfaces
interface BaristaClass {
  id: number;
  title: string;
  description: string;
  instructor: string;
  schedule: string | null;
  duration: string;
  totalSessions: number;
  maxParticipants: number;
  price: number;
  level: string;
  location: string;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    enrollments: number;
  };
}

interface ClassRegistration {
  id: number;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  programId: string;
  programName: string;
  fullName: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  email?: string;
  whatsapp: string;
  phone?: string;
  selectedPackages?: string;
  schedulePreference?: string;
  experience?: string;
  previousTraining?: boolean;
  trainingDetails?: string;
  paymentProof?: string;
  status: string;
  adminNotes?: string;
  certificateUrl?: string;
  completedDate?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ClassFormData {
  title: string;
  description: string;
  instructor: string;
  level: string;
  price: number;
  maxParticipants: number;
  totalSessions: number;
  location: string;
  image: string;
  schedule: string;
  duration: string;
  isActive: boolean;
}

type TabType = 'kelas' | 'pendaftaran' | 'kelolaPeserta';

export default function ClassesPage() {
  // ===== STATE MANAGEMENT =====
  // Tab & Loading
  const [activeTab, setActiveTab] = useState<TabType>('kelas');
  const [loading, setLoading] = useState(true);

  // Classes Data
  const [classes, setClasses] = useState<BaristaClass[]>([]);
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<BaristaClass | null>(null);
  const [deletingClass, setDeletingClass] = useState<BaristaClass | null>(null);

  // Enrollments Data
  const [registrations, setRegistrations] = useState<ClassRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<ClassRegistration | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentProof, setSelectedPaymentProof] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedCertificateUrl, setSelectedCertificateUrl] = useState<string | null>(null);
  
  // Generate Certificate Modal States
  const [showGenerateCertModal, setShowGenerateCertModal] = useState(false);
  const [generatingCert, setGeneratingCert] = useState(false);
  const [completionDate, setCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Kelola Peserta States
  const [pesertaStatusFilter, setPesertaStatusFilter] = useState<string>('all'); // 'all', 'approved', 'completed'
  const [markingComplete, setMarkingComplete] = useState<number | null>(null);
  const [certSkillName, setCertSkillName] = useState<string>('');
  const [certDirectorName, setCertDirectorName] = useState<string>('RINA TUPON PANGUDI LUHUR, M.PD');
  
  // Confirmation Modal States
  const [confirmingApprove, setConfirmingApprove] = useState<ClassRegistration | null>(null);
  const [confirmingReject, setConfirmingReject] = useState<ClassRegistration | null>(null);
  const [confirmingRevert, setConfirmingRevert] = useState<ClassRegistration | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [certInstructorName, setCertInstructorName] = useState<string>('M RIZAL NOVIANTO');
  const [certDirectorSignature, setCertDirectorSignature] = useState<string | null>(null);
  const [certInstructorSignature, setCertInstructorSignature] = useState<string | null>(null);
  const [generatedCertificate, setGeneratedCertificate] = useState<{
    code: string;
    url: string;
    recipientName: string;
    programName: string;
    completionDate: string;
  } | null>(null);
  const [showCertPreviewModal, setShowCertPreviewModal] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<ClassFormData>({
    title: '',
    description: '',
    instructor: '',
    level: 'Pemula',
    price: 0,
    maxParticipants: 10,
    totalSessions: 4,
    location: '',
    image: '',
    schedule: '',
    duration: '02:00',
    isActive: true
  });

  // Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Alert Messages
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info' | '', text: string }>({ type: '', text: '' });

  // ===== DATA FETCHING =====
  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/classes');
      if (!res.ok) throw new Error('Failed to fetch classes');
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setAlertMessage({ type: 'error', text: 'Gagal memuat data kelas' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/class-registrations', {
        credentials: 'include',
        cache: 'no-store'
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !Array.isArray(data.registrations)) {
        throw new Error(data?.error || 'Failed to fetch registrations');
      }
      setRegistrations(data.registrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
      setAlertMessage({ type: 'error', text: 'Gagal memuat data pendaftaran' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch both classes and registrations for accurate count
    fetchClasses();
    fetchRegistrations();
  }, [activeTab, fetchClasses, fetchRegistrations]);

  // ===== CLASS CRUD OPERATIONS =====
  const handleAddClass = () => {
    setEditingClass(null);
    setFormData({
      title: '',
      description: '',
      instructor: '',
      level: 'Pemula',
      price: 0,
      maxParticipants: 10,
      totalSessions: 4,
      location: 'Barizta Coffee Shop',
      image: '',
      schedule: '',
      duration: '02:00',
      isActive: true
    });
    setImageFile(null);
    setShowClassModal(true);
  };

  const handleEditClass = (classItem: BaristaClass) => {
    setEditingClass(classItem);
    
    // Parse schedule to YYYY-MM-DD format for date input
    let scheduleDate = '';
    if (classItem.schedule) {
      try {
        const date = new Date(classItem.schedule);
        scheduleDate = date.toISOString().split('T')[0];
      } catch (e) {
        console.error('Error parsing date:', e);
      }
    }

    setFormData({
      title: classItem.title,
      description: classItem.description,
      instructor: classItem.instructor,
      level: classItem.level || 'Pemula',
      price: classItem.price,
      maxParticipants: classItem.maxParticipants,
      totalSessions: classItem.totalSessions || 4,
      location: classItem.location || 'Barizta Coffee Shop',
      image: classItem.image,
      schedule: scheduleDate,
      duration: classItem.duration || '02:00',
      isActive: classItem.isActive
    });
    setImageFile(null);
    setShowClassModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setAlertMessage({ type: 'error', text: 'File harus berupa gambar (PNG, JPG, JPEG)' });
        setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlertMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
        setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
        return;
      }

      setImageFile(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return formData.image;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', imageFile);
      formDataUpload.append('folder', 'images/menu/classes');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await res.json();
      return data.filePath; // Returns the full path like /images/menu/classes/filename.jpg
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSaveClass = async () => {
    // Validation
    if (!formData.title.trim()) {
      setAlertMessage({ type: 'error', text: 'Nama kelas wajib diisi' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      return;
    }
    if (!formData.description.trim()) {
      setAlertMessage({ type: 'error', text: 'Deskripsi wajib diisi' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      return;
    }
    if (!formData.instructor.trim()) {
      setAlertMessage({ type: 'error', text: 'Instruktur wajib diisi' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      return;
    }
    if (!formData.location.trim()) {
      setAlertMessage({ type: 'error', text: 'Lokasi wajib diisi' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      return;
    }
    // Jadwal bersifat opsional - tidak wajib diisi
    if (!formData.duration) {
      setAlertMessage({ type: 'error', text: 'Durasi wajib diisi' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      return;
    }
    if (formData.price < 0) {
      setAlertMessage({ type: 'error', text: 'Harga tidak boleh negatif' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      return;
    }
    if (formData.maxParticipants < 1) {
      setAlertMessage({ type: 'error', text: 'Kapasitas minimal 1 orang' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      return;
    }

    try {
      // Upload image first if there's a new file
      let imagePath = formData.image;
      if (imageFile) {
        imagePath = await uploadImage();
      }

      const dataToSave = {
        ...formData,
        image: imagePath,
        // If schedule is an empty string, send null to API to clear schedule
        schedule: formData.schedule ? formData.schedule : null,
      };

      const url = editingClass ? `/api/classes/${editingClass.id}` : '/api/classes';
      const method = editingClass ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save class');
      }

      setAlertMessage({ 
        type: 'success', 
        text: editingClass ? 'Kelas berhasil diperbarui!' : 'Kelas berhasil ditambahkan!' 
      });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      setShowClassModal(false);
      setImageFile(null);
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      setAlertMessage({ 
        type: 'error', 
        text: 'Gagal menyimpan kelas: ' + (error instanceof Error ? error.message : 'Unknown error') 
      });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;

    try {
      const res = await fetch(`/api/classes/${deletingClass.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete class');

      setAlertMessage({ type: 'success', text: 'Kelas berhasil dihapus!' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      setDeletingClass(null);
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      setAlertMessage({ type: 'error', text: 'Gagal menghapus kelas' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    }
  };

  // ===== REGISTRATION OPERATIONS =====
  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/class-registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update status');

      setAlertMessage({ type: 'success', text: 'Status berhasil diperbarui!' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating status:', error);
      setAlertMessage({ type: 'error', text: 'Gagal memperbarui status' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    }
  };

  const handleGenerateCertificate = async (registration: ClassRegistration) => {
    if (registration.status !== 'approved' && registration.status !== 'completed') {
      setAlertMessage({ type: 'warning', text: 'Sertifikat hanya dapat dibuat untuk peserta yang sudah disetujui / selesai' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      return;
    }

    // Set default skill name based on program
    const skillMap: Record<string, string> = {
      'basic': 'Basic Barista skill',
      'latte': 'Latte Art skill',
      'manual': 'Manual brewing skill',
      'workshop': 'Coffee Workshop skill',
      'advanced': 'Advanced Barista skill',
      'roasting': 'Coffee Roasting skill'
    };
    const defaultSkill = skillMap[registration.programId?.toLowerCase()] || registration.programName;

    // Open generate certificate modal
    setSelectedRegistration(registration);
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setCertSkillName(defaultSkill);
    setCertDirectorName('RINA TUPON PANGUDI LUHUR, M.PD');
    setCertInstructorName('M RIZAL NOVIANTO');
    setShowGenerateCertModal(true);
  };

  const handleConfirmGenerateCertificate = async () => {
    if (!selectedRegistration) return;

    try {
      setGeneratingCert(true);

      // Step 1: If status is still 'approved', mark as completed first
      if (selectedRegistration.status === 'approved') {
        const statusRes = await fetch(`/api/admin/class-registrations/${selectedRegistration.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'completed' })
        });

        const statusData = await statusRes.json();
        if (!statusRes.ok || !statusData.success) {
          throw new Error(statusData.error || 'Gagal menandai peserta sebagai selesai');
        }
      }

      // Step 2: Generate certificate
      const res = await fetch('/api/admin/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          registrationId: selectedRegistration.id,
          completionDate: completionDate,
          skillName: certSkillName,
          directorName: certDirectorName,
          instructorName: certInstructorName,
          directorSignature: certDirectorSignature,
          instructorSignature: certInstructorSignature
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate certificate');
      }

      setGeneratedCertificate(data.certificate);
      setShowGenerateCertModal(false);
      setShowCertPreviewModal(true);
      
      // Reset signature setelah generate berhasil
      setCertDirectorSignature(null);
      setCertInstructorSignature(null);
      
      setAlertMessage({ type: 'success', text: 'Sertifikat berhasil digenerate!' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      
      fetchRegistrations();
    } catch (error) {
      console.error('Error generating certificate:', error);
      setAlertMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal generate sertifikat' 
      });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setGeneratingCert(false);
    }
  };

  const handleDownloadCertificate = (url: string, name: string) => {
    try {
      const src = new URL(url, window.location.origin).pathname;
      const qs = new URLSearchParams({ src, name });
      const link = document.createElement('a');
      link.href = `/api/certificates/download?${qs.toString()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading certificate PDF:', error);
      setAlertMessage({ type: 'error', text: 'Gagal mengunduh sertifikat (PDF)' });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    }
  };

  // Handle Approve/Reject with Confirmation
  const handleApproveClick = (reg: ClassRegistration) => {
    setConfirmingApprove(reg);
  };

  const handleApproveConfirm = async () => {
    if (!confirmingApprove) return;
    setIsProcessing(true);
    await handleUpdateStatus(confirmingApprove.id, 'approved');
    await fetchClasses();
    await fetchRegistrations();
    setConfirmingApprove(null);
    setIsProcessing(false);
  };

  const handleRejectClick = (reg: ClassRegistration) => {
    setConfirmingReject(reg);
  };

  const handleRejectConfirm = async () => {
    if (!confirmingReject) return;
    setIsProcessing(true);
    await handleUpdateStatus(confirmingReject.id, 'rejected');
    await fetchClasses();
    await fetchRegistrations();
    setConfirmingReject(null);
    setIsProcessing(false);
  };

  // Handle Mark Complete - Now just opens the generate certificate modal
  const handleMarkComplete = async (registration: ClassRegistration) => {
    // Directly open the generate certificate modal (no browser confirm)
    // The modal will handle marking as complete when user confirms
    handleGenerateCertificate(registration);
  };

  // Handle Revert to Approved
  const handleRevertClick = (registration: ClassRegistration) => {
    setConfirmingRevert(registration);
  };

  const handleRevertConfirm = async () => {
    if (!confirmingRevert) return;
    
    setIsProcessing(true);
    try {
      setMarkingComplete(confirmingRevert.id);
      
      const res = await fetch(`/api/admin/class-registrations/${confirmingRevert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mengubah status');
      }

      setAlertMessage({ type: 'success', text: `Status ${confirmingRevert.fullName} berhasil dikembalikan` });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
      
      await fetchRegistrations();
    } catch (error) {
      console.error('Error reverting status:', error);
      setAlertMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Gagal mengubah status'
      });
      setTimeout(() => setAlertMessage({ type: '', text: '' }), 4000);
    } finally {
      setMarkingComplete(null);
      setConfirmingRevert(null);
      setIsProcessing(false);
    }
  };

  // Payment Proof Modal
  const openPaymentModal = (paymentProof: string) => {
    setSelectedPaymentProof(paymentProof);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedPaymentProof(null);
  };

  // Certificate Modal
  const openCertificateModal = (certificateUrl: string) => {
    setSelectedCertificateUrl(certificateUrl);
    setShowCertificateModal(true);
  };

  const closeCertificateModal = () => {
    setShowCertificateModal(false);
    setSelectedCertificateUrl(null);
  };

  // Close Generate Certificate Modal and reset signatures
  const closeGenerateCertModal = () => {
    setShowGenerateCertModal(false);
    setCertDirectorSignature(null);
    setCertInstructorSignature(null);
  };

  // ===== STATISTICS =====
  const stats = {
    totalClasses: Array.isArray(classes) ? classes.filter(c => c.isActive).length : 0,
    totalParticipants: registrations.filter(r => r.status === 'approved' || r.status === 'completed').length,
    pendingRegistrations: registrations.filter(r => r.status === 'waiting').length
  };

  // Helper function to count approved participants per class
  const getApprovedCount = (classTitle: string) => {
    const count = registrations.filter(
      r => r.programName === classTitle && r.status === 'approved'
    ).length;
    return count;
  };

  // ===== FILTERING =====
  // Tab Pendaftaran: hanya status 'waiting', 'approved', dan 'rejected' (TIDAK 'completed')
  const filteredRegistrations = registrations
    .filter(reg => reg.status === 'waiting' || reg.status === 'approved' || reg.status === 'rejected')
    .filter(reg => {
      const matchesSearch = reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            reg.programName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

  // Filter for Kelola Peserta tab (approved and completed)
  const approvedParticipants = registrations
    .filter(reg => reg.status === 'approved' || reg.status === 'completed')
    .filter(reg => {
      const matchesSearch = reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             reg.programName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = pesertaStatusFilter === 'all' || reg.status === pesertaStatusFilter;
      return matchesSearch && matchesStatus;
    });

  // Stats for Kelola Peserta
  const pesertaStats = {
    total: registrations.filter(r => r.status === 'approved' || r.status === 'completed').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    completed: registrations.filter(r => r.status === 'completed').length,
    withCertificate: registrations.filter(r => r.certificateUrl).length
  };

  // ===== FORMAT HELPERS =====
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return null;
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '-';
    // If duration is in HH:MM format, convert to readable format
    const parts = duration.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      if (hours > 0 && minutes > 0) {
        return `${hours} jam ${minutes} menit`;
      } else if (hours > 0) {
        return `${hours} jam`;
      } else if (minutes > 0) {
        return `${minutes} menit`;
      }
    }
    return duration;
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

  // ===== RENDER =====
  return (
    <div className="classes-page">
      {/* Alert Messages - Fixed Position untuk visibilitas lebih baik */}
      {alertMessage.text && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9999,
            minWidth: '300px',
            maxWidth: '450px',
          }}
        >
          <Alert
            type={alertMessage.type as 'success' | 'error' | 'warning' | 'info'}
            message={alertMessage.text}
            onClose={() => setAlertMessage({ type: '', text: '' })}
          />
        </div>
      )}

      {/* Statistics Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <p className="stat-value">{stats.totalClasses}</p>
            <p className="stat-label">Kelas Aktif</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <p className="stat-value">{stats.totalParticipants}</p>
            <p className="stat-label">Total Peserta</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <p className="stat-value">{stats.pendingRegistrations}</p>
            <p className="stat-label">Menunggu Konfirmasi</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'kelas' ? 'active' : ''}`}
          onClick={() => setActiveTab('kelas')}
        >
          <span>📚</span>
          Daftar Kelas
        </button>
        <button
          className={`tab-button ${activeTab === 'pendaftaran' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendaftaran')}
        >
          <span>👥</span>
          Pendaftaran
        </button>
        <button
          className={`tab-button ${activeTab === 'kelolaPeserta' ? 'active' : ''}`}
          onClick={() => setActiveTab('kelolaPeserta')}
        >
          <span>🎓</span>
          Kelola Peserta
        </button>
      </div>

      {/* Tab 1: Daftar Kelas */}
      {!loading && activeTab === 'kelas' && (
        <>
          <div className="classes-header">
            <h2>Kelola Kelas Edukasi</h2>
            <button className="btn-barizta" onClick={handleAddClass}>
              <span>+</span>
              Tambah Kelas
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Belum Ada Kelas</h3>
              <p>Mulai tambahkan kelas edukasi pertama Anda</p>
            </div>
          ) : (
            <div className="classes-grid">
              {classes.map(classItem => (
                <div key={classItem.id} className="class-card">
                  <div className="class-image-wrapper">
                    <Image
                      src={classItem.image || '/images/menu/default.jpg'}
                      alt={classItem.title}
                      width={400}
                      height={200}
                      className="class-image"
                      unoptimized
                    />
                    <div className={`class-badge ${classItem.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {classItem.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                    </div>
                  </div>
                  <div className="class-content">
                    <div className="class-header">
                      <h3 className="class-title">{classItem.title}</h3>
                      <span className="class-level">{classItem.level}</span>
                    </div>
                    <div className="class-description">{renderStructuredDescription(classItem.description)}</div>
                    
                    {/* Informasi Paket Pelatihan */}
                    <div className="training-package-info">
                      <span className="package-label">📦 Paket Pelatihan</span>
                      <div className="package-details">
                        <span className="package-item">📅 {classItem.totalSessions || 4}x Pertemuan</span>
                        <span className="package-item">⏱️ {formatDuration(classItem.duration)} / Hari</span>
                      </div>
                    </div>
                    
                    <div className="class-info">
                      <div className="info-item">
                        <span className="info-icon">👨‍🏫</span>
                        {classItem.instructor}
                      </div>
                      <div className="info-item">
                        <span className="info-icon">👥</span>
                        {getApprovedCount(classItem.title)}/{classItem.maxParticipants} Peserta
                      </div>
                      <div className="info-item">
                        <span className="info-icon">📍</span>
                        {classItem.location}
                      </div>
                      {formatDate(classItem.schedule) && (
                        <div className="info-item">
                          <span className="info-icon">📅</span>
                          {formatDate(classItem.schedule)}
                        </div>
                      )}
                    </div>
                    <p className="class-price">{formatPrice(classItem.price)}</p>
                    <div className="class-actions">
                      <button
                        className="btn-barizta btn-barizta-sm"
                        onClick={() => handleEditClass(classItem)}
                      >
                        <span>✏️</span>
                        Edit
                      </button>
                      <button
                        className="btn-danger-barizta btn-barizta-sm"
                        onClick={() => setDeletingClass(classItem)}
                      >
                        <span>🗑️</span>
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Pendaftaran */}
      {!loading && activeTab === 'pendaftaran' && (
        <div className="enrollments-section">
          <div className="enrollments-header">
            <div className="search-filter">
              <SearchBar
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                placeholder="Cari nama, email, atau program..."
              />
              <FilterSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'waiting', label: 'Menunggu' },
                  { value: 'approved', label: 'Disetujui' },
                  { value: 'rejected', label: 'Ditolak' }
                ]}
              />
            </div>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Tidak Ada Pendaftaran</h3>
              <p>Belum ada peserta yang mendaftar</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table barizta-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Bukti Bayar</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map(reg => (
                    <tr key={reg.id}>
                      <td data-label="Nama">{reg.fullName}</td>
                      <td data-label="Email">{reg.email || '-'}</td>
                      <td data-label="Program">{reg.programName}</td>
                      <td data-label="Status">
                        <span className={`kelas-edukasi-status-${reg.status}`}>
                          {reg.status === 'waiting' && '⏳ Menunggu'}
                          {reg.status === 'approved' && '✅ Disetujui'}
                          {reg.status === 'rejected' && '❌ Ditolak'}
                          {reg.status === 'completed' && '🏆 Selesai'}
                        </span>
                      </td>
                      <td data-label="Bukti Bayar">
                        {reg.paymentProof ? (
                          <button
                            className="kelas-edukasi-btn btn-view-proof"
                            onClick={() => openPaymentModal(reg.paymentProof!)}
                          >
                            📸 Lihat Bukti
                          </button>
                        ) : (
                          <span style={{ color: '#9e9e9e' }}>Belum Upload</span>
                        )}
                      </td>
                      <td data-label="Aksi">
                        <div className="action-buttons">
                          <button
                            className="kelas-edukasi-btn btn-detail"
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setShowDetailModal(true);
                            }}
                          >
                            📄 Detail
                          </button>
                          {reg.status === 'waiting' && (
                            <>
                              <button
                                className="kelas-edukasi-btn btn-approve"
                                onClick={() => handleApproveClick(reg)}
                              >
                                ✅ Terima
                              </button>
                              <button
                                className="kelas-edukasi-btn btn-reject"
                                onClick={() => handleRejectClick(reg)}
                              >
                                ❌ Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Kelola Peserta */}
      {!loading && activeTab === 'kelolaPeserta' && (
        <div className="enrollments-section">
          {/* Stats Peserta */}
          <div className="peserta-stats-grid">
            <div className="peserta-stat-card">
              <span className="peserta-stat-icon">📊</span>
              <div className="peserta-stat-info">
                <span className="peserta-stat-number">{pesertaStats.total}</span>
                <span className="peserta-stat-label">Total Peserta</span>
              </div>
            </div>
            <div className="peserta-stat-card approved">
              <span className="peserta-stat-icon">✅</span>
              <div className="peserta-stat-info">
                <span className="peserta-stat-number">{pesertaStats.approved}</span>
                <span className="peserta-stat-label">Sedang Mengikuti</span>
              </div>
            </div>
            <div className="peserta-stat-card completed">
              <span className="peserta-stat-icon">🏆</span>
              <div className="peserta-stat-info">
                <span className="peserta-stat-number">{pesertaStats.completed}</span>
                <span className="peserta-stat-label">Telah Selesai</span>
              </div>
            </div>
            <div className="peserta-stat-card">
              <span className="peserta-stat-icon">🎓</span>
              <div className="peserta-stat-info">
                <span className="peserta-stat-number">{pesertaStats.withCertificate}</span>
                <span className="peserta-stat-label">Sertifikat Terbit</span>
              </div>
            </div>
          </div>

          <div className="enrollments-header">
            <div className="search-filter">
              <SearchBar
                value={searchTerm}
                onChange={(value) => setSearchTerm(value)}
                placeholder="Cari nama, email, atau program..."
              />
              <FilterSelect
                value={pesertaStatusFilter}
                onChange={(value) => setPesertaStatusFilter(value)}
                options={[
                  { value: 'all', label: 'Semua Peserta' },
                  { value: 'approved', label: 'Sedang Mengikuti' },
                  { value: 'completed', label: 'Telah Selesai' }
                ]}
              />
            </div>
          </div>

          {approvedParticipants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h3>Tidak Ada Peserta</h3>
              <p>Belum ada peserta yang sesuai dengan filter</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table barizta-table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Email/WhatsApp</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Bukti Bayar</th>
                    <th>Sertifikat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedParticipants.map(reg => (
                    <tr key={reg.id} className={reg.status === 'completed' ? 'row-completed' : ''}>
                      <td data-label="Nama">{reg.fullName}</td>
                      <td data-label="Kontak">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span>{reg.email || '-'}</span>
                          <span style={{ fontSize: '0.85rem', color: 'rgba(212, 165, 116, 0.7)' }}>{reg.whatsapp}</span>
                        </div>
                      </td>
                      <td data-label="Program">{reg.programName}</td>
                      <td data-label="Status">
                        <span className={`status-badge ${reg.status === 'approved' ? 'status-approved' : 'status-completed'}`}>
                          {reg.status === 'approved' && '📚 Disetujui'}
                          {reg.status === 'completed' && '🏆 Selesai'}
                        </span>
                      </td>
                      <td data-label="Bukti Bayar">
                        {reg.paymentProof ? (
                          <button
                            className="kelas-edukasi-btn btn-view-proof"
                            onClick={() => openPaymentModal(reg.paymentProof!)}
                          >
                            📸 Lihat
                          </button>
                        ) : (
                          <span style={{ color: '#9e9e9e' }}>-</span>
                        )}
                      </td>
                      <td data-label="Sertifikat">
                        {reg.certificateUrl ? (
                          <div className="certificate-actions">
                            <button
                              className="kelas-edukasi-btn btn-view-proof"
                              onClick={() => openCertificateModal(reg.certificateUrl!)}
                            >
                              🎓 Lihat
                            </button>
                            <button
                              className="kelas-edukasi-btn btn-download"
                              onClick={() => handleDownloadCertificate(reg.certificateUrl!, reg.fullName)}
                            >
                              📥 Download PDF
                            </button>
                          </div>
                        ) : reg.status === 'completed' ? (
                          <button
                            className="btn-warning-barizta btn-barizta-sm"
                            onClick={() => handleGenerateCertificate(reg)}
                            disabled={generatingCert}
                          >
                            🎓 Generate
                          </button>
                        ) : (
                          <span style={{ color: '#ffb74d', fontSize: '0.85rem' }}>-</span>
                        )}
                      </td>
                      <td data-label="Aksi">
                        <div className="action-buttons">
                          <button
                            className="kelas-edukasi-btn btn-detail"
                            onClick={() => {
                              setSelectedRegistration(reg);
                              setShowDetailModal(true);
                            }}
                          >
                            📄 Detail
                          </button>
                          {reg.status === 'approved' && (
                            <button
                              className="btn-complete-barizta btn-barizta-sm"
                              onClick={() => handleMarkComplete(reg)}
                              disabled={markingComplete === reg.id}
                              title="Selesaikan & Generate Sertifikat"
                            >
                              {markingComplete === reg.id ? '...' : '🎓'}
                            </button>
                          )}
                          {reg.status === 'completed' && !reg.certificateUrl && (
                            <button
                              className="btn-secondary-barizta btn-barizta-sm"
                              onClick={() => handleRevertClick(reg)}
                              disabled={markingComplete === reg.id}
                              title="Batalkan status selesai"
                            >
                              ↩️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Generate Certificate */}
      {showGenerateCertModal && selectedRegistration && (
        <div className="modal-overlay" onClick={closeGenerateCertModal}>
          <div className="modal-container generate-cert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎓 Generate Sertifikat</h2>
              <button className="modal-close" onClick={closeGenerateCertModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="cert-preview-info">
                <div className="info-row">
                  <span className="info-label">Nama Peserta:</span>
                  <span className="info-value">{selectedRegistration.fullName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Program:</span>
                  <span className="info-value">{selectedRegistration.programName}</span>
                </div>
                
                <div className="cert-form-divider"></div>
                <p className="cert-form-section-title">📝 Data Sertifikat (dapat diedit)</p>
                
                <div className="info-row">
                  <span className="info-label">Skill Name:</span>
                  <input
                    type="text"
                    value={certSkillName}
                    onChange={(e) => setCertSkillName(e.target.value)}
                    className="cert-input-field"
                    placeholder="Contoh: Manual brewing skill"
                  />
                </div>
                <div className="info-row">
                  <span className="info-label">Nama Direktur:</span>
                  <input
                    type="text"
                    value={certDirectorName}
                    onChange={(e) => setCertDirectorName(e.target.value)}
                    className="cert-input-field"
                    placeholder="Nama Direktur"
                  />
                </div>
                <div className="info-row signature-upload-row">
                  <span className="info-label">TTD Direktur:</span>
                  <div className="signature-upload-container">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      id="directorSignatureInput"
                      className="signature-file-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCertDirectorSignature(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="directorSignatureInput" className="signature-upload-label">
                      {certDirectorSignature ? (
                        <Image src={certDirectorSignature} alt="TTD Direktur" className="signature-preview" width={220} height={120} unoptimized />
                      ) : (
                        <span className="signature-placeholder">📝 Klik untuk upload TTD</span>
                      )}
                    </label>
                    {certDirectorSignature && (
                      <button 
                        type="button" 
                        className="signature-remove-btn"
                        onClick={() => setCertDirectorSignature(null)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <div className="info-row">
                  <span className="info-label">Nama Instruktur:</span>
                  <input
                    type="text"
                    value={certInstructorName}
                    onChange={(e) => setCertInstructorName(e.target.value)}
                    className="cert-input-field"
                    placeholder="Nama Instruktur"
                  />
                </div>
                <div className="info-row signature-upload-row">
                  <span className="info-label">TTD Instruktur:</span>
                  <div className="signature-upload-container">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      id="instructorSignatureInput"
                      className="signature-file-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setCertInstructorSignature(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="instructorSignatureInput" className="signature-upload-label">
                      {certInstructorSignature ? (
                        <Image src={certInstructorSignature} alt="TTD Instruktur" className="signature-preview" width={220} height={120} unoptimized />
                      ) : (
                        <span className="signature-placeholder">📝 Klik untuk upload TTD</span>
                      )}
                    </label>
                    {certInstructorSignature && (
                      <button 
                        type="button" 
                        className="signature-remove-btn"
                        onClick={() => setCertInstructorSignature(null)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="template-preview-section">
                <p className="template-label">Template Sertifikat:</p>
                <Image src="/certificates/serti.png" alt="Template Sertifikat" className="template-img" width={900} height={636} />
                <p className="template-note">
                  * Teks akan ditambahkan otomatis di atas template
                </p>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary-barizta"
                onClick={closeGenerateCertModal}
              >
                Batal
              </button>
              <button 
                className="btn-success-barizta"
                onClick={handleConfirmGenerateCertificate}
                disabled={generatingCert}
              >
                {generatingCert ? '⏳ Generating...' : '🎓 Generate Sertifikat'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Certificate Preview after Generate */}
      {showCertPreviewModal && generatedCertificate && (
        <div className="modal-overlay" onClick={() => setShowCertPreviewModal(false)}>
          <div className="modal-container cert-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ Sertifikat Berhasil Dibuat!</h2>
              <button className="modal-close" onClick={() => setShowCertPreviewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="generated-cert-preview">
                <Image src={generatedCertificate.url} alt="Sertifikat" className="generated-cert-img" width={900} height={636} unoptimized />
              </div>
              <div className="cert-info-box">
                <div className="info-row">
                  <span className="info-label">Kode Sertifikat:</span>
                  <span className="info-value cert-code">{generatedCertificate.code}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Nama:</span>
                  <span className="info-value">{generatedCertificate.recipientName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Program:</span>
                  <span className="info-value">{generatedCertificate.programName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Tanggal:</span>
                  <span className="info-value">{generatedCertificate.completionDate}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-secondary-barizta"
                onClick={() => setShowCertPreviewModal(false)}
              >
                Tutup
              </button>
              <button 
                className="kelas-edukasi-btn btn-download"
                onClick={() => handleDownloadCertificate(generatedCertificate.url, generatedCertificate.recipientName)}
              >
                📥 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Class */}
      {showClassModal && (
        <div className="modal-overlay" onClick={() => setShowClassModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
              <button className="modal-close" onClick={() => setShowClassModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>
                  Nama Kelas <span className="required">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Contoh: Basic Barista Course"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>
                  Deskripsi <span className="required">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan detail kelas..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Instruktur <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Nama instruktur"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="Pemula">Pemula</option>
                    <option value="Menengah">Menengah</option>
                    <option value="Lanjutan">Lanjutan</option>
                  </select>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Harga Paket (IDR) <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    required
                  />
                  <small className="form-hint">Harga adalah harga paket pelatihan lengkap</small>
                </div>
                <div className="form-group">
                  <label>
                    Kapasitas <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setFormData({ ...formData, maxParticipants: value });
                    }}
                    placeholder="10"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Jumlah Pertemuan <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.totalSessions}
                    onChange={(e) => setFormData({ ...formData, totalSessions: Number(e.target.value) })}
                    placeholder="4"
                    min="1"
                    required
                  />
                  <small className="form-hint">Jumlah pertemuan dalam paket pelatihan</small>
                </div>
                <div className="form-group">
                  <label>
                    Durasi per Pertemuan <span className="required">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                  />
                  <small className="form-hint">Format: HH:MM (contoh: 05:00 untuk 5 jam)</small>
                </div>
              </div>

              {/* Jam Pelaksanaan Tetap - Informasi Non-editable */}
              <div className="form-group">
                <label>Jam Pelaksanaan Kelas</label>
                <div className="fixed-schedule-info">
                  <div className="schedule-item">
                    <span className="schedule-icon">🕘</span>
                    <span>Sesi 1: 09.00 – 11.30</span>
                  </div>
                  <div className="schedule-item break">
                    <span className="schedule-icon">☕</span>
                    <span>Istirahat: 11.30 – 13.30</span>
                  </div>
                  <div className="schedule-item">
                    <span className="schedule-icon">🕜</span>
                    <span>Sesi 2: 13.30 – 16.00</span>
                  </div>
                </div>
                <small className="form-hint">Jam pelaksanaan kelas bersifat tetap dan tidak dapat diubah</small>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Lokasi <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Contoh: Barizta Coffee Shop"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  Jadwal (Tanggal) <span className="optional">(opsional)</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <button type="button" className="btn-clear" onClick={() => setFormData({ ...formData, schedule: '' })}>
                    Clear
                  </button>
                </div>
                <small className="form-hint">Pilih tanggal mulai kelas (kosongkan jika belum ditentukan)</small>
                  <style jsx>{` .btn-clear { background: transparent; border: 1px solid rgba(212,165,116,0.15); color: #d4a574; padding: 0.4rem 0.6rem; border-radius: 6px; cursor: pointer; } .btn-clear:hover { border-color: #d4a574; } `}</style>
              </div>
              
              <div className="form-group">
                <label>Gambar Kelas</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                />
                <small className="form-hint">Format: JPG, PNG (Maksimum 5MB)</small>
                {imageFile && (
                  <small className="form-hint">File dipilih: {imageFile.name}</small>
                )}
                {editingClass?.image && !imageFile && (
                  <small className="form-hint">Gambar saat ini sudah ada (tidak diubah jika tidak memilih file baru).</small>
                )}
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label compact">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Aktifkan kelas ini
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary-barizta" 
                onClick={() => setShowClassModal(false)}
                disabled={uploading}
              >
                Batal
              </button>
              <button 
                className="btn-barizta" 
                onClick={handleSaveClass}
                disabled={uploading}
              >
                {uploading ? 'Mengupload...' : editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deletingClass && (
        <DeleteConfirmModal
          isOpen={!!deletingClass}
          onClose={() => setDeletingClass(null)}
          onConfirm={handleDeleteClass}
          itemName={deletingClass.title}
          itemType="kelas"
        />
      )}

      {/* Modal: Registration Detail - Enhanced */}
      {showDetailModal && selectedRegistration && (
        <div className="modal-overlay" onClick={() => { setShowDetailModal(false); setSelectedRegistration(null); }}>
          <div className="modal-container detail-modal-full" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Detail Pendaftaran #{selectedRegistration.id}</h2>
              <button className="modal-close" onClick={() => { setShowDetailModal(false); setSelectedRegistration(null); }}>
                ×
              </button>
            </div>
            <div className="modal-body">
              {/* Status Banner */}
              <div className={`detail-status-banner status-${selectedRegistration.status}`}>
                {selectedRegistration.status === 'waiting' && '⏳ Menunggu Konfirmasi'}
                {selectedRegistration.status === 'approved' && '✅ Sedang Mengikuti Kelas'}
                {selectedRegistration.status === 'completed' && '🏆 Telah Selesai'}
                {selectedRegistration.status === 'rejected' && '❌ Ditolak'}
              </div>

              {/* Section: Data Diri */}
              <div className="detail-section">
                <h3>👤 Data Diri</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nama Lengkap</label>
                    <span>{selectedRegistration.fullName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{selectedRegistration.email || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>WhatsApp</label>
                    <a href={`https://wa.me/${selectedRegistration.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="whatsapp-link">
                      {selectedRegistration.whatsapp}
                    </a>
                  </div>
                  {selectedRegistration.birthDate && (
                    <div className="detail-item">
                      <label>Tanggal Lahir</label>
                      <span>{formatDate(selectedRegistration.birthDate)}</span>
                    </div>
                  )}
                  {selectedRegistration.gender && (
                    <div className="detail-item">
                      <label>Jenis Kelamin</label>
                      <span>{selectedRegistration.gender}</span>
                    </div>
                  )}
                  {selectedRegistration.address && (
                    <div className="detail-item full-width">
                      <label>Alamat</label>
                      <span>{selectedRegistration.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Program */}
              <div className="detail-section">
                <h3>📚 Program & Jadwal</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Program</label>
                    <span className="program-highlight">{selectedRegistration.programName}</span>
                  </div>
                  {selectedRegistration.schedulePreference && (
                    <div className="detail-item">
                      <label>Jadwal Preferensi</label>
                      <span>{selectedRegistration.schedulePreference}</span>
                    </div>
                  )}
                  {selectedRegistration.selectedPackages && (
                    <div className="detail-item full-width">
                      <label>Paket Dipilih</label>
                      <div className="packages-list">
                        {(() => {
                          try {
                            const packages = JSON.parse(selectedRegistration.selectedPackages);
                            return Array.isArray(packages) 
                              ? packages.map((pkg: string, idx: number) => <span key={idx} className="package-tag">{pkg}</span>)
                              : <span className="package-tag">{selectedRegistration.selectedPackages}</span>;
                          } catch {
                            return <span className="package-tag">{selectedRegistration.selectedPackages}</span>;
                          }
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Pengalaman */}
              {(selectedRegistration.experience || selectedRegistration.previousTraining !== undefined) && (
                <div className="detail-section">
                  <h3>☕ Pengalaman Barista</h3>
                  <div className="detail-grid">
                    {selectedRegistration.experience && (
                      <div className="detail-item">
                        <label>Pengalaman</label>
                        <span>{selectedRegistration.experience}</span>
                      </div>
                    )}
                    {selectedRegistration.previousTraining !== undefined && (
                      <div className="detail-item">
                        <label>Pernah Pelatihan</label>
                        <span>{selectedRegistration.previousTraining ? 'Ya' : 'Tidak'}</span>
                      </div>
                    )}
                    {selectedRegistration.trainingDetails && (
                      <div className="detail-item full-width">
                        <label>Detail Pelatihan</label>
                        <span>{selectedRegistration.trainingDetails}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section: Pembayaran */}
              <div className="detail-section">
                <h3>💳 Pembayaran</h3>
                {selectedRegistration.paymentProof ? (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Image
                      src={selectedRegistration.paymentProof}
                      alt="Bukti Pembayaran"
                      width={500}
                      height={350}
                      style={{ 
                        borderRadius: '8px',
                        maxWidth: '100%',
                        height: 'auto',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      onClick={() => openPaymentModal(selectedRegistration.paymentProof!)}
                      unoptimized
                    />
                    <p style={{ fontSize: '0.85rem', color: '#9e9e9e', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      💡 Klik gambar untuk memperbesar
                    </p>
                  </div>
                ) : (
                  <div className="no-payment-warning">
                    ⚠️ Peserta belum mengupload bukti pembayaran
                  </div>
                )}
              </div>

              {/* Section: Sertifikat */}
              {selectedRegistration.certificateUrl && (
                <div className="detail-section">
                  <h3>🎓 Sertifikat</h3>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      className="kelas-edukasi-btn btn-view-proof"
                      onClick={() => openCertificateModal(selectedRegistration.certificateUrl!)}
                    >
                      👁️ Lihat Sertifikat
                    </button>
                    <button
                      className="kelas-edukasi-btn btn-download"
                      onClick={() => handleDownloadCertificate(selectedRegistration.certificateUrl!, selectedRegistration.fullName)}
                    >
                      📥 Download PDF
                    </button>
                  </div>
                </div>
              )}

              {/* Section: Admin Notes */}
              {selectedRegistration.adminNotes && (
                <div className="detail-section">
                  <h3>📝 Catatan Admin</h3>
                  <p className="admin-notes">{selectedRegistration.adminNotes}</p>
                </div>
              )}

              {/* Section: Timestamp */}
              <div className="detail-section">
                <h3>🕐 Timestamp</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tanggal Daftar</label>
                    <span>{new Date(selectedRegistration.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                  {selectedRegistration.updatedAt && (
                    <div className="detail-item">
                      <label>Terakhir Update</label>
                      <span>{new Date(selectedRegistration.updatedAt).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              {selectedRegistration.status === 'waiting' && (
                <>
                  <button
                    className="btn-success-barizta"
                    onClick={() => { setShowDetailModal(false); handleApproveClick(selectedRegistration); }}
                  >
                    ✅ Terima Pendaftaran
                  </button>
                  <button
                    className="btn-danger-barizta"
                    onClick={() => { setShowDetailModal(false); handleRejectClick(selectedRegistration); }}
                  >
                    ❌ Tolak
                  </button>
                </>
              )}
              {selectedRegistration.status === 'approved' && (
                <button
                  className="btn-complete-barizta"
                  onClick={() => { setShowDetailModal(false); handleMarkComplete(selectedRegistration); }}
                >
                  ✓ Tandai Telah Selesai
                </button>
              )}
              {selectedRegistration.status === 'completed' && !selectedRegistration.certificateUrl && (
                <button
                  className="btn-success-barizta"
                  onClick={() => { setShowDetailModal(false); handleGenerateCertificate(selectedRegistration); }}
                >
                  🎓 Generate Sertifikat
                </button>
              )}
              <button
                className="btn-secondary-barizta"
                onClick={() => { setShowDetailModal(false); setSelectedRegistration(null); }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Payment Proof */}
      {showPaymentModal && selectedPaymentProof && (
        <div className="modal-overlay" onClick={closePaymentModal}>
          <div className="modal-container payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bukti Pembayaran</h2>
              <button className="modal-close" onClick={closePaymentModal}>
                ×
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <Image
                src={selectedPaymentProof}
                alt="Bukti Pembayaran"
                width={600}
                height={800}
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                unoptimized
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary-barizta" onClick={closePaymentModal}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Certificate View */}
      {showCertificateModal && selectedCertificateUrl && (
        <div className="modal-overlay" onClick={closeCertificateModal}>
          <div className="modal-container certificate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎓 Sertifikat</h2>
              <button className="modal-close" onClick={closeCertificateModal}>
                ×
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <Image
                src={selectedCertificateUrl}
                alt="Sertifikat"
                width={800}
                height={600}
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                unoptimized
              />
            </div>
            <div className="modal-actions">
              <button
                className="kelas-edukasi-btn btn-download"
                onClick={() => handleDownloadCertificate(selectedCertificateUrl, selectedRegistration?.fullName || 'Sertifikat')}
              >
                📥 Download PDF
              </button>
              <button className="btn-secondary-barizta" onClick={closeCertificateModal}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!confirmingApprove}
        onClose={() => setConfirmingApprove(null)}
        onConfirm={handleApproveConfirm}
        itemName={confirmingApprove?.fullName || confirmingApprove?.user?.name || 'Peserta ini'}
        itemType="pendaftaran"
        title="Konfirmasi Persetujuan"
        warningText="Apakah Anda yakin ingin menyetujui pendaftaran ini? Peserta akan dinotifikasi melalui email."
        confirmButtonText="✅ Setujui"
        cancelButtonText="Batal"
      />

      {/* Rejection Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!confirmingReject}
        onClose={() => setConfirmingReject(null)}
        onConfirm={handleRejectConfirm}
        itemName={confirmingReject?.fullName || confirmingReject?.user?.name || 'Peserta ini'}
        itemType="pendaftaran"
        title="Konfirmasi Penolakan"
        warningText="Apakah Anda yakin ingin menolak pendaftaran ini? Tindakan ini tidak dapat dibatalkan dan peserta akan dinotifikasi."
        confirmButtonText="❌ Tolak"
        cancelButtonText="Batal"
      />

      {/* Revert Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!confirmingRevert}
        onClose={() => setConfirmingRevert(null)}
        onConfirm={handleRevertConfirm}
        itemName={confirmingRevert?.fullName || confirmingRevert?.user?.name || 'Peserta ini'}
        itemType="status selesai"
        title="Konfirmasi Pembatalan Status"
        warningText="Apakah Anda yakin ingin membatalkan status selesai? Status akan dikembalikan ke 'Disetujui'."
        confirmButtonText="↩️ Batalkan Status"
        cancelButtonText="Batal"
      />
    </div>
  );
}
