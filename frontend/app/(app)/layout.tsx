import { getPerfilActual } from '@/lib/supabase/perfil'
import SidebarNav, { type NavGroup } from './sidebar-nav'
import LogoutButton from './logout-button'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { nombre, rol } = await getPerfilActual()

  const gruposBase: NavGroup[] = [
    {
      label: 'General',
      items: [{ label: 'Panel principal', icon: '🏠', href: '/' }],
    },
    {
      label: 'Comercial',
      items: [
        { label: 'Cargar venta', icon: '🧾', href: '/ventas', soloPropietario: true },
        { label: 'Facturación', icon: '📄', href: '/facturacion', soloPropietario: true },
        { label: 'Clientes', icon: '👤', href: '/clientes', soloPropietario: true },
      ],
    },
    {
      label: 'Operación',
      items: [
        { label: 'Productos', icon: '🍅', href: '/productos' },
        { label: 'Mercadería', icon: '📦', href: '/mercaderia' },
        { label: 'Stock', icon: '📊', href: '/stock' },
        { label: 'Control de Lechugas', icon: '🥬', href: '/lechugas' },
        { label: 'Merma', icon: '🗑️', href: '/merma' },
      ],
    },
    {
      label: 'Finanzas',
      items: [
        { label: 'Combustible', icon: '⛽', href: '/combustible' },
        { label: 'Gastos', icon: '💸', href: '/gastos', soloPropietario: true },
        { label: 'Personal', icon: '🧑‍🌾', href: '/personal', soloPropietario: true },
      ],
    },
  ]

  const grupos = gruposBase
    .map((grupo) => ({
      ...grupo,
      items: grupo.items.filter((item) => !(item.soloPropietario && rol !== 'propietario')),
    }))
    .filter((grupo) => grupo.items.length > 0)

  const inicial = nombre ? nombre.charAt(0).toUpperCase() : '?'
  const rolLabel = rol === 'propietario' ? 'Propietario' : rol === 'ayudante' ? 'Ayudante' : ''

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="stamp">
            HORTI
            <br />
            MUNDO
          </div>
          <h1>HortiMundo</h1>
          <p>Panel de gestión</p>
        </div>

        <SidebarNav groups={grupos} />

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="avatar">{inicial}</div>
            <div className="who">
              <b>{nombre ?? 'Usuario'}</b>
              <span>{rolLabel}</span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main>{children}</main>
    </div>
  )
}
