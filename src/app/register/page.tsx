'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function RegisterPage() {
  const router = useRouter()
  const [storeName, setStoreName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!storeName.trim() || !email.trim() || !password.trim()) {
      alert('Semua field wajib diisi!')
      return
    }

    setLoading(true)

    // 1. Daftarkan user ke auth Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error('Gagal daftar:', authError)
      alert('Gagal mendaftar: ' + authError?.message)
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // 2. Buat toko di tabel "stores"
    const { data: storeData, error: storeError } = await supabase
      .from('stores')
      .insert({
        name: storeName,
        owner_id: userId,
      })
      .select()
      .single()

    if (storeError || !storeData) {
      console.error('Gagal membuat toko:', storeError)
      alert('Gagal membuat toko: ' + storeError?.message)
      setLoading(false)
      return
    }

    // 3. Tambahkan ke tabel "users" dengan role 'admin'
    const { error: userRoleError } = await supabase.from('users').insert({
      id: userId,
      role: 'admin',
      store_id: storeData.id,
    })

    if (userRoleError) {
      console.error('Gagal menyimpan role:', userRoleError)
      alert('Gagal menyimpan data pengguna: ' + userRoleError.message)
      setLoading(false)
      return
    }

    alert('Pendaftaran berhasil! Silakan login.')
    router.push('/login')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Daftar Toko Baru</h1>

        <div>
          <label className="block text-sm font-medium">Nama Toko</label>
          <input
            type="text"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Mendaftar...' : 'Daftar'}
        </button>
      </form>
    </div>
  )
}
