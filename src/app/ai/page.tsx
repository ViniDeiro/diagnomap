'use client';

import { useEffect, useState } from 'react';
import { predict, health } from '../../services/aiService';
import type { PredictResponse, PredictionSuggestion, HealthResponse } from '../../types/ai';

export default function AiTestPage() {
  const [symptomsText, setSymptomsText] = useState('febre alta, dor atras dos olhos, nauseas');
  const [topK, setTopK] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [healthInfo, setHealthInfo] = useState<HealthResponse | null>(null);

  useEffect(() => {
    health().then(setHealthInfo).catch(() => void 0);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const sintomas = symptomsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    try {
      const data = await predict(sintomas, topK);
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900">Teste AI (Dengue)</h1>
        <p className="mt-2 text-sm text-gray-600">Consulte o modelo com sintomas e veja as sugestões e fluxogramas.</p>

        {healthInfo && (
          <div className="mt-4 text-sm text-gray-700">
            <span className="inline-block rounded bg-gray-100 px-2 py-1">Flows carregados: {healthInfo.flows_count}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sintomas (separados por vírgula)</label>
            <textarea
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              rows={3}
              value={symptomsText}
              onChange={e => setSymptomsText(e.target.value)}
              placeholder="ex.: dor abdominal intensa, vomitos persistentes, hipotensao postural"
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Top K</label>
            <input
              type="number"
              min={1}
              max={8}
              value={topK}
              onChange={e => setTopK(Number(e.target.value))}
              className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
            />
            <div className="text-xs text-gray-500">Sugestões retornadas</div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
            <button
              type="button"
              className="rounded bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              onClick={() => setSymptomsText('eliminacao de criadouros, uso de repelente')}
            >
              Exemplo: Prevenção
            </button>
            <button
              type="button"
              className="rounded bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              onClick={() => setSymptomsText('dor abdominal intensa, vomitos persistentes, hipotensao postural')}
            >
              Exemplo: Sinais de Alarme
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {result && (
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Resultado</h2>
            <p className="mt-1 text-sm text-gray-700">{result.mensagem}</p>

            <div className="mt-4 divide-y divide-gray-200 rounded border border-gray-200">
              {result.sugestoes.map((s: PredictionSuggestion, idx: number) => (
                <div key={idx} className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-900">{s.doenca}</div>
                    <div className="text-xs text-gray-500">similaridade: {(s.similaridade * 100).toFixed(1)}%</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-700">
                    Gravidade: {s.gravidade ?? 'n/d'}
                  </div>
                  {s.recomendacao && (
                    <div className="mt-1 text-sm text-gray-700">Recomendação: {s.recomendacao}</div>
                  )}
                  {s.fluxograma_url && (
                    <div className="mt-1 text-sm">
                      <a
                        href={s.fluxograma_url}
                        className="text-blue-600 hover:underline"
                        title="Abrir fluxograma"
                      >
                        {s.fluxograma_id ?? s.fluxograma_url}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}