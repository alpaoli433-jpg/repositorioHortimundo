'use client'

import { useState } from 'react'
import NuevoClienteForm, { type Cliente } from '../nuevo-cliente-form'

export default function DatosCliente({ cliente }: { cliente: Cliente }) {
  const [editando, setEditando] = useState(false)

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Datos del cliente</h3>
        {!editando && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditando(true)}>
            Editar
          </button>
        )}
      </div>

      {editando ? (
        <div style={{ marginTop: 10 }}>
          <NuevoClienteForm registroExistente={cliente} onGuardado={() => setEditando(false)} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <div>
            <p className="sub" style={{ marginBottom: 2 }}>RUC</p>
            <p>{cliente.ruc ?? '—'}</p>
          </div>
          <div>
            <p className="sub" style={{ marginBottom: 2 }}>Teléfono</p>
            <p>{cliente.telefono ?? '—'}</p>
          </div>
          <div>
            <p className="sub" style={{ marginBottom: 2 }}>Dirección</p>
            <p>{cliente.direccion ?? '—'}</p>
          </div>
          <div>
            <p className="sub" style={{ marginBottom: 2 }}>Correo</p>
            <p>{cliente.correo ?? '—'}</p>
          </div>
          <div>
            <p className="sub" style={{ marginBottom: 2 }}>Observaciones</p>
            <p>{cliente.observaciones ?? '—'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
