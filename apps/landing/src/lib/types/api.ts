export interface AuthResponse {
  user: { id: string; email: string };
  session: { access_token: string; expires_at: number };
}

export interface AuthErrorResponse {
  error: string;
  code: string;
}

export interface CreditBalanceResponse {
  balance: number;
}

export interface TransactionResponse {
  transactions: CreditTransaction[];
  total: number;
}

export interface ExtractionRequest {
  jsonBlueprint: JsonBlueprint;
  sourceUrl: string;
  targetFramework: string;
}

export interface ExtractionResponse {
  id: string;
  generatedCode: string;
  jsonBlueprint: JsonBlueprint;
}

export interface WaitlistRequest {
  email: string;
}

export interface ApiError {
  error: string;
  code: 'insufficient_credits' | 'rate_limited' | 'unauthorized' | 'validation_error' | 'llm_error';
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: 'granted' | 'spent' | 'purchased';
  amount: number;
  description: string;
  created_at: string;
}

export interface JsonBlueprint {
  elementTag: string;
  attributes: Record<string, string>;
  styles: Record<string, string>;
  textContent: string;
  children: JsonBlueprint[];
  arisaAriaRoles: string[];
  computedLayout: {
    width: number;
    height: number;
    position: { x: number; y: number };
  };
}
