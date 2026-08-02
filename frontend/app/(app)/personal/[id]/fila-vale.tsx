'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import EliminarButton from '@/components/eliminar-button'
import NuevoValeForm, { type Vale } from './nuevo-vale-form'

export default function FilaVale({ vale, empleadoId }: { vale: Vale; empleadoId: string }) {
  const [editando, setEditando] = useState(false)

  if (editando) {
    return (
      <tr>
        <td colSpan={4}>
          <NuevoValeForm empleadoId={empleadoId} registroExistente={vale} onGuardado={() => setEditando(false)} />
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>{vale.fecha}</td>
      <td>{vale.observaciones ?? '—'}</td>
      <td className="mono-num">₲ {Number(vale.monto).toLocaleString('es-PY')}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href={`/personal/${empleadoId}/vale/${vale.id}`} className="btn btn-ghost btn-sm">
            Ver documento
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
            Editar
          </button>
          <EliminarButton
            confirmacion="¿Eliminar este vale?"
            onEliminar={async () => {
              const supabase = createClient()
              return supabase.from('vales_adelanto').delete().eq('id', vale.id)
            }}
          />
        </div>
      </td>
    </tr>
  )
}
