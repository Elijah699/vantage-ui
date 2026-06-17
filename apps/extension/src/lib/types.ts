export interface ApiError {
  error: string
  code:
  | 'insufficient_credits'
  | 'rate_limited'
  | 'unauthorized'
  | 'validation_error'
  | 'llm_error'
}

export interface AuthResponse {
  user: { id: string; email: string }
  session: { access_token: string; expires_at: number }
}

export interface MeResponse {
  user: { id: string; email: string; created_at: string }
  credits: { balance: number }
}
