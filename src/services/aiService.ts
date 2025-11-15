import type { PredictResponse, HealthResponse, ChatMessage, ChatResponse, LlmStatus } from "../types/ai";

const AI_BASE_URL = process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8001";

export async function health(): Promise<HealthResponse> {
  const res = await fetch(`${AI_BASE_URL}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function predict(sintomas: string[], top_k = 3): Promise<PredictResponse> {
  const res = await fetch(`${AI_BASE_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sintomas, top_k }),
  });
  if (!res.ok) throw new Error(`Predict failed: ${res.status}`);
  return res.json();
}

export async function chat(messages: ChatMessage[]): Promise<ChatResponse> {
  const res = await fetch(`${AI_BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  return res.json();
}

export async function llmStatus(): Promise<LlmStatus> {
  const res = await fetch(`${AI_BASE_URL}/llm-status`, { cache: "no-store" });
  if (!res.ok) throw new Error(`LLM status failed: ${res.status}`);
  return res.json();
}

export async function chatLLM(messages: ChatMessage[]): Promise<ChatResponse> {
  const res = await fetch(`${AI_BASE_URL}/chat-llm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok) throw new Error(`Chat LLM failed: ${res.status}`);
  return res.json();
}