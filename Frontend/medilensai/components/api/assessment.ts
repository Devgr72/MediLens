/**
 * MediLens AI — Frontend Assessment API
 * All backend assessment requests are routed through this file.
 */

const BASE_URL = process.env.NEXT_PUBLIC_RAG_API_URL || "http://172.20.10.2:8001"
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

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
  assessment_id: string;
  status: string;
  summary: string;
  potential_causes: Array<{ name: string; confidence: number } | string>;
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
  recommended_specialists?: string[];
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
        errorMessage = errorData.detail.map((e: { loc: string[]; msg: string }) => `${e.loc.join('.')}: ${e.msg}`).join(", ");
      } else if (errorData.detail) {
        errorMessage = JSON.stringify(errorData.detail);
      }

      throw new Error(errorMessage);
    }

    const result: AssessmentResponse = await response.json();
    result.assessment_id = result.assessment_id || Date.now().toString();

    // ── Persist to backend (fire-and-forget for authenticated users) ──
    const historyPayload: AIHistoryPayload = {
      summary: result.summary || "",
      potential_causes: (result.potential_causes || []).map((c) =>
        typeof c === "string" ? c : (c as { name?: string }).name || JSON.stringify(c)
      ),
      alternative_conditions: [],
      risk_level: result.risk_level || "",
      triage_level: result.triage_level || "",
      triage_advice: result.triage_advice || "",
      severity_score: result.severity_score ?? 0,
      visual_findings: result.visual_findings || "",
      suspected_condition: result.suspected_condition || "",
      reasoning: result.reasoning || "",
      first_aid: result.first_aid || [],
      watch_for: result.watch_for || [],
      specialist: result.specialist || "",
      recommended_specialists: result.recommended_specialists || [],
      ai_confidence: result.ai_confidence || "",
      sources: result.sources || [],
      note: result.note || null,
    };
    // Non-blocking — don't await
    saveHistory(historyPayload).catch((e) => console.warn("Background history save failed:", e));

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

// ── AI History Types ────────────────────────────────────────

export interface AIHistoryPayload {
  summary: string;
  potential_causes: string[];
  alternative_conditions: Record<string, string>[];
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
  recommended_specialists?: string[];
  ai_confidence: string;
  sources: string[];
  note: string | null;
}

export interface AIHistoryRecord {
  _id: string;
  user_email: string;
  result: AIHistoryPayload;
  created_at: string;
}

// ── AI History Endpoints ────────────────────────────────────

/**
 * Save an AI diagnosis to the authenticated user's history on the backend.
 * Requires the user to be logged in (JWT token in localStorage).
 */
export async function saveHistory(payload: AIHistoryPayload): Promise<AIHistoryRecord | null> {
  try {
    const token = localStorage.getItem("medilens_token");
    if (!token || token.startsWith("mock-")) {
      console.warn("saveHistory: No valid auth token — please log in to save history.");
      return null;
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/symptoms/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      console.error("saveHistory: Session expired. Clearing token.");
      localStorage.removeItem("medilens_token");
      localStorage.removeItem("medilens_user");
      // Force a UI update event if needed, or rely on normal state
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth_expired"));
      }
      return null;
    }

    if (!response.ok) {
      console.error("saveHistory: Backend returned", response.status);
      return null;
    }

    return await response.json() as AIHistoryRecord;
  } catch (error) {
    console.error("saveHistory: Error saving to backend:", error);
    return null;
  }
}

/**
 * Fetch all saved AI diagnosis history for the authenticated user.
 */
export async function getHistory(): Promise<AIHistoryRecord[]> {
  try {
    const token = localStorage.getItem("medilens_token");
    if (!token) return [];

    const response = await fetch(`${BACKEND_URL}/api/v1/symptoms/history`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("getHistory: Backend returned", response.status);
      return [];
    }

    return await response.json() as AIHistoryRecord[];
  } catch (error) {
    console.error("getHistory: Error fetching from backend:", error);
    return [];
  }
}
