'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

type Dataset = { id: string, name: string, type: 'TEXT' | 'IMAGE' }

type Suggestion = { type: string, label: string, confidence: number, payload: any }

export default function AnnotatePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [datasetId, setDatasetId] = useState('')
  const [text, setText] = useState('John Doe met Jane at john@example.com, call +1 (415) 555-2671.')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const { data } = await axios.get(`${base}/datasets`, { headers: { Authorization: `Bearer ${token}` } })
      setDatasets(data.datasets)
      if (data.datasets?.[0]) setDatasetId(data.datasets[0].id)
    }
    load()
  }, [])

  const runAssist = async () => {
    const token = localStorage.getItem('token')
    if (!token) return setMessage('Login required')
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const { data } = await axios.post(`${base}/annotations/assist`, { kind: 'TEXT', content: text }, { headers: { Authorization: `Bearer ${token}` } })
    setSuggestions(data.suggestions)
  }

  const saveAnnotation = async (s: Suggestion) => {
    const token = localStorage.getItem('token')
    if (!token) return setMessage('Login required')
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    await axios.post(`${base}/annotations`, { datasetId, type: s.type, label: s.label, payload: s.payload }, { headers: { Authorization: `Bearer ${token}` } })
    setMessage('Annotation saved')
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-lg font-semibold">Annotate</h2>
      <select value={datasetId} onChange={e => setDatasetId(e.target.value)}>
        {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <textarea value={text} onChange={e => setText(e.target.value)} rows={6} />
      <div className="flex gap-2">
        <button className="bg-brand-600" onClick={runAssist}>AI suggestions</button>
      </div>
      {suggestions.length > 0 && (
        <div className="border border-neutral-800 rounded p-4">
          <h3 className="font-medium mb-2">Suggestions</h3>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>{s.type} → {s.label} <span className="text-neutral-500">({Math.round(s.confidence*100)}%)</span></div>
                <button className="bg-neutral-800" onClick={() => saveAnnotation(s)}>Save</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {message && <div className="text-sm text-neutral-300">{message}</div>}
    </div>
  )
}