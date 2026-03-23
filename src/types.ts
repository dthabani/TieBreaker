export type AnalysisType = 'pros_cons' | 'comparison' | 'swot';

// Pros/Cons: per-option cards, each with their own pros and cons lists
export interface ProsConsResult {
  options: {
    name: string;
    pros: string[];
    cons: string[];
  }[];
}

// Comparison Table: criteria rows vs options columns
export interface ComparisonResult {
  options: string[];   // Column headers (e.g. ["Option A", "Option B"])
  criteria: {
    name: string;      // Row header (e.g. "Cost", "Speed", "Security")
    values: string[];  // One value per option, in the same order
  }[];
}

export interface SwotResult {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

export type AnalysisResult =
  | { type: 'pros_cons'; data: ProsConsResult }
  | { type: 'comparison'; data: ComparisonResult }
  | { type: 'swot'; data: SwotResult };

export interface SavedDecision {
  id: string;
  timestamp: number;
  decisionText: string;
  result: AnalysisResult;
  schemaVersion?: number; // Absent or 1 = legacy, 2 = current
}

export interface UserProfile {
  sub: string;     // Unique Google User ID
  name: string;
  email: string;
  picture: string;
}

export interface ApiKey {
  id: string;
  label: string;
  key: string;
}
