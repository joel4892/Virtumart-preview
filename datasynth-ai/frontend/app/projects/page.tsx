'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

type Project = { id: string, name: string }

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    const { data } = await axios.get(`${base}/projects`, { headers: { Authorization: `Bearer ${token}` } })
    setProjects(data.projects)
  }

  useEffect(() => { load() }, [])

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return
    await axios.post(`${base}/projects`, { name }, { headers: { Authorization: `Bearer ${token}` } })
    setName('')
    await load()
  }

  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-lg font-semibold">Projects</h2>
      <form onSubmit={createProject} className="flex gap-2">
        <input placeholder="New project name" value={name} onChange={e => setName(e.target.value)} />
        <button className="bg-brand-600" type="submit">Create</button>
      </form>
      <div className="space-y-2">
        {projects.map(p => (
          <div key={p.id} className="border border-neutral-800 rounded p-2 text-sm">{p.name}</div>
        ))}
      </div>
    </div>
  )
}