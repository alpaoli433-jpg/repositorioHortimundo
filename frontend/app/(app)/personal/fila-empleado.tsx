'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import EliminarButton from '@/components/eliminar-button'
import NuevoEmpleadoForm, { type Empleado } from './nuevo-empleado-form'

export default function FilaEmpleado({ empleado }: { empleado: Empleado }) {
  const [editando, setEditando] = useState(false)

  if (editando) {
    return (
      <tr>
        <td colSpan={5}>
          <NuevoEmpleadoForm registroExistente={empleado} onGuardado={() => setEditando(false)} />
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>
        <Link href={`/personal/${empleado.id}`}>
          <b>{empleado.nombre}</b>
        </Link>
      </td>
      <td>{empleado.cargo ?? '—'}</td>
      <td className="mono-num">₲ {Number(empleado.salario).toLocaleString('es-PY')}</td>
      <td>
        <span className={`badge ${empleado.estado === 'activo' ? 'activo' : 'inactivo'}`}>{empleado.estado}</span>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
            Editar
          </button>
          <EliminarButton
            confirmacion={`¿Eliminar a ${empleado.nombre}?`}
            mensajeConflicto="No se puede eliminar: tiene pagos, bonos, vales o préstamos asociados. Marcalo como 'inactivo' en su lugar."
            onEliminar={async () => {
              const supabase = createClient()
              return supabase.from('empleados').delete().eq('id', empleado.id)
            }}
          />
        </div>
      </td>
    </tr>
  )
}
