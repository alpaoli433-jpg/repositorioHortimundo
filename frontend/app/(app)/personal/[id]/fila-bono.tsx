'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import EliminarButton from '@/components/eliminar-button'
import NuevoBonoForm, { type Bono } from './nuevo-bono-form'

export default function FilaBono({ bono, empleadoId }: { bono: Bono; empleadoId: string }) {
  const [editando, setEditando] = useState(false)

  if (editando) {
    return (
      <tr>
        <td colSpan={4}>
          <NuevoBonoForm empleadoId={empleadoId} registroExistente={bono} onGuardado={() => setEditando(false)} />
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>{bono.fecha}</td>
      <td>{bono.motivo ?? '—'}</td>
      <td className="mono-num">₲ {Number(bono.monto).toLocaleString('es-PY')}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href={`/personal/${empleadoId}/bono/${bono.id}`} className="btn btn-ghost btn-sm">
            Ver documento
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
            Editar
          </button>
          <EliminarButton
            confirmacion="¿Eliminar este bono?"
            onEliminar={async () => {
              const supabase = createClient()
              return supabase.from('bonos').delete().eq('id', bono.id)
            }}
          />
        </div>
      </td>
    </tr>
  )
}
