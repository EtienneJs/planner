"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart2,
  Calendar,
  LayoutDashboard,
  List,
  LogOut,
  Package,
  ShoppingCart,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useTranslation } from "@/components/language-provider";
import type { MessageKey } from "@/lib/i18n/messages";

const nav: {
  titleKey: MessageKey;
  href: string;
  icon: typeof Calendar;
}[] = [
  { titleKey: "nav.events", href: "/dashboard/events", icon: Calendar },
  { titleKey: "nav.products", href: "/dashboard/products", icon: Package },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard" />}
              isActive={pathname === "/dashboard"}
              tooltip={t("nav.overview")}
            >
              <LayoutDashboard />
              <span>{t("nav.overview")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                    }
                    tooltip={t(item.titleKey)}
                  >
                    <item.icon />
                    <span>{t(item.titleKey)}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard/purchases" />}
                  isActive={pathname.startsWith("/dashboard/purchases")}
                  tooltip={t("nav.purchases")}
                >
                  <ShoppingCart />
                  <span>{t("nav.purchases")}</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/dashboard/purchases" />}
                      isActive={
                        pathname === "/dashboard/purchases" ||
                        pathname === "/dashboard/purchases/"
                      }
                      size="sm"
                    >
                      <List />
                      <span>{t("nav.purchasesList")}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton
                      render={<Link href="/dashboard/purchases/charts" />}
                      isActive={pathname.startsWith(
                        "/dashboard/purchases/charts"
                      )}
                      size="sm"
                    >
                      <BarChart2 />
                      <span>{t("nav.purchasesCharts")}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              tooltip={t("nav.signOut")}
            >
              <LogOut />
              <span>{t("nav.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
