'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoCombustibleForm() {
  const [monto, setMonto] = useState<number | ''>('')
  const [litros, setLitros] = useState<number | ''>('')
  const [vehiculo, setVehiculo] = useState('')
  const [fecha, setFecha] = useState(hoy())
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await conCargando(() =>
      supabase.from('combustible').insert({
        monto: monto === '' ? 0 : monto,
        litros: litros === '' ? null : litros,
        vehiculo: vehiculo || null,
        fecha,
      })
    )

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setMonto('')
    setLitros('')
    setVehiculo('')
    setFecha(hoy())
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field">
        <label>Monto</label>
        <NumeroInput value={monto} onChange={setMonto} required />
      </div>

      <div className="field">
        <label>Litros</label>
        <NumeroInput value={litros} onChange={setLitros} decimales={2} placeholder="Opcional" />
      </div>

      <div className="field">
        <label>Vehículo</label>
        <input value={vehiculo} onChange={(e) => setVehiculo(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? 'Registrando…' : 'Registrar'}
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
