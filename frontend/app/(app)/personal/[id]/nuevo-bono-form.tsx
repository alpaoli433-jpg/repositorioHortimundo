'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoBonoForm({ empleadoId }: { empleadoId: string }) {
  const [monto, setMonto] = useState('')
  const [motivo, setMotivo] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('bonos').insert({
      empleado_id: empleadoId,
      monto: Number(monto),
      motivo: motivo || null,
      fecha,
    })

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setMonto('')
    setMotivo('')
    setFecha(hoy())
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field">
        <label>Monto</label>
        <input
          type="number"
          step="1"
          min="1"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
      </div>

      <div className="field" style={{ flex: 1 }}>
        <label>Motivo</label>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <button type="submit" className="btn btn-primary">
        Registrar bono
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
