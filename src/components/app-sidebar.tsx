"use client";

import * as React from "react";
import {
  FolderTree,
  LayoutGrid,
  Package,
  ShoppingBag,
  Star,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { useCurrentUserQuery } from "@/features/auth/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navGroups: [
    {
      label: "Apps",
      items: [
        { title: "Orders", url: "/orders", icon: ShoppingBag },
        { title: "Products", url: "/products", icon: Package },
        { title: "Variants", url: "/variants", icon: Tags },
        { title: "Categories", url: "/categories", icon: FolderTree },
        { title: "Collections", url: "/collections", icon: LayoutGrid },
        { title: "Users", url: "/users", icon: Users },
        { title: "Reviews", url: "/reviews", icon: Star },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isError } = useCurrentUserQuery();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Logo size={24} className="text-current" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">EcommerceStore</span>
                <span className="truncate text-xs">Admin Dashboard</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? (isError ? "Profile unavailable" : "Loading profile..."),
            email: user?.email ?? "",
            role: user?.role ?? "",
            avatar: "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
