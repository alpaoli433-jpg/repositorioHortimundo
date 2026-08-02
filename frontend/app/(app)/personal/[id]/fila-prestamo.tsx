'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import EliminarButton from '@/components/eliminar-button'
import NuevoPrestamoForm, { type Prestamo } from './nuevo-prestamo-form'

export default function FilaPrestamo({ prestamo, empleadoId }: { prestamo: Prestamo; empleadoId: string }) {
  const [editando, setEditando] = useState(false)

  if (editando) {
    return (
      <tr>
        <td colSpan={4}>
          <NuevoPrestamoForm
            empleadoId={empleadoId}
            registroExistente={prestamo}
            onGuardado={() => setEditando(false)}
          />
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>{prestamo.fecha}</td>
      <td>{prestamo.condiciones ?? '—'}</td>
      <td className="mono-num">₲ {Number(prestamo.monto).toLocaleString('es-PY')}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href={`/personal/${empleadoId}/prestamo/${prestamo.id}`} className="btn btn-ghost btn-sm">
            Ver documento
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
            Editar
          </button>
          <EliminarButton
            confirmacion="¿Eliminar este préstamo?"
            onEliminar={async () => {
              const supabase = createClient()
              return supabase.from('prestamos').delete().eq('id', prestamo.id)
            }}
          />
        </div>
      </td>
    </tr>
  )
}
