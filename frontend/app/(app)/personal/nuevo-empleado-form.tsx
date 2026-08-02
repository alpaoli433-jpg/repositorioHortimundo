'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import NumeroInput from '@/components/numero-input'
import { useCargando } from '@/lib/use-cargando'

export type Empleado = {
  id: string
  nombre: string
  documento: string | null
  cargo: string | null
  fecha_ingreso: string | null
  salario: number
  estado: string
  observaciones: string | null
}

export default function NuevoEmpleadoForm({
  registroExistente,
  onGuardado,
}: {
  registroExistente?: Empleado
  onGuardado?: () => void
}) {
  const [nombre, setNombre] = useState(registroExistente?.nombre ?? '')
  const [documento, setDocumento] = useState(registroExistente?.documento ?? '')
  const [cargo, setCargo] = useState(registroExistente?.cargo ?? '')
  const [fechaIngreso, setFechaIngreso] = useState(registroExistente?.fecha_ingreso ?? '')
  const [salario, setSalario] = useState<number | ''>(registroExistente?.salario ?? '')
  const [estado, setEstado] = useState(registroExistente?.estado ?? 'activo')
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
      documento: documento || null,
      cargo: cargo || null,
      fecha_ingreso: fechaIngreso || null,
      salario: salario === '' ? 0 : salario,
      estado,
      observaciones: observaciones || null,
    }

    const { error } = await conCargando(() =>
      editando
        ? supabase.from('empleados').update(datos).eq('id', registroExistente!.id)
        : supabase.from('empleados').insert(datos)
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
    setDocumento('')
    setCargo('')
    setFechaIngreso('')
    setSalario('')
    setEstado('activo')
    setObservaciones('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div className="field" style={{ flex: 1 }}>
        <label>Nombre</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>

      <div className="field">
        <label>Documento</label>
        <input value={documento} onChange={(e) => setDocumento(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="field">
        <label>Cargo</label>
        <input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="field">
        <label>Fecha de ingreso</label>
        <input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
      </div>

      <div className="field">
        <label>Salario</label>
        <NumeroInput value={salario} onChange={setSalario} />
      </div>

      {editando && (
        <div className="field">
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      )}

      <div className="field" style={{ flex: 1 }}>
        <label>Observaciones</label>
        <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Opcional" />
      </div>

      <button type="submit" className="btn btn-primary" disabled={cargando}>
        {cargando ? (editando ? 'Guardando…' : 'Agregando…') : editando ? 'Guardar cambios' : 'Agregar'}
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
