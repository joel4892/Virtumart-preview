'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

type ApiKey = { id: string, key: string, label: string, revoked: boolean, createdAt: string }

export default function ApiKeysPage() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [label, setLabel] = useState('')

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    const { data } = await axios.get(`${base}/admin/apikeys`, { headers: { Authorization: `Bearer ${token}` } })
    setKeys(data.keys)
  }

  useEffect(() => { load() }, [])

  const createKey = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return
    await axios.post(`${base}/admin/apikeys`, { label }, { headers: { Authorization: `Bearer ${token}` } })
    setLabel('')
    await load()
  }

  const revoke = async (id: string) => {
    const token = localStorage.getItem('token')
    if (!token) return
    await axios.post(`${base}/admin/apikeys/${id}/revoke`, {}, { headers: { Authorization: `Bearer ${token}` } })
    await load()
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-lg font-semibold">API Keys</h2>
      <form onSubmit={createKey} className="flex gap-2">
        <input placeholder="Label" value={label} onChange={e => setLabel(e.target.value)} />
        <button className="bg-brand-600" type="submit">Create</button>
      </form>
      <div className="space-y-2">
        {keys.map(k => (
          <div key={k.id} className="border border-neutral-800 rounded p-2 text-sm flex items-center justify-between">
            <div>
              <div>{k.label} {k.revoked && <span className="text-red-400">(revoked)</span>}</div>
              <div className="text-neutral-500">{k.key}</div>
            </div>
            {!k.revoked && <button className="bg-neutral-800" onClick={() => revoke(k.id)}>Revoke</button>}
          </div>
        ))}
      </div>
    </div>
  )
}