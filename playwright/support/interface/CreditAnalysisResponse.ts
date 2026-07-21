export interface CreditAnalysisResponse {
  status?: string;
  score?: number;
  error?: string;
}

export interface MockCreditAnalysisOptions {
  body: CreditAnalysisResponse | Record<string, unknown>;
  statusCode?: number;
}
