export type AnalysisType = 'pros_cons' | 'comparison' | 'swot';

export interface ProsConsResult {
  pros: string[];
  cons: string[];
}

export interface ComparisonResult {
  options: {
    name: string;
    description: string;
    pros: string[];
    cons: string[];
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
