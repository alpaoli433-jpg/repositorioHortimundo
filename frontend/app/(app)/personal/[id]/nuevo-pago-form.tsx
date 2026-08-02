'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

function mesActual() {
  return new Date().toISOString().slice(0, 7)
}

export default function NuevoPagoForm({
  empleadoId,
  salarioSugerido,
  onCreated,
}: {
  empleadoId: string
  salarioSugerido: number
  onCreated?: (id: string) => void
}) {
  const [mes, setMes] = useState(mesActual())
  const [monto, setMonto] = useState<number | ''>(salarioSugerido ?? '')
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { data, error } = await conCargando(() =>
      supabase
        .from('salarios_pagados')
        .insert({
          empleado_id: empleadoId,
          monto: monto === '' ? 0 : monto,
          mes: `${mes}-01`,
        })
        .select()
        .single()
    )

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    if (onCreated) {
      onCreated(data.id)
      return
    }

    setMes(mesActual())
    setMonto(salarioSugerido ?? '')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
      <div className="field">
        <label>Mes</label>
        <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} required />
      </div>

      <div className="field">
        <label>Monto</label>
        <NumeroInput value={monto} onChange={setMonto} required />
      </div>

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? 'Registrando…' : 'Registrar pago'}
      </button>

      {error && <p style={{ color: 'var(--brick)', marginLeft: 8 }}>{error}</p>}
    </form>
  )
}
