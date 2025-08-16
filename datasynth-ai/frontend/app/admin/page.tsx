'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'

type User = { id: string, email: string, role: 'ADMIN' | 'ANNOTATOR' | 'VIEWER', organizationId: string }

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [message, setMessage] = useState('')

  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    const { data } = await axios.get(`${base}/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
    setUsers(data.users)
  }

  useEffect(() => { load() }, [])

  const updateRole = async (id: string, role: User['role']) => {
    const token = localStorage.getItem('token')
    if (!token) return
    await axios.patch(`${base}/admin/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } })
    setMessage('Role updated')
    await load()
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
      <div className="border border-neutral-800 rounded">
        <table className="w-full text-sm">
          <thead className="bg-neutral-900 text-left">
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-neutral-800">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">
                  <select value={u.role} onChange={e => updateRole(u.id, e.target.value as any)}>
                    <option value="ADMIN">ADMIN</option>
                    <option value="ANNOTATOR">ANNOTATOR</option>
                    <option value="VIEWER">VIEWER</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && <div className="text-sm text-neutral-300">{message}</div>}
    </div>
  )
}