'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

type Dataset = { id: string, name: string, status: string }

type Report = { id: string, summary: string, certificatePath?: string | null }

export default function CompliancePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [datasetId, setDatasetId] = useState('')
  const [text, setText] = useState('Sample text with john.doe@example.com and +1 555 123 4567')
  const [reports, setReports] = useState<Report[]>([])
  const [masked, setMasked] = useState('')

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const { data } = await axios.get(`${base}/datasets`, { headers: { Authorization: `Bearer ${token}` } })
      setDatasets(data.datasets)
      if (data.datasets?.[0]) {
        const id = data.datasets[0].id
        setDatasetId(id)
        const reportsRes = await axios.get(`${base}/compliance/dataset/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        setReports(reportsRes.data.reports)
      }
    }
    load()
  }, [])

  const runCompliance = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const { data } = await axios.post(`${base}/compliance/run`, { datasetId, content: text }, { headers: { Authorization: `Bearer ${token}` } })
    setMasked(data.masked)
    const reportsRes = await axios.get(`${base}/compliance/dataset/${datasetId}`, { headers: { Authorization: `Bearer ${token}` } })
    setReports(reportsRes.data.reports)
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-lg font-semibold">Compliance</h2>
      <select value={datasetId} onChange={e => setDatasetId(e.target.value)}>
        {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      <textarea rows={6} value={text} onChange={e => setText(e.target.value)} />
      <div className="flex gap-2">
        <button className="bg-brand-600" onClick={runCompliance}>Run PII detection & certificate</button>
      </div>
      {masked && (
        <div className="text-sm text-neutral-300">
          <div className="font-medium">Masked preview:</div>
          <div className="mt-1 p-3 bg-neutral-900 rounded border border-neutral-800">{masked}</div>
        </div>
      )}
      {reports.length > 0 && (
        <div className="space-y-2">
          <div className="font-medium">Reports</div>
          {reports.map(r => (
            <div key={r.id} className="flex items-center justify-between text-sm border border-neutral-800 rounded p-2">
              <div>{r.summary}</div>
              {r.certificatePath && <a className="underline" href={`/static/certificates/${datasetId}-${r.id}.pdf`} target="_blank">Download certificate</a>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}