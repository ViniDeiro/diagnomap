'use client'

import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'

type ScoreOption = { value: number; label: string }

const ScoreGroup = ({ title, options, value, onChange }: { title: string; options: ScoreOption[]; value?: number; onChange: (value: number) => void }) => (
  <fieldset className="rounded-2xl border border-slate-200 bg-white p-4">
    <legend className="px-1 text-sm font-black text-slate-900">{title}</legend>
    <div className="mt-2 grid gap-2">
      {options.map(option => <button key={option.value} type="button" onClick={() => onChange(option.value)} className={clsx('flex items-start gap-2 rounded-xl border px-3 py-2 text-left text-sm transition', value === option.value ? 'border-indigo-500 bg-indigo-50 text-indigo-950 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-indigo-300')}><CheckCircle2 className={clsx('mt-0.5 h-4 w-4 shrink-0', value === option.value ? 'text-indigo-600' : 'text-slate-300')} /><span><strong>{option.value}</strong> — {option.label}</span></button>)}
    </div>
  </fieldset>
)

export type GlasgowValues = { eyes?: number; verbal?: number; motor?: number }
export const GlasgowCalculator = ({ value, onChange }: { value: GlasgowValues; onChange: (value: GlasgowValues, total: number | undefined) => void }) => {
  const update = (key: keyof GlasgowValues, score: number) => {
    const next = { ...value, [key]: score }
    const total = next.eyes != null && next.verbal != null && next.motor != null ? next.eyes + next.verbal + next.motor : undefined
    onChange(next, total)
  }
  const total = value.eyes != null && value.verbal != null && value.motor != null ? value.eyes + value.verbal + value.motor : undefined
  return <section className="rounded-[1.5rem] border border-blue-200 bg-blue-50/60 p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-black text-blue-950">Escala de Coma de Glasgow</h3><p className="text-sm text-blue-800">Marque a melhor resposta observada em cada domínio.</p></div><span className="rounded-xl bg-blue-700 px-4 py-2 text-xl font-black text-white">{total ?? '—'}/15</span></div><div className="grid gap-3 lg:grid-cols-3"><ScoreGroup title="Abertura ocular" value={value.eyes} onChange={score => update('eyes', score)} options={[{value:4,label:'espontânea'},{value:3,label:'ao chamado'},{value:2,label:'à pressão/dor'},{value:1,label:'ausente'}]} /><ScoreGroup title="Resposta verbal" value={value.verbal} onChange={score => update('verbal', score)} options={[{value:5,label:'orientada'},{value:4,label:'confusa'},{value:3,label:'palavras inadequadas'},{value:2,label:'sons incompreensíveis'},{value:1,label:'ausente'}]} /><ScoreGroup title="Resposta motora" value={value.motor} onChange={score => update('motor', score)} options={[{value:6,label:'obedece comandos'},{value:5,label:'localiza estímulo'},{value:4,label:'retirada normal'},{value:3,label:'flexão anormal'},{value:2,label:'extensão'},{value:1,label:'ausente'}]} /></div></section>
}

