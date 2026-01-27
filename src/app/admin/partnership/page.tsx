"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect to Kolaborasi page with Partners tab active
 * Data Mitra is now integrated into the Kolaborasi page
 */
export default function PartnershipRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/kolaborasi?tab=partners");
  }, [router]);

  return (
    <div className="admin-page">
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Mengalihkan ke halaman Kolaborasi...</p>
      </div>
    </div>
  );
}
