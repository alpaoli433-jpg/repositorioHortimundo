import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPerfilActual } from '@/lib/supabase/perfil'
import { calcularResumenPorPeriodos } from '@/lib/resumen-negocio'
import PanelStats from './panel-stats'

export default async function HomePage() {
  const { nombre, rol } = await getPerfilActual()

  if (rol !== 'propietario') {
    return (
      <div>
        <div className="topbar">
          <div>
            <h2>Hola, {nombre ?? 'Usuario'}</h2>
            <div className="date">HortiMundo, Caacupé</div>
          </div>
        </div>

        <div className="card">
          <h3>Accesos rápidos</h3>
          <div className="quick-grid">
            <Link href="/mercaderia" className="quick-btn">
              <div className="qi">📦</div>
              <div className="qt">Mercadería</div>
            </Link>
            <Link href="/stock" className="quick-btn">
              <div className="qi">📊</div>
              <div className="qt">Stock</div>
            </Link>
            <Link href="/combustible" className="quick-btn">
              <div className="qi">⛽</div>
              <div className="qt">Combustible</div>
            </Link>
            <Link href="/lechugas" className="quick-btn">
              <div className="qi">🥬</div>
              <div className="qt">Control de Lechugas</div>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const hoy = new Date()
  const datosPorPeriodo = await calcularResumenPorPeriodos(supabase, hoy)

  return (
    <div>
      <div className="topbar">
        <div>
          <h2>Buen día, {nombre ?? 'Usuario'}</h2>
          <div className="date">HortiMundo, Caacupé</div>
        </div>
      </div>

      <PanelStats datos={datosPorPeriodo} />

      <div className="card">
        <h3>Accesos rápidos</h3>
        <div className="sub">Lo que se usa todos los días</div>
        <div className="quick-grid">
          <Link href="/ventas" className="quick-btn">
            <div className="qi">🧾</div>
            <div className="qt">Cargar venta</div>
          </Link>
          <Link href="/clientes" className="quick-btn">
            <div className="qi">👤</div>
            <div className="qt">Nuevo cliente</div>
          </Link>
          <Link href="/lechugas" className="quick-btn">
            <div className="qi">🥬</div>
            <div className="qt">Control lechugas</div>
          </Link>
          <Link href="/personal" className="quick-btn">
            <div className="qi">🧑‍🌾</div>
            <div className="qt">Personal</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
