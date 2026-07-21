'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoValeForm({ empleadoId }: { empleadoId: string }) {
  const [monto, setMonto] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('vales_adelanto').insert({
      empleado_id: empleadoId,
      monto: Number(monto),
      observaciones: observaciones || null,
      fecha,
    })

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setMonto('')
    setObservaciones('')
    setFecha(hoy())
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field">
        <label>Monto solicitado</label>
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
        <label>Observaciones</label>
        <input
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Opcional"
        />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <button type="submit" className="btn btn-primary">
        Generar vale
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
