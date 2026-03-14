/**
 * MediLens AI — Frontend Assessment API
 * All backend assessment requests are routed through this file.
 */

const BASE_URL = process.env.NEXT_PUBLIC_RAG_API_URL || "http://172.20.10.2:8001"

// ── Payload Types ──────────────────────────────────────────
export interface PersonalDetails {
  name: string
  age: number
  gender: string
}

export interface AssessmentPayload {
  name: string
  age: number
  gender: string
  symptoms: string[]
  symptoms_name: string
  pain_intensity: number
  symptom_duration: string
  additional_notes?: string
}

export interface PotentialCause {
  name: string;
  confidence: number;
}

export interface AssessmentResponse {
  assessment_id?: string;
  summary: string;
  potential_causes: PotentialCause[];
  risk_level: string;
  triage_level: string;
  triage_advice: string;
  severity_score: number;
  visual_findings: string;
  suspected_condition: string;
  reasoning: string;
  first_aid: string[];
  watch_for: string[];
  specialist: string;
  ai_confidence: string;
  sources: string[];
  note: string | null;
}

export interface ApiError {
  detail: string
}

// ── Assessment Endpoints ───────────────────────────

/**
 * Submit assessment data to the backend API.
 * Returns the AI generated assessment results.
 */
export async function generateAssessment(payload: AssessmentPayload): Promise<AssessmentResponse> {
  try {
    const response = await fetch(`${BASE_URL}/rag/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      let errorMessage = "Failed to generate assessment from server.";
      
      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        // Extract messages from FastAPI validation errors
        errorMessage = errorData.detail.map((err: any) => `${err.loc.join('.')}: ${err.msg}`).join(", ");
      } else if (errorData.detail) {
        errorMessage = JSON.stringify(errorData.detail);
      }
      
      throw new Error(errorMessage);
    }

    const result: AssessmentResponse = await response.json();
    result.assessment_id = result.assessment_id || Date.now().toString();

    // Save to history for local persistence
    const history = JSON.parse(localStorage.getItem("medilens_assessment_history") || "[]");
    
    // Avoid duplicates if the server returns an ID we already have (Edge case)
    const exists = history.some((item: AssessmentResponse) => item.assessment_id === result.assessment_id);
    if (!exists) {
      history.unshift(result);
      localStorage.setItem("medilens_assessment_history", JSON.stringify(history));
    }

    return result;
  } catch (error) {
    console.error("Assessment API Error:", error);
    throw error;
  }
}
