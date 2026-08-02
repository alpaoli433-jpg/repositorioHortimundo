'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NuevoPagoForm from '../[id]/nuevo-pago-form'
import NuevoBonoForm from '../[id]/nuevo-bono-form'
import NuevoValeForm from '../[id]/nuevo-vale-form'
import NuevoPrestamoForm from '../[id]/nuevo-prestamo-form'

type Empleado = { id: string; nombre: string; salario: number }
type Tipo = 'recibo' | 'bono' | 'vale' | 'prestamo'

const TIPOS: { value: Tipo; label: string }[] = [
  { value: 'recibo', label: 'Recibo de sueldo' },
  { value: 'bono', label: 'Bono' },
  { value: 'vale', label: 'Vale de adelanto' },
  { value: 'prestamo', label: 'Préstamo' },
]

export default function GenerarDocumentoWizard({ empleados }: { empleados: Empleado[] }) {
  const [paso, setPaso] = useState<1 | 2 | 3>(1)
  const [empleadoId, setEmpleadoId] = useState('')
  const [tipo, setTipo] = useState<Tipo | null>(null)
  const router = useRouter()

  const empleado = empleados.find((e) => e.id === empleadoId)

  function irADocumento(id: string) {
    if (!tipo) return
    router.push(`/personal/${empleadoId}/${tipo}/${id}`)
  }

  if (paso === 1) {
    return (
      <div>
        <div className="field" style={{ maxWidth: 360 }}>
          <label>Empleado</label>
          <select value={empleadoId} onChange={(e) => setEmpleadoId(e.target.value)}>
            <option value="">— Elegí un empleado —</option>
            {empleados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 14 }}
          disabled={!empleadoId}
          onClick={() => setPaso(2)}
        >
          Siguiente
        </button>
      </div>
    )
  }

  if (paso === 2) {
    return (
      <div>
        <p className="sub">Empleado: {empleado?.nombre}</p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setTipo(t.value)
                setPaso(3)
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => setPaso(1)}>
          ← Cambiar empleado
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="sub">
        Empleado: {empleado?.nombre} · {TIPOS.find((t) => t.value === tipo)?.label}
      </p>

      {tipo === 'recibo' && (
        <NuevoPagoForm empleadoId={empleadoId} salarioSugerido={empleado?.salario ?? 0} onCreated={irADocumento} />
      )}
      {tipo === 'bono' && <NuevoBonoForm empleadoId={empleadoId} onCreated={irADocumento} />}
      {tipo === 'vale' && <NuevoValeForm empleadoId={empleadoId} onCreated={irADocumento} />}
      {tipo === 'prestamo' && <NuevoPrestamoForm empleadoId={empleadoId} onCreated={irADocumento} />}

      <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 14 }} onClick={() => setPaso(2)}>
        ← Cambiar tipo de documento
      </button>
    </div>
  )
}
