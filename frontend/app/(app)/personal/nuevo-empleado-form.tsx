'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NuevoEmpleadoForm() {
  const [nombre, setNombre] = useState('')
  const [documento, setDocumento] = useState('')
  const [cargo, setCargo] = useState('')
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [salario, setSalario] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const supabase = createClient()
    const { error } = await supabase.from('empleados').insert({
      nombre,
      documento: documento || null,
      cargo: cargo || null,
      fecha_ingreso: fechaIngreso || null,
      salario: salario ? Number(salario) : 0,
      observaciones: observaciones || null,
    })

    if (error) {
      setError('No se pudo guardar: ' + error.message)
      return
    }

    setNombre('')
    setDocumento('')
    setCargo('')
    setFechaIngreso('')
    setSalario('')
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
        <input
          type="number"
          step="1"
          min="0"
          value={salario}
          onChange={(e) => setSalario(e.target.value)}
        />
      </div>

      <div className="field" style={{ flex: 1 }}>
        <label>Observaciones</label>
        <input value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Opcional" />
      </div>

      <button type="submit" className="btn btn-primary">
        Agregar
      </button>

      {error && <p style={{ color: 'var(--brick)', width: '100%' }}>{error}</p>}
    </form>
  )
}
