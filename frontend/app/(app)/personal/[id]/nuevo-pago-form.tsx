'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

function mesActual() {
  return new Date().toISOString().slice(0, 7)
}

export default function NuevoPagoForm({
  empleadoId,
  salarioSugerido,
}: {
  empleadoId: string
  salarioSugerido: number
}) {
  const [mes, setMes] = useState(mesActual())
  const [monto, setMonto] = useState(String(salarioSugerido ?? ''))
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('salarios_pagados').insert({
      empleado_id: empleadoId,
      monto: Number(monto),
      mes: `${mes}-01`,
    })

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setMes(mesActual())
    setMonto(String(salarioSugerido ?? ''))
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
        <input
          type="number"
          step="1"
          min="1"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary">
        Registrar pago
      </button>

      {error && <p style={{ color: 'var(--brick)', marginLeft: 8 }}>{error}</p>}
    </form>
  )
}
