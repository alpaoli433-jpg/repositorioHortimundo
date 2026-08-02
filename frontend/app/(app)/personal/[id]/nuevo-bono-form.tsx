'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

export type Bono = { id: string; monto: number; motivo: string | null; fecha: string }

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevoBonoForm({
  empleadoId,
  onCreated,
  registroExistente,
  onGuardado,
}: {
  empleadoId: string
  onCreated?: (id: string) => void
  registroExistente?: Bono
  onGuardado?: () => void
}) {
  const [monto, setMonto] = useState<number | ''>(registroExistente?.monto ?? '')
  const [motivo, setMotivo] = useState(registroExistente?.motivo ?? '')
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
      motivo: motivo || null,
      fecha,
    }

    if (editando) {
      const { error } = await conCargando(() =>
        supabase.from('bonos').update(datos).eq('id', registroExistente!.id)
      )
      if (error) {
        setError('No se pudo guardar: ' + error.message)
        return
      }
      onGuardado?.()
      router.refresh()
      return
    }

    const { data, error } = await conCargando(() => supabase.from('bonos').insert(datos).select().single())

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    if (onCreated) {
      onCreated(data.id)
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
        <NumeroInput value={monto} onChange={setMonto} required />
      </div>

      <div className="field" style={{ flex: 1 }}>
        <label>Motivo</label>
        <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="field">
        <label>Fecha</label>
        <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
      </div>

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? (editando ? 'Guardando…' : 'Registrando…') : editando ? 'Guardar cambios' : 'Registrar bono'}
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
