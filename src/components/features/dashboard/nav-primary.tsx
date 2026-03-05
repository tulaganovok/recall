import type { NavItems } from '#/lib/types'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link } from '@tanstack/react-router'

interface NavPrimaryProps {
  items: NavItems[]
}

export function NavPrimary({ items }: NavPrimaryProps) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ title, to, activeOptions, icon: Icon }) => {
            return (
              <SidebarMenuItem key={title}>
                <SidebarMenuButton asChild>
                  <Link
                    to={to}
                    activeOptions={activeOptions}
                    activeProps={{ 'data-active': true }}
                  >
                    <Icon className="size-6" />
                    <span>{title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