export type NIHSSValues = Record<string, number | undefined>
const NIHSS_ITEMS: Array<{ key: string; title: string; options: ScoreOption[] }> = [
  {key:'1a',title:'1A. Nível de consciência',options:[{value:0,label:'alerta'},{value:1,label:'sonolento, desperta com estímulo leve'},{value:2,label:'requer estímulo repetido ou doloroso'},{value:3,label:'responde apenas por reflexos ou não responde'}]},
  {key:'1b',title:'1B. Perguntas de orientação',options:[{value:0,label:'responde ambas'},{value:1,label:'responde uma'},{value:2,label:'não responde corretamente'}]},
  {key:'1c',title:'1C. Comandos',options:[{value:0,label:'executa ambos'},{value:1,label:'executa um'},{value:2,label:'não executa'}]},
  {key:'2',title:'2. Melhor olhar',options:[{value:0,label:'normal'},{value:1,label:'paralisia parcial'},{value:2,label:'desvio forçado'}]},
  {key:'3',title:'3. Campos visuais',options:[{value:0,label:'sem perda'},{value:1,label:'hemianopsia parcial'},{value:2,label:'hemianopsia completa'},{value:3,label:'cegueira bilateral'}]},
  {key:'4',title:'4. Paralisia facial',options:[{value:0,label:'normal'},{value:1,label:'paresia leve'},{value:2,label:'paresia parcial'},{value:3,label:'paralisia completa'}]},
  {key:'5a',title:'5A. Braço esquerdo',options:[0,1,2,3,4].map(value=>({value,label:['sem queda','queda antes de 10 s','não sustenta 10 s','sem esforço contra gravidade','sem movimento'][value]}))},
  {key:'5b',title:'5B. Braço direito',options:[0,1,2,3,4].map(value=>({value,label:['sem queda','queda antes de 10 s','não sustenta 10 s','sem esforço contra gravidade','sem movimento'][value]}))},
  {key:'6a',title:'6A. Perna esquerda',options:[0,1,2,3,4].map(value=>({value,label:['sem queda','queda antes de 5 s','não sustenta 5 s','sem esforço contra gravidade','sem movimento'][value]}))},
  {key:'6b',title:'6B. Perna direita',options:[0,1,2,3,4].map(value=>({value,label:['sem queda','queda antes de 5 s','não sustenta 5 s','sem esforço contra gravidade','sem movimento'][value]}))},
  {key:'7',title:'7. Ataxia de membros',options:[{value:0,label:'ausente'},{value:1,label:'presente em um membro'},{value:2,label:'presente em dois membros'}]},
  {key:'8',title:'8. Sensibilidade',options:[{value:0,label:'normal'},{value:1,label:'perda leve a moderada'},{value:2,label:'perda grave ou total'}]},
  {key:'9',title:'9. Linguagem',options:[{value:0,label:'normal'},{value:1,label:'afasia leve a moderada'},{value:2,label:'afasia grave'},{value:3,label:'mudo ou afasia global'}]},
  {key:'10',title:'10. Disartria',options:[{value:0,label:'normal'},{value:1,label:'leve a moderada'},{value:2,label:'grave ou fala ininteligível'}]},
  {key:'11',title:'11. Extinção/desatenção',options:[{value:0,label:'ausente'},{value:1,label:'desatenção em uma modalidade'},{value:2,label:'desatenção profunda ou em mais de uma modalidade'}]}
]

export const NIHSSCalculator = ({ value, onChange }: { value: NIHSSValues; onChange: (value: NIHSSValues, total: number | undefined) => void }) => {
  const complete = NIHSS_ITEMS.every(item => value[item.key] != null)
  const total = complete ? NIHSS_ITEMS.reduce((sum,item)=>sum + (value[item.key] || 0),0) : undefined
  const update = (key: string, score: number) => { const next={...value,[key]:score}; const nextTotal=NIHSS_ITEMS.every(item=>next[item.key]!=null) ? NIHSS_ITEMS.reduce((sum,item)=>sum+(next[item.key]||0),0) : undefined; onChange(next,nextTotal) }
  return <section className="rounded-[1.5rem] border border-violet-200 bg-violet-50/60 p-5"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-lg font-black text-violet-950">NIHSS guiado</h3><p className="text-sm text-violet-800">Preencha todos os itens; o total será calculado automaticamente.</p></div><span className="rounded-xl bg-violet-700 px-4 py-2 text-xl font-black text-white">{total ?? '—'}/42</span></div><div className="grid gap-3 md:grid-cols-2">{NIHSS_ITEMS.map(item=><ScoreGroup key={item.key} title={item.title} options={item.options} value={value[item.key]} onChange={score=>update(item.key,score)} />)}</div></section>
}

const RANKIN = ['Sem sintomas','Sem incapacidade significativa apesar de sintomas','Incapacidade leve; independente','Incapacidade moderada; requer alguma ajuda','Incapacidade moderadamente grave; dependente para atividades básicas','Incapacidade grave; acamado e requer cuidados contínuos']
export const ModifiedRankinSelector = ({ value, onChange }: { value?: number; onChange: (value: number) => void }) => <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/60 p-5"><h3 className="text-lg font-black text-emerald-950">Rankin modificada prévia</h3><p className="mb-4 text-sm text-emerald-800">Selecione a condição funcional anterior ao evento atual.</p><div className="grid gap-2 md:grid-cols-2">{RANKIN.map((label,index)=><button key={index} type="button" onClick={()=>onChange(index)} className={clsx('rounded-xl border p-3 text-left text-sm',value===index?'border-emerald-600 bg-emerald-100 ring-2 ring-emerald-100':'border-slate-200 bg-white hover:border-emerald-300')}><strong>{index}</strong> — {label}</button>)}</div></section>
