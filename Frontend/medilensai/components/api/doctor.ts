const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DoctorSignupPayload {
  basic_details: {
    name: string;
    email: string;
    phone: string;
    password: string;
    gender: string;
    dob: string;
    profile_photo: string;
    address: {
      city: string;
      state: string;
      pincode: string;
      full_address: string;
    };
  };
  professional_details: {
    license_number: string;
    medical_council: string;
    registration_year: string;
    qualification: {
      degree: string;
      higher_degree: string;
      university: string;
      graduation_year: string;
    };
    specialization: string;
    sub_specialization: string;
    experience_years: string;
  };
  workplace_details: {
    workplace_type: string;
    hospital_or_clinic_name: string;
    department: string;
    work_address: {
      city: string;
      state: string;
      pincode: string;
      full_address: string;
    };
  };
  consultation_details: {
    consultation_fee: string;
    consultation_type: string;
    available_days: string[];
    available_time: string;
  };
  documents: {
    license_certificate: string;
    degree_certificate: string;
    government_id: string;
  };
  account_status: string;
}

export interface DoctorAuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    auth_provider: string;
    role: string;
    is_verified: boolean;
    created_at: string;
    [key: string]: unknown;
  };
}

export async function signupDoctor(payload: DoctorSignupPayload) {
  const response = await fetch(`${API_URL}/api/v1/doctor-auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = "Failed to register doctor";
    
    if (errorData.detail) {
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
      } else {
        errorMessage = JSON.stringify(errorData.detail);
      }
    } else if (errorData.message) {
      errorMessage = errorData.message;
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function verifyDoctorOtp(email: string, otp: string) {
  const response = await fetch(`${API_URL}/api/v1/doctor-auth/verify-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify({ email, otp })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || "Invalid OTP");
  }

  return response.json();
}

export async function resendDoctorOtp(email: string) {
  const response = await fetch(`${API_URL}/api/v1/doctor-auth/resend-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify({ email })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || "Failed to resend OTP");
  }

  return response.json();
}

export async function loginDoctor(email: string, password: string): Promise<DoctorAuthResponse> {
  const response = await fetch(`${API_URL}/api/v1/doctor-auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "accept": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || "Invalid credentials");
  }

  return response.json();
}
