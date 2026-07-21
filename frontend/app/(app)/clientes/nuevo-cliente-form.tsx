'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NuevoClienteForm() {
  const [nombre, setNombre] = useState('')
  const [ruc, setRuc] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('clientes').insert({
      nombre,
      ruc: ruc || null,
    })

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setNombre('')
    setRuc('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
      <input
        placeholder="Nombre del cliente"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        required
        style={{ padding: 8, flex: 1 }}
      />
      <input
        placeholder="RUC (opcional)"
        value={ruc}
        onChange={(e) => setRuc(e.target.value)}
        style={{ padding: 8, flex: 1 }}
      />
      <button type="submit" style={{ padding: '8px 16px' }}>
        Agregar
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}