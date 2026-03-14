const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface DoctorSignupPayload {
  basic_details: {
    name: string;
    email: string;
    phone: string;
    password: string;
    gender: string;
    dob: string;
    profile_photo?: string;
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
      higher_degree?: string;
      university: string;
      graduation_year: string;
    };
    specialization: string;
    sub_specialization?: string;
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
    license_certificate?: string;
    degree_certificate?: string;
    government_id?: string;
  };
}

export interface DoctorAuthResponse {
  access_token: string;
  token_type: string;
  doctor: {
    name: string;
    email: string;
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
    throw new Error(errorData.detail || errorData.message || "Failed to register doctor");
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

export async function loginDoctor(email: string, password: string) {
  // We'll update this once login curl is provided. For now it's still mocked/demo structure.
  // Actually, wait, let's just make it do what it did before, or prepare it for the real endpoint.
  const response = await fetch(`${API_URL}/api/v1/doctor-auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "accept": "application/json"
    },
    body: new URLSearchParams({
      username: email,
      password: password,
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || "Invalid credentials");
  }

  return response.json();
}
