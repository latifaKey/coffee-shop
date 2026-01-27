"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import "./about.css";
import ActionButton, { ActionButtonGroup } from "@/components/admin/ActionButton";
import ImageUploader from "@/components/admin/ImageUploader";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

interface Milestone {
  id: number;
  year: string;
  title: string;
  description: string;
  order: number;
}

interface Team {
  id: number;
  name: string;
  position: string;
  photo: string;
  bio: string;
  order: number;
}

export default function TentangKami() {
  const [activeTab, setActiveTab] = useState<"milestones" | "team">("milestones");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Milestones State
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneModalMode, setMilestoneModalMode] = useState<"add" | "edit" | "detail">("add");
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [milestoneFormData, setMilestoneFormData] = useState<Partial<Milestone>>({
    year: "",
    title: "",
    description: "",
    order: 1
  });

  // Team State
  const [teamMembers, setTeamMembers] = useState<Team[]>([]);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamModalMode, setTeamModalMode] = useState<"add" | "edit" | "detail">("add");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamFormData, setTeamFormData] = useState<Partial<Team>>({
    name: "",
    position: "",
    photo: "",
    bio: "",
    order: 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<Team | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleTeamPhotoUploaded = (filename: string) => {
    // Ensure the image path is properly formatted with /uploads/ prefix
    const photoPath = filename.startsWith('/') ? filename : `/uploads/${filename}`;
    setTeamFormData({ ...teamFormData, photo: photoPath });
  };

  const fetchMilestones = useCallback(async () => {
    try {
      const response = await fetch("/api/milestones");
      if (!response.ok) throw new Error("Failed to fetch milestones");
      const data = await response.json();
      setMilestones(data);
    } catch (err) {
      console.error("Error fetching milestones:", err);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const response = await fetch("/api/team");
      if (!response.ok) throw new Error("Failed to fetch team members");
      const data = await response.json();
      setTeamMembers(data);
    } catch (err) {
      console.error("Error fetching team members:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMilestones(), fetchTeamMembers()]);
      setLoading(false);
    };
    loadData();
  }, [fetchMilestones, fetchTeamMembers]);

  // Milestone Handlers
  const handleOpenMilestoneModal = (mode: "add" | "edit" | "detail", milestone?: Milestone) => {
    setMilestoneModalMode(mode);
    setError("");
    setSuccess("");
    if (milestone) {
      setSelectedMilestone(milestone);
      setMilestoneFormData({
        year: milestone.year,
        title: milestone.title,
        description: milestone.description,
        order: milestone.order
      });
    } else {
      setSelectedMilestone(null);
      setMilestoneFormData({ year: "", title: "", description: "", order: milestones.length + 1 });
    }
    setShowMilestoneModal(true);
  };

  const handleCloseMilestoneModal = () => {
    setShowMilestoneModal(false);
    setSelectedMilestone(null);
    setError("");
    setSuccess("");
  };

  const handleSaveMilestone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    
    try {
      setError("");
      
      if (milestoneModalMode === "add") {
        const response = await fetch("/api/milestones", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(milestoneFormData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create milestone");
        }

        setSuccess("Milestone berhasil ditambahkan!");
        await fetchMilestones();
      } else if (milestoneModalMode === "edit" && selectedMilestone) {
        const response = await fetch(`/api/milestones/${selectedMilestone.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(milestoneFormData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update milestone");
        }

        setSuccess("Milestone berhasil diupdate!");
        await fetchMilestones();
      }
      
      setTimeout(() => handleCloseMilestoneModal(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan milestone");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMilestoneClick = (milestone: Milestone) => {
    setDeletingMilestone(milestone);
  };

  const handleDeleteMilestoneConfirm = async () => {
    if (!deletingMilestone) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/milestones/${deletingMilestone.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete milestone");

      setSuccess("Milestone berhasil dihapus!");
      setDeletingMilestone(null);
      await fetchMilestones();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus milestone");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Team Handlers
  const handleOpenTeamModal = (mode: "add" | "edit" | "detail", member?: Team) => {
    setTeamModalMode(mode);
    setError("");
    setSuccess("");
    if (member) {
      setSelectedTeam(member);
      setTeamFormData({
        name: member.name,
        position: member.position,
        photo: member.photo,
        bio: member.bio,
        order: member.order
      });
    } else {
      setSelectedTeam(null);
      setTeamFormData({ name: "", position: "", photo: "", bio: "", order: teamMembers.length + 1 });
    }
    setShowTeamModal(true);
  };

  const handleCloseTeamModal = () => {
    setShowTeamModal(false);
    setSelectedTeam(null);
    setError("");
    setSuccess("");
  };

  const handleSaveTeam = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    
    try {
      setError("");
      
      if (teamModalMode === "add") {
        const response = await fetch("/api/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamFormData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create team member");
        }

        setSuccess("Anggota tim berhasil ditambahkan!");
        await fetchTeamMembers();
      } else if (teamModalMode === "edit" && selectedTeam) {
        const response = await fetch(`/api/team/${selectedTeam.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teamFormData),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update team member");
        }

        setSuccess("Anggota tim berhasil diupdate!");
        await fetchTeamMembers();
      }
      
      setTimeout(() => handleCloseTeamModal(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan anggota tim");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeamClick = (member: Team) => {
    setDeletingTeam(member);
  };

  const handleDeleteTeamConfirm = async () => {
    if (!deletingTeam) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/team/${deletingTeam.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete team member");

      setSuccess("Anggota tim berhasil dihapus!");
      setDeletingTeam(null);
      await fetchTeamMembers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus anggota tim");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="tentang-kami-container">
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="page-header">
        <div>
          <h1>Kelola Tentang Kami</h1>
          <p>Kelola milestone dan tim BARIZTA</p>
        </div>
        {activeTab === "milestones" ? (
          <button className="btn-barizta" onClick={() => handleOpenMilestoneModal("add")}>
            + Tambah Milestone
          </button>
        ) : (
          <button className="btn-barizta" onClick={() => handleOpenTeamModal("add")}>
            + Tambah Anggota
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === "milestones" ? "active" : ""}`}
          onClick={() => setActiveTab("milestones")}
        >
          Milestone ({milestones.length})
        </button>
        <button 
          className={`tab ${activeTab === "team" ? "active" : ""}`}
          onClick={() => setActiveTab("team")}
        >
          Tim BARIZTA ({teamMembers.length})
        </button>
      </div>

      {/* Milestones Tab - Table View */}
      {activeTab === "milestones" && (
        <div className="table-container">
          <table className="data-table barizta-table">
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Tahun</th>
                <th>Judul</th>
                <th>Deskripsi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {milestones.length > 0 ? (
                milestones.map((milestone) => (
                  <tr key={milestone.id}>
                    <td><span className="order-badge">#{milestone.order}</span></td>
                    <td><strong>{milestone.year}</strong></td>
                    <td>{milestone.title}</td>
                    <td>
                      <small>{milestone.description.substring(0, 60)}{milestone.description.length > 60 ? '...' : ''}</small>
                    </td>
                    <td>
                      <ActionButtonGroup>
                        <ActionButton type="detail" onClick={() => handleOpenMilestoneModal("detail", milestone)} />
                        <ActionButton type="edit" onClick={() => handleOpenMilestoneModal("edit", milestone)} />
                        <ActionButton type="delete" onClick={() => handleDeleteMilestoneClick(milestone)} />
                      </ActionButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    Belum ada milestone yang ditambahkan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Team Tab - Table View */}
      {activeTab === "team" && (
        <div className="table-container">
          <table className="data-table barizta-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nama</th>
                <th>Posisi</th>
                <th>Bio</th>
                <th>Urutan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="table-image">
                        <Image 
                          src={member.photo || "/images/default-avatar.jpg"} 
                          alt={member.name}
                          width={50}
                          height={50}
                          style={{ objectFit: 'cover', borderRadius: '50%' }}
                          unoptimized
                        />
                      </div>
                    </td>
                    <td><strong>{member.name}</strong></td>
                    <td>
                      <span className="badge badge-position">{member.position}</span>
                    </td>
                    <td>
                      <small>{(member.bio || "-").substring(0, 40)}{member.bio && member.bio.length > 40 ? '...' : ''}</small>
                    </td>
                    <td><span className="order-badge">#{member.order}</span></td>
                    <td>
                      <ActionButtonGroup>
                        <ActionButton type="detail" onClick={() => handleOpenTeamModal("detail", member)} />
                        <ActionButton type="edit" onClick={() => handleOpenTeamModal("edit", member)} />
                        <ActionButton type="delete" onClick={() => handleDeleteTeamClick(member)} />
                      </ActionButtonGroup>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    Belum ada anggota tim yang ditambahkan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="modal-overlay" onClick={handleCloseMilestoneModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {milestoneModalMode === "add" && "Tambah Milestone Baru"}
                {milestoneModalMode === "edit" && "Edit Milestone"}
                {milestoneModalMode === "detail" && "Detail Milestone"}
              </h2>
              <button className="modal-close" onClick={handleCloseMilestoneModal}>×</button>
            </div>

            {milestoneModalMode === "detail" ? (
              <div className="modal-body">
                <div className="detail-info">
                  <h3>{selectedMilestone?.title}</h3>
                  <div className="detail-row">
                    <span className="detail-label">Tahun:</span>
                    <span className="detail-value">{selectedMilestone?.year}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Urutan:</span>
                    <span className="order-badge">#{selectedMilestone?.order}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Deskripsi:</span>
                  </div>
                  <p className="detail-description">{selectedMilestone?.description}</p>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseMilestoneModal}>Tutup</button>
                  <button type="button" className="btn-barizta" onClick={() => {
                    if (selectedMilestone) handleOpenMilestoneModal("edit", selectedMilestone);
                  }}>Edit Milestone</button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-body">
                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tahun *</label>
                      <input
                        type="text"
                        value={milestoneFormData.year}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, year: e.target.value })}
                        required
                        placeholder="Contoh: 2024"
                      />
                    </div>
                    <div className="form-group">
                      <label>Urutan *</label>
                      <input
                        type="number"
                        value={milestoneFormData.order}
                        onChange={(e) => setMilestoneFormData({ ...milestoneFormData, order: parseInt(e.target.value) || 1 })}
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Judul *</label>
                    <input
                      type="text"
                      value={milestoneFormData.title}
                      onChange={(e) => setMilestoneFormData({ ...milestoneFormData, title: e.target.value })}
                      required
                      placeholder="Judul milestone"
                    />
                  </div>

                  <div className="form-group">
                    <label>Deskripsi *</label>
                    <textarea
                      value={milestoneFormData.description}
                      onChange={(e) => setMilestoneFormData({ ...milestoneFormData, description: e.target.value })}
                      required
                      rows={4}
                      placeholder="Deskripsi lengkap milestone..."
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseMilestoneModal}>Batal</button>
                  <button type="button" className="btn-barizta" disabled={submitting} onClick={handleSaveMilestone}>
                    {submitting ? 'Menyimpan...' : (milestoneModalMode === "add" ? "Tambah Milestone" : "Simpan Perubahan")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div className="modal-overlay" onClick={handleCloseTeamModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {teamModalMode === "add" && "Tambah Anggota Tim"}
                {teamModalMode === "edit" && "Edit Anggota Tim"}
                {teamModalMode === "detail" && "Detail Anggota Tim"}
              </h2>
              <button className="modal-close" onClick={handleCloseTeamModal}>×</button>
            </div>

            {teamModalMode === "detail" ? (
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-image">
                    <Image 
                      src={selectedTeam?.photo || '/images/default-avatar.jpg'} 
                      alt={selectedTeam?.name || 'Team'}
                      width={150}
                      height={150}
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                      unoptimized
                    />
                  </div>
                  <div className="detail-info">
                    <h3>{selectedTeam?.name}</h3>
                    <div className="detail-row">
                      <span className="detail-label">Posisi:</span>
                      <span className="badge badge-position">{selectedTeam?.position}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Urutan:</span>
                      <span className="order-badge">#{selectedTeam?.order}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Bio:</span>
                    </div>
                    <p className="detail-description">{selectedTeam?.bio || '-'}</p>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseTeamModal}>Tutup</button>
                  <button type="button" className="btn-barizta" onClick={() => {
                    if (selectedTeam) handleOpenTeamModal("edit", selectedTeam);
                  }}>Edit Anggota</button>
                </div>
              </div>
            ) : (
              <>
                <div className="modal-body">
                  {error && <div className="alert alert-error">{error}</div>}
                  {success && <div className="alert alert-success">{success}</div>}

                  <div className="form-group">
                    <label>Nama *</label>
                    <input
                      type="text"
                      value={teamFormData.name}
                      onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                      required
                      placeholder="Nama lengkap"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Posisi *</label>
                      <input
                        type="text"
                        value={teamFormData.position}
                        onChange={(e) => setTeamFormData({ ...teamFormData, position: e.target.value })}
                        required
                        placeholder="Contoh: Head Barista"
                      />
                    </div>
                    <div className="form-group">
                      <label>Urutan *</label>
                      <input
                        type="number"
                        value={teamFormData.order}
                        onChange={(e) => setTeamFormData({ ...teamFormData, order: parseInt(e.target.value) || 1 })}
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Foto</label>
                    <ImageUploader 
                      initialPreview={teamFormData.photo || null}
                      onUploaded={handleTeamPhotoUploaded}
                    />
                  </div>

                  <div className="form-group">
                    <label>Bio *</label>
                    <textarea
                      value={teamFormData.bio}
                      onChange={(e) => setTeamFormData({ ...teamFormData, bio: e.target.value })}
                      required
                      rows={3}
                      placeholder="Deskripsi singkat tentang anggota tim..."
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-secondary-barizta" onClick={handleCloseTeamModal}>Batal</button>
                  <button type="button" className="btn-barizta" disabled={submitting} onClick={handleSaveTeam}>
                    {submitting ? 'Menyimpan...' : (teamModalMode === "add" ? "Tambah Anggota" : "Simpan Perubahan")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Milestone Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingMilestone}
        onClose={() => setDeletingMilestone(null)}
        onConfirm={handleDeleteMilestoneConfirm}
        itemName={deletingMilestone ? `${deletingMilestone.year} - ${deletingMilestone.title}` : ""}
        itemType="milestone"
        isLoading={isDeleting}
      />

      {/* Delete Team Member Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTeam}
        onClose={() => setDeletingTeam(null)}
        onConfirm={handleDeleteTeamConfirm}
        itemName={deletingTeam?.name || ""}
        itemType="anggota tim"
        isLoading={isDeleting}
      />
    </div>
  );
}
