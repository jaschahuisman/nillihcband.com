"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Contact,
  LogOut,
  Music2,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/crm/contacts", label: "Contacten", icon: Users },
  { href: "/crm/venues", label: "Venues", icon: Contact },
  { href: "/crm/gigs", label: "Optredens", icon: CalendarDays },
  {
    href: "/crm/similar-artists",
    label: "Vergelijkbare artiesten",
    icon: Music2,
  },
] as const;

export function CrmShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/crm/login");
    router.refresh();
  }

  return (
    <SidebarProvider
      defaultOpen
      style={{ "--sidebar-width": "12.5rem" } as React.CSSProperties}
    >
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-11 justify-center gap-0 border-b border-sidebar-border px-2.5">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="sm" asChild tooltip="Nillihc CRM">
                <Link href="/crm/contacts" className="font-semibold tracking-tight">
                  <span className="truncate">Nillihc</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="py-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map(({ href, label, icon: Icon }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      size="sm"
                      isActive={pathname.startsWith(href)}
                      tooltip={label}
                    >
                      <Link href={href}>
                        <Icon />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="sm"
                onClick={handleLogout}
                tooltip="Uitloggen"
              >
                <LogOut />
                <span>Uitloggen</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-6 md:px-8">
          <SidebarTrigger className="-ml-0.5 size-7" />
        </header>
        <div className="flex-1 overflow-auto px-6 py-4 md:px-8 md:py-5">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
