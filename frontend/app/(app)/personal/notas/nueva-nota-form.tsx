'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCargando } from '@/lib/use-cargando'

type Empleado = { id: string; nombre: string }

export type Nota = {
  id: string
  titulo: string
  contenido: string
  fecha: string
  empleado_id: string | null
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

export default function NuevaNotaForm({
  empleados,
  registroExistente,
  onGuardado,
}: {
  empleados: Empleado[]
  registroExistente?: Nota
  onGuardado?: () => void
}) {
  const [titulo, setTitulo] = useState(registroExistente?.titulo ?? '')
  const [contenido, setContenido] = useState(registroExistente?.contenido ?? '')
  const [fecha, setFecha] = useState(registroExistente?.fecha ?? hoy())
  const [empleadoId, setEmpleadoId] = useState(registroExistente?.empleado_id ?? '')
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()
  const editando = Boolean(registroExistente)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const datos = {
      titulo,
      contenido,
      fecha,
      empleado_id: empleadoId || null,
    }

    const { error } = await conCargando(() =>
      editando
        ? supabase.from('notas').update(datos).eq('id', registroExistente!.id)
        : supabase.from('notas').insert(datos)
    )

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    if (editando) {
      onGuardado?.()
      router.refresh()
      return
    }

    setTitulo('')
    setContenido('')
    setFecha(hoy())
    setEmpleadoId('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Título</label>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </div>

        <div className="field">
          <label>Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
        </div>

        <div className="field" style={{ flex: 1 }}>
          <label>Empleado</label>
          <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}>
            <option value="">— General (sin empleado) —</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label>Contenido</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          required
          rows={6}
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: '9px 11px',
            fontSize: 13,
            fontFamily: 'var(--body)',
            color: 'var(--ink)',
            resize: 'vertical',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={cargando}>
          {cargando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar nota'}
        </button>
        {editando && (
          <button type="button" className="btn btn-ghost" onClick={onGuardado}>
            Cancelar
          </button>
        )}
      </div>

      {error && <p style={{ color: 'var(--brick)', marginTop: 10 }}>{error}</p>}
    </form>
  )
}
