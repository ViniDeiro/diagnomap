export type PredictionSuggestion = {
  doenca: string;
  similaridade: number;
  gravidade?: string | null;
  fluxograma_id?: string | null;
  fluxograma_url?: string | null;
  recomendacao?: string | null;
};

export type PredictResponse = {
  mensagem: string;
  sugestoes: PredictionSuggestion[];
};

export type HealthResponse = {
  status: string;
  flows_count: number;
};

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  reply: string;
  sugestoes?: PredictionSuggestion[];
};

export type LlmStatus = {
  available: boolean;
  provider?: string;
  model?: string;
};