'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useCargando } from '@/lib/use-cargando'

export type Cliente = {
  id: string
  nombre: string
  ruc: string | null
  telefono: string | null
  direccion: string | null
  correo: string | null
  estado: 'activo' | 'inactivo'
  observaciones: string | null
}

export default function NuevoClienteForm({
  registroExistente,
  onGuardado,
}: {
  registroExistente?: Cliente
  onGuardado?: () => void
}) {
  const [nombre, setNombre] = useState(registroExistente?.nombre ?? '')
  const [ruc, setRuc] = useState(registroExistente?.ruc ?? '')
  const [telefono, setTelefono] = useState(registroExistente?.telefono ?? '')
  const [direccion, setDireccion] = useState(registroExistente?.direccion ?? '')
  const [correo, setCorreo] = useState(registroExistente?.correo ?? '')
  const [estado, setEstado] = useState<'activo' | 'inactivo'>(registroExistente?.estado ?? 'activo')
  const [observaciones, setObservaciones] = useState(registroExistente?.observaciones ?? '')
  const [error, setError] = useState('')
  const router = useRouter()
  const { cargando, conCargando } = useCargando()
  const editando = Boolean(registroExistente)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const datos = {
      nombre,
      ruc: ruc || null,
      telefono: telefono || null,
      direccion: direccion || null,
      correo: correo || null,
      estado,
      observaciones: observaciones || null,
    }

    const { error } = await conCargando(() =>
      editando
        ? supabase.from('clientes').update(datos).eq('id', registroExistente!.id)
        : supabase.from('clientes').insert(datos)
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

    setNombre('')
    setRuc('')
    setTelefono('')
    setDireccion('')
    setCorreo('')
    setEstado('activo')
    setObservaciones('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Nombre del cliente</label>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>RUC</label>
          <input value={ruc} onChange={(e) => setRuc(e.target.value)} placeholder="Opcional" />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Teléfono</label>
          <input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Opcional" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 12 }}>
        <div className="field" style={{ flex: 2 }}>
          <label>Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Opcional" />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Correo</label>
          <input value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="Opcional" />
        </div>
        <div className="field">
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value as 'activo' | 'inactivo')}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label>Observaciones</label>
        <input
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Opcional"
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button type="submit" className="btn btn-primary" disabled={cargando}>
          {cargando ? (editando ? 'Guardando…' : 'Agregando…') : editando ? 'Guardar cambios' : 'Agregar'}
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
