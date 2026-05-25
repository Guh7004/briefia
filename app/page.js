'use client'
import { useState, useRef } from 'react'

const PLANS = {
  free: { name: 'Grátis', limit: 3, color: 'gray' },
  starter: { name: 'Starter', limit: 30, color: 'blue' },
  pro: { name: 'Pro', limit: 100, color: 'purple' },
}

export default function Home() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState({ used: 0, plan: 'free' })
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef()

  const plan = PLANS[usage.plan] || PLANS.free

  const handleFile = (f) => {
    if (!f) return
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowed.includes(f.type) && !f.name.endsWith('.txt') && !f.name.endsWith('.pdf') && !f.name.endsWith('.docx')) {
      setError('Formato não suportado. Use PDF, DOCX ou TXT.')
      return
    }
    setFile(f)
    setError(null)
    setResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/analyze', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao analisar')
      setResult(data)
      setUsage(u => ({ ...u, used: u.used + 1 }))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">BriefIA</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${usage.plan === 'pro' ? 'bg-purple-100 text-purple-700' : usage.plan === 'starter' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {plan.name}
            </span>
            <span className="text-sm text-gray-500">{usage.used}/{plan.limit} análises</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Analise documentos em segundos</h1>
          <p className="text-lg text-gray-500">Faça upload de um relatório, proposta ou contrato e receba um resumo executivo com os pontos críticos.</p>
        </div>

        {/* Upload */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={e => handleFile(e.target.files[0])} />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null) }} className="ml-4 text-gray-400 hover:text-red-500">✕</button>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium">Arraste ou clique para fazer upload</p>
                <p className="text-sm text-gray-400 mt-1">PDF, DOCX ou TXT — até 10MB</p>
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{error}</div>
          )}

          <button
            onClick={analyze}
            disabled={!file || loading || usage.used >= plan.limit}
            className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Analisando...
              </span>
            ) : usage.used >= plan.limit ? 'Limite atingido — Faça upgrade' : 'Analisar documento'}
          </button>

          {usage.used >= plan.limit && (
            <p className="text-center text-sm text-gray-400 mt-3">Você atingiu o limite do plano {plan.name}. Faça upgrade para continuar.</p>
          )}
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900">Análise concluída</h2>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Resumo Executivo</h3>
              <p className="text-gray-800 leading-relaxed">{result.summary}</p>
            </div>

            {result.keyPoints?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pontos Críticos</h3>
                <ul className="space-y-2">
                  {result.keyPoints.map((p, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="mt-1 w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-gray-700">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.questions?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Perguntas que vocà deveria fazer</h3>
                <ul className="space-y-2">
                  {result.questions.map((q, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <span className="text-blue-500 mt-0.5">→</span>
                      <span className="text-gray-700">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.risk && (
              <div className={`p-4 rounded-xl border ${result.risk === 'Alto' ? 'bg-red-50 border-red-100' : result.risk === 'Médio' ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
                <span className="text-sm font-semibold text-gray-600">Nível de risco: </span>
                <span className={`font-bold ${result.risk === 'Alto' ? 'text-red-600' : result.risk === 'Médio' ? 'text-amber-600' : 'text-green-600'}`}>{result.risk}</span>
              </div>
            )}
          </div>
        )}

        {/* Pricing */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Planos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Grátis', price: 'R$0', analyses: '3 análises/mês', features: ['PDF, DOCX, TXT', 'Resumo executivo', 'Pontos críticos'], highlight: false },
              { name: 'Starter', price: 'R$49', analyses: '30 análises/mês', features: ['Tudo do Grátis', 'Perguntas sugeridas', 'Nível de risco', 'Suporte por email'], highlight: true },
              { name: 'Pro', price: 'R$97', analyses: '100 análises/mês', features: ['Tudo do Starter', 'Documentos até 20MB', 'Exportar PDF', 'Suporte prioritário'], highlight: false },
            ].map(p => (
              <div key={p.name} className={`rounded-2xl p-6 ${p.highlight ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-gray-900 shadow-sm'}`}>
                <h3 className={`font-bold text-lg ${p.highlight ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                <div className="mt-2 mb-1">
                  <span className="text-3xl font-bold">{p.price}</span>
                  <span className={`text-sm ${p.highlight ? 'text-blue-200' : 'text-gray-400'}`}>/mês</span>
                </div>
                <p className={`text-sm mb-4 ${p.highlight ? 'text-blue-100' : 'text-gray-500'}`}>{p.analyses}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map(f => (
                    <li key={f} className={`text-sm flex gap-2 items-center ${p.highlight ? 'text-blue-100' : 'text-gray-600'}`}>
                      <span className={p.highlight ? 'text-blue-200' : 'text-green-500'}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-xl font-semibold text-sm transition-colors ${p.highlight ? 'bg-white text-blue-600 hover:bg-blue-50' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {p.name === 'Grátis' ? 'Plano atual' : 'Assinar agora'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-gray-400 mt-12">
        BriefIA © 2025 — Análise inteligente de documentos financeiros
      </footer>
    </div>
  )
}
