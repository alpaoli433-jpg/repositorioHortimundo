'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  onEliminar: () => Promise<{ error: { message: string; code?: string } | null }>
  confirmacion?: string
  mensajeConflicto?: string
  mensajeCrudo?: boolean
}

export default function EliminarButton({ onEliminar, confirmacion, mensajeConflicto, mensajeCrudo }: Props) {
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!window.confirm(confirmacion ?? '¿Seguro que querés eliminar este registro?')) {
      return
    }

    setCargando(true)
    setError('')
    const { error } = await onEliminar()
    setCargando(false)

    if (error) {
      if (error.code === '23503') {
        setError(mensajeConflicto ?? 'No se puede eliminar: hay otros registros que dependen de este.')
      } else if (mensajeCrudo) {
        setError(error.message)
      } else {
        setError('No se pudo eliminar: ' + error.message)
      }
      return
    }

    router.refresh()
  }

  return (
    <span>
      <button type="button" className="btn btn-ghost btn-sm" onClick={handleClick} disabled={cargando}>
        {cargando ? 'Eliminando…' : 'Eliminar'}
      </button>
      {error && <p style={{ color: 'var(--brick)', fontSize: 11, marginTop: 4 }}>{error}</p>}
    </span>
  )
}
