'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function VistaPreviaButton({ ventaId }: { ventaId: string }) {
  const [resultado, setResultado] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function verVistaPrevia() {
    setCargando(true)
    setError('')
    setResultado(null)

    const supabase = createClient()
    const { data, error } = await supabase.functions.invoke('armar-factura-billpy', {
      body: { venta_id: ventaId },
    })

    setCargando(false)

    if (error) {
      setError('No se pudo armar el JSON: ' + error.message)
      return
    }

    if (data?.error) {
      setError(data.error)
      return
    }

    setResultado(JSON.stringify(data.json, null, 2))
  }

  return (
    <div>
      <button type="button" className="btn btn-ghost btn-sm" onClick={verVistaPrevia} disabled={cargando}>
        {cargando ? 'Armando…' : 'Vista previa del envío'}
      </button>

      {error && <p style={{ color: 'var(--brick)', marginTop: 8 }}>{error}</p>}

      {resultado && (
        <pre
          style={{
            marginTop: 10,
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: 12,
            fontSize: 11.5,
            whiteSpace: 'pre-wrap',
            maxWidth: 480,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          {resultado}
        </pre>
      )}
    </div>
  )
}
