"use client";
import { useEffect, useRef, useState } from "react";
import { chat, chatLLM, llmStatus, health } from "@/services/aiService";
import type { ChatMessage, PredictionSuggestion } from "@/types/ai";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente da Siga o Fluxo. Descreva seus sintomas (ex.: febre, dor atrás dos olhos) e eu te ajudo com orientações.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PredictionSuggestion[]>([]);
  const [status, setStatus] = useState<string>("");
  const [useLLM, setUseLLM] = useState(false);
  const [llmAvailable, setLlmAvailable] = useState<boolean>(false);
  const [llmProvider, setLlmProvider] = useState<string | undefined>(undefined);
  const [llmModel, setLlmModel] = useState<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    health().then((h) => setStatus(`Modelo ativo (${h.flows_count} fluxos)`)).catch(() => setStatus("Modelo indisponível"));
    llmStatus()
      .then((s) => {
        setLlmAvailable(s.available);
        setLlmProvider(s.provider);
        setLlmModel(s.model);
      })
      .catch(() => {
        setLlmAvailable(false);
        setLlmProvider(undefined);
        setLlmModel(undefined);
      });
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = useLLM && llmAvailable ? await chatLLM(next) : await chat(next);
      setMessages([...next, { role: "assistant", content: res.reply }]);
      setSuggestions(res.sugestoes || []);
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: `Desculpe, houve um erro: ${e?.message || e}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quick = (text: string) => {
    setInput(text);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chat AI – Siga o Fluxo</h1>
        <span className="text-sm text-gray-500">{status}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)} />
          Usar LLM (beta)
        </label>
        <span className={`text-xs ${llmAvailable ? "text-green-700" : "text-gray-500"}`}>
          {llmAvailable
            ? `LLM disponível (${llmProvider === 'ollama' ? 'Ollama' : llmProvider === 'openai' ? 'OpenAI' : 'desconhecido'}${llmModel ? ' – ' + llmModel : ''})`
            : "LLM indisponível"}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => quick("febre alta, dor atrás dos olhos, manchas vermelhas")}>Dengue clássico</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => quick("dor abdominal intensa, vômitos persistentes, sangramento")}>Sinais de alarme</button>
        <button className="px-3 py-1 rounded bg-gray-100" onClick={() => quick("prevenção, repelente, evitar água parada")}>Prevenção</button>
      </div>
      <div className="border rounded p-4 h-[50vh] overflow-y-auto bg-white">
        {messages.map((m, i) => (
          <div key={i} className={`mb-3 ${m.role === "user" ? "text-right" : "text-left"}`}>
            <div className={`inline-block px-3 py-2 rounded-lg ${m.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>{m.content}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Digite sua mensagem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          onClick={send}
          disabled={loading}
        >{loading ? "Enviando..." : "Enviar"}</button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Sugestões</h2>
          {suggestions.map((s, idx) => (
            <div key={idx} className="border rounded p-3">
              <div className="font-medium">{s.doenca}</div>
              <div className="text-sm text-gray-600">Similaridade: {s.similaridade} • Gravidade: {s.gravidade || "n/d"}</div>
              {s.recomendacao && <div className="mt-1 text-sm">{s.recomendacao}</div>}
              {s.fluxograma_url && (
                <a href={s.fluxograma_url} className="text-blue-600 text-sm" target="_blank" rel="noreferrer">Abrir fluxograma</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}