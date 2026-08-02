'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

export type Vale = { id: string; monto: number; observaciones: string | null; fecha: string }

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoValeForm({
  empleadoId,
  onCreated,
  registroExistente,
  onGuardado,
}: {
  empleadoId: string
  onCreated?: (id: string) => void
  registroExistente?: Vale
  onGuardado?: () => void
}) {
  const [monto, setMonto] = useState<number | ''>(registroExistente?.monto ?? '')
  const [observaciones, setObservaciones] = useState(registroExistente?.observaciones ?? '')
  const [fecha, setFecha] = useState(registroExistente?.fecha ?? hoy())
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()
  const editando = Boolean(registroExistente)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const datos = {
      empleado_id: empleadoId,
      monto: monto === '' ? 0 : monto,
      observaciones: observaciones || null,
      fecha,
    }

    if (editando) {
      const { error } = await conCargando(() =>
        supabase.from('vales_adelanto').update(datos).eq('id', registroExistente!.id)
      )
      if (error) {
        setError('No se pudo guardar: ' + error.message)
        return
      }
      onGuardado?.()
      router.refresh()
      return
    }

    const { data, error } = await conCargando(() =>
      supabase.from('vales_adelanto').insert(datos).select().single()
    )

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    if (onCreated) {
      onCreated(data.id)
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
        <NumeroInput value={monto} onChange={setMonto} required />
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

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? (editando ? 'Guardando…' : 'Generando…') : editando ? 'Guardar cambios' : 'Generar vale'}
      </button>

      {editando && (
        <button type="button" className="btn btn-ghost" onClick={onGuardado}>
          Cancelar
        </button>
      )}

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
