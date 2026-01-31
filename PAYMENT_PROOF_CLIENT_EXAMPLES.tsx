/**
 * Example: Client-side implementation untuk upload payment proof
 * 
 * Terdapat 2 cara untuk upload:
 * 1. Multipart Form Data (Recommended) - langsung upload file
 * 2. Base64 JSON (Backward Compatible) - convert file ke base64 dulu
 */

// ============================================================================
// CARA 1: Multipart Form Data (RECOMMENDED)
// ============================================================================

/**
 * Submit registration dengan file upload langsung
 */
async function submitRegistrationWithFile(formElement: HTMLFormElement) {
  try {
    // Create FormData from form element
    const formData = new FormData(formElement);
    
    // OR manually build FormData
    // const formData = new FormData();
    // formData.append('programId', 'barista-basic');
    // formData.append('programName', 'Barista Basic Training');
    // formData.append('fullName', 'John Doe');
    // formData.append('birthDate', '1990-01-01');
    // formData.append('gender', 'male');
    // formData.append('address', 'Jakarta');
    // formData.append('whatsapp', '08123456789');
    // formData.append('email', 'john@example.com');
    // formData.append('selectedPackages', JSON.stringify(['basic', 'intermediate']));
    // formData.append('schedulePreference', 'weekday');
    // formData.append('experience', 'beginner');
    // formData.append('previousTraining', 'false');
    // formData.append('paymentProof', fileInput.files[0]); // File object
    
    const response = await fetch('/api/member/class-registrations', {
      method: 'POST',
      body: formData,
      // IMPORTANT: Jangan set Content-Type header!
      // Browser akan otomatis set ke multipart/form-data dengan boundary
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit registration');
    }
    
    const result = await response.json();
    console.log('Registration successful:', result);
    return result;
    
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Usage example dengan HTML form
/*
<form id="registrationForm" onsubmit="handleSubmit(event)">
  <input type="text" name="programId" value="barista-basic" />
  <input type="text" name="programName" value="Barista Basic Training" />
  <input type="text" name="fullName" placeholder="Full Name" required />
  <input type="date" name="birthDate" required />
  <select name="gender" required>
    <option value="male">Male</option>
    <option value="female">Female</option>
  </select>
  <textarea name="address" placeholder="Address" required></textarea>
  <input type="tel" name="whatsapp" placeholder="WhatsApp Number" required />
  <input type="email" name="email" placeholder="Email" />
  <select name="selectedPackages" multiple required>
    <option value="basic">Basic</option>
    <option value="intermediate">Intermediate</option>
  </select>
  <select name="schedulePreference" required>
    <option value="weekday">Weekday</option>
    <option value="weekend">Weekend</option>
  </select>
  <select name="experience" required>
    <option value="beginner">Beginner</option>
    <option value="intermediate">Intermediate</option>
  </select>
  <input type="file" name="paymentProof" accept="image/*" required />
  <button type="submit">Submit</button>
</form>

<script>
  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    try {
      const result = await submitRegistrationWithFile(form);
      alert('Registration successful!');
      form.reset();
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  }
</script>
*/

// ============================================================================
// CARA 2: Base64 JSON (BACKWARD COMPATIBLE)
// ============================================================================

/**
 * Convert File to Base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Submit registration dengan base64 string
 */
async function submitRegistrationWithBase64(data: {
  programId: string;
  programName: string;
  fullName: string;
  birthDate: string;
  gender: string;
  address: string;
  whatsapp: string;
  email?: string;
  selectedPackages: string[];
  schedulePreference: string;
  experience: string;
  previousTraining?: boolean;
  trainingDetails?: string;
  paymentProofFile: File;
}) {
  try {
    // Convert file to base64
    const paymentProofBase64 = await fileToBase64(data.paymentProofFile);
    
    const requestBody = {
      programId: data.programId,
      programName: data.programName,
      fullName: data.fullName,
      birthDate: data.birthDate,
      gender: data.gender,
      address: data.address,
      whatsapp: data.whatsapp,
      email: data.email,
      selectedPackages: data.selectedPackages,
      schedulePreference: data.schedulePreference,
      experience: data.experience,
      previousTraining: data.previousTraining || false,
      trainingDetails: data.trainingDetails,
      paymentProof: paymentProofBase64, // Base64 string
    };
    
    const response = await fetch('/api/member/class-registrations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit registration');
    }
    
    const result = await response.json();
    console.log('Registration successful:', result);
    return result;
    
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// ============================================================================
// REACT / NEXT.JS EXAMPLE
// ============================================================================

/**
 * React component example
 */
import { useState, FormEvent } from 'react';

export function ClassRegistrationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const form = event.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('/api/member/class-registrations', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit registration');
      }
      
      const result = await response.json();
      console.log('Success:', result);
      
      // Show success message
      alert('Pendaftaran berhasil! Silakan tunggu konfirmasi dari admin.');
      
      // Reset form
      form.reset();
      
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <input type="text" name="programId" value="barista-basic" hidden />
      <input type="text" name="programName" value="Barista Basic Training" hidden />
      
      <div>
        <label>Full Name *</label>
        <input type="text" name="fullName" required />
      </div>
      
      <div>
        <label>Birth Date *</label>
        <input type="date" name="birthDate" required />
      </div>
      
      {/* ... other fields ... */}
      
      <div>
        <label>Payment Proof *</label>
        <input 
          type="file" 
          name="paymentProof" 
          accept="image/jpeg,image/png,image/webp" 
          required 
        />
        <small>Max 5MB, format: JPG, PNG, WebP</small>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Registration'}
      </button>
    </form>
  );
}

// ============================================================================
// UPDATE PAYMENT PROOF
// ============================================================================

/**
 * Update payment proof untuk registrasi yang sudah ada
 */
async function updatePaymentProof(registrationId: number, file: File) {
  try {
    const formData = new FormData();
    formData.append('paymentProof', file);
    
    const response = await fetch(`/api/member/class-registrations/${registrationId}`, {
      method: 'PUT',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update payment proof');
    }
    
    const result = await response.json();
    console.log('Update successful:', result);
    return result;
    
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate file before upload
 */
function validatePaymentProof(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 5MB.'
    };
  }
  
  return { valid: true };
}

// Usage
/*
const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
fileInput?.addEventListener('change', (e) => {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const validation = validatePaymentProof(file);
    if (!validation.valid) {
      alert(validation.error);
      fileInput.value = ''; // Clear invalid file
    }
  }
});
*/

// ============================================================================
// FETCH REGISTRATIONS
// ============================================================================

/**
 * Fetch user's registrations
 */
async function fetchMyRegistrations(filters?: {
  status?: string;
  type?: 'active' | 'history';
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const response = await fetch(`/api/member/class-registrations?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch registrations');
    }
    
    const registrations = await response.json();
    console.log('Registrations:', registrations);
    return registrations;
    
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

/**
 * Display payment proof image
 */
function displayPaymentProof(registrationId: number) {
  // Payment proof URL is included in registration data
  // It can be displayed directly as image src
  const imgUrl = `/api/payment-proof/${registrationId}`;
  
  // Example: Show in modal
  const img = document.createElement('img');
  img.src = imgUrl;
  img.alt = 'Payment Proof';
  img.style.maxWidth = '100%';
  
  // Or use in React/Next.js
  // <img src={`/api/payment-proof/${registrationId}`} alt="Payment Proof" />
}

export {
  submitRegistrationWithFile,
  submitRegistrationWithBase64,
  updatePaymentProof,
  validatePaymentProof,
  fetchMyRegistrations,
  displayPaymentProof,
};
