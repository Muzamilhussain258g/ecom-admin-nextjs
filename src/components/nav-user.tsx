"use client"

import {
  CreditCard,
  EllipsisVertical,
  LogOut,
  BellDot,
  CircleUser,
} from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/logo"
import { useLogoutMutation } from "@/features/auth/hooks/useAuth"
import { getApiErrorMessage } from "@/lib/api/get-api-error-message"
import { toast } from "@/components/ui/toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    role?: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const logoutMutation = useLogoutMutation()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onError: (error) => {
        toast.add({
          type: "error",
          title: "Logout failed",
          description: getApiErrorMessage(error, "Unable to log out. Please try again."),
        })
      },
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground cursor-pointer"
              />
            }
          >
            <div className="flex size-8 items-center justify-center rounded-lg">
              <Logo size={28} className="size-7!" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
              {user.role ? (
                <span className="text-muted-foreground truncate text-xs capitalize">
                  {user.role}
                </span>
              ) : null}
            </div>
            <EllipsisVertical className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal text-foreground">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="size-8 rounded-lg">
                    <Logo size={28} />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user.email}
                    </span>
                    {user.role ? (
                      <span className="text-muted-foreground truncate text-xs capitalize">
                        {user.role}
                      </span>
                    ) : null}
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                render={<Link href="/settings/account" />}
              >
                <CircleUser />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                render={<Link href="/settings/billing" />}
              >
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                render={<Link href="/settings/notifications" />}
              >
                <BellDot />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                disabled={logoutMutation.isPending}
                onClick={handleLogout}
              >
                <LogOut />
                {logoutMutation.isPending ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
