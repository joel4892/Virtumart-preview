'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const { data } = await axios.post(`${base}/auth/signup`, { email, password })
      localStorage.setItem('token', data.token)
      router.push('/upload')
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Signup failed')
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-4">Sign Up</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" required />
        <input placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button type="submit" className="bg-brand-600 hover:opacity-90">Create account</button>
      </form>
    </div>
  )
}