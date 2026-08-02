'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import EliminarButton from '@/components/eliminar-button'
import NuevaNotaForm, { type Nota } from './nueva-nota-form'

type Empleado = { id: string; nombre: string }
type NotaConEmpleado = Nota & { empleados: { nombre: string } | null }

export default function FilaNota({ nota, empleados }: { nota: NotaConEmpleado; empleados: Empleado[] }) {
  const [editando, setEditando] = useState(false)

  if (editando) {
    return (
      <tr>
        <td colSpan={4}>
          <NuevaNotaForm empleados={empleados} registroExistente={nota} onGuardado={() => setEditando(false)} />
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>{nota.titulo}</td>
      <td>{nota.fecha}</td>
      <td>{nota.empleados?.nombre ?? 'General'}</td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <Link href={`/personal/notas/${nota.id}`} className="btn btn-ghost btn-sm">
            Ver nota
          </Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
            Editar
          </button>
          <EliminarButton
            confirmacion="¿Eliminar esta nota?"
            onEliminar={async () => {
              const supabase = createClient()
              return supabase.from('notas').delete().eq('id', nota.id)
            }}
          />
        </div>
      </td>
    </tr>
  )
}
