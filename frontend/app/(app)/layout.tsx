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
      items: [{ label: 'Panel principal', href: '/' }],
    },
    {
      label: 'Comercial',
      items: [
        { label: 'Cargar venta', disabled: true, soloPropietario: true },
        { label: 'Facturación', disabled: true, soloPropietario: true },
        { label: 'Clientes', href: '/clientes', soloPropietario: true },
      ],
    },
    {
      label: 'Operación',
      items: [
        { label: 'Productos', href: '/productos' },
        { label: 'Mercadería', href: '/mercaderia' },
        { label: 'Stock', href: '/stock' },
        { label: 'Control de Lechugas', disabled: true },
        { label: 'Merma', href: '/merma' },
      ],
    },
    {
      label: 'Finanzas',
      items: [
        { label: 'Combustible', href: '/combustible' },
        { label: 'Gastos', href: '/gastos', soloPropietario: true },
        { label: 'Personal', href: '/personal', soloPropietario: true },
        { label: 'Reportes', disabled: true, soloPropietario: true },
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
