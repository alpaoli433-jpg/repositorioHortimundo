'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export type NavItem = {
  label: string
  href?: string
  disabled?: boolean
  soloPropietario?: boolean
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export default function SidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()

  return (
    <>
      {groups.map((group) => (
        <div className="nav-group" key={group.label}>
          <p className="nav-label">{group.label}</p>
          {group.items.map((item) => {
            const active = !!item.href && pathname === item.href

            if (!item.href || item.disabled) {
              return (
                <div className="nav-item disabled" key={item.label}>
                  <span className="dot"></span> {item.label}
                </div>
              )
            }

            return (
              <Link
                href={item.href}
                className={`nav-item${active ? ' active' : ''}`}
                key={item.label}
              >
                <span className="dot"></span> {item.label}
              </Link>
            )
          })}
        </div>
      ))}
    </>
  )
}
