const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Quick local getter since getAuthToken isn't exported from auth.ts
function getAuthToken(): string | null {
    if (typeof window !== "undefined") {
        return localStorage.getItem("medilens_token");
    }
    return null;
}

export interface MatchedDoctor {
    _id: string;
    name: string;
    basic_details?: {
        profile_photo?: string | null;
    };
    professional_details?: {
        specialization: string;
        experience_years: string;
    };
    consultation_details?: {
        consultation_fee: string;
        consultation_type: string;
        available_days: string[];
        available_time: string;
    };
    workplace_details?: {
        hospital_or_clinic_name: string;
        work_address?: {
            city: string;
        };
    };
}

export interface AppointmentResponse {
    _id: string;
    user_email: string;
    doctor_id: string;
    assessment_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    patient_details?: Record<string, any>;
    assessment_report?: Record<string, any>;
}

export async function matchDoctors(specialties: string[]): Promise<MatchedDoctor[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/matching/doctors`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ specialties }),
        });

        if (!response.ok) {
            throw new Error(`Failed to match doctors: ${response.status}`);
        }

        return await response.json();
    } catch (err) {
        console.error("Match doctors error:", err);
        return [];
    }
}

export async function bookConsultation(doctorId: string, assessmentId: string): Promise<AppointmentResponse> {
    const token = getAuthToken();
    if (!token) {
        throw new Error("You must be logged in to book a consultation.");
    }

    // Standardize token with Bearer prefix
    const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/api/v1/appointments/book`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
        },
        body: JSON.stringify({
            doctor_id: doctorId,
            assessment_id: assessmentId,
        }),
    });

    if (response.status === 401) {
        console.error("bookConsultation: Session expired. Clearing token.");
        localStorage.removeItem("medilens_token");
        localStorage.removeItem("medilens_user");
        if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth_expired"));
        }
        throw new Error("Your login session has expired. Please log in again to book a consultation.");
    }

    if (!response.ok) {
        // Surface the real backend error detail (FastAPI returns { detail: "..." })
        let errorMessage = `Booking failed (${response.status})`;
        try {
            const errBody = await response.json();
            if (typeof errBody.detail === "string") {
                errorMessage = errBody.detail;
            } else if (Array.isArray(errBody.detail)) {
                errorMessage = errBody.detail.map((e: { msg: string }) => e.msg).join(", ");
            }
        } catch (_) { /* ignore json parse errors */ }
        throw new Error(errorMessage);
    }

    return await response.json();
}
