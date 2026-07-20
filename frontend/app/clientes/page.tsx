import { createClient } from '@/lib/supabase/server'
import NuevoClienteForm from './nuevo-cliente-form'
export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre')

  return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: 24 }}>
      <h1>Clientes</h1>

      <NuevoClienteForm />

      <hr style={{ margin: '24px 0' }} />

      {error && <p style={{ color: 'red' }}>Error al cargar clientes: {error.message}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {clientes?.map((cliente) => (
          <li key={cliente.id} style={{ padding: '10px 0', borderBottom: '1px solid #ddd' }}>
            <strong>{cliente.nombre}</strong>
            {cliente.ruc && <span> — RUC: {cliente.ruc}</span>}
            <br />
            <span style={{ fontSize: 13, color: '#666' }}>{cliente.estado}</span>
          </li>
        ))}
      </ul>

      {clientes?.length === 0 && <p>Todavía no hay clientes cargados.</p>}
    </div>
  )
}