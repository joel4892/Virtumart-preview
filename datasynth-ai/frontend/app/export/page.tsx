'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

type Dataset = { id: string, name: string }

export default function ExportPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [datasetId, setDatasetId] = useState('')

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

  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Export</h2>
      <select value={datasetId} onChange={e => setDatasetId(e.target.value)}>
        {datasets.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </select>
      {datasetId && (
        <div className="space-x-4 text-sm">
          <a className="underline" href={`${base}/export/dataset/${datasetId}.json`} target="_blank">JSON</a>
          <a className="underline" href={`${base}/export/dataset/${datasetId}.csv`} target="_blank">CSV</a>
        </div>
      )}
    </div>
  )
}