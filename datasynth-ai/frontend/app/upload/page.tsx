'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

type Project = { id: string, name: string }

export default function UploadPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<'TEXT' | 'IMAGE'>('TEXT')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const { data } = await axios.get(`${base}/projects`, { headers: { Authorization: `Bearer ${token}` } })
      setProjects(data.projects)
      if (data.projects?.[0]) setProjectId(data.projects[0].id)
    }
    load()
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!file) return setMessage('Please choose a file')
    const token = localStorage.getItem('token')
    if (!token) return setMessage('You must login')
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const form = new FormData()
    form.set('name', name || file.name)
    form.set('type', type)
    form.set('projectId', projectId)
    form.set('file', file)
    try {
      const { data } = await axios.post(`${base}/datasets`, form, { headers: { Authorization: `Bearer ${token}` } })
      setMessage(`Uploaded: ${data.dataset.name}`)
    } catch (err: any) {
      setMessage(err?.response?.data?.error || 'Upload failed')
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">Upload Dataset</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <select value={type} onChange={e => setType(e.target.value as any)}>
          <option value="TEXT">Text</option>
          <option value="IMAGE">Image</option>
        </select>
        <select value={projectId} onChange={e => setProjectId(e.target.value)}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button type="submit" className="bg-brand-600">Upload</button>
      </form>
      {message && <div className="text-sm text-neutral-300">{message}</div>}
    </div>
  )
}