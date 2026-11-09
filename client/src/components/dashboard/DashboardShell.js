"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { getDashboardNav } from "./dashboardNav";
import { SELLER_TIER_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function Shell({ children }) {
  const { user, freelancerProfile } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadMessages(true);
  const items = getDashboardNav(user.role);
  const tier = freelancerProfile?.sellerTier ? SELLER_TIER_LABELS[freelancerProfile.sellerTier] : null;

  const isActive = (item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <aside className="lg:col-span-3 flex flex-col gap-space-md lg:sticky lg:top-28">
          <div className="hidden lg:flex items-center gap-space-sm bg-surface-container-lowest border border-outline-variant p-space-md">
            <Avatar user={user} size="w-12 h-12" shape="square" />
            <div className="min-w-0">
              <p className="font-label-md text-label-md text-on-surface font-bold truncate">{user.name}</p>
              <p className="font-code-sm text-code-sm text-on-surface-variant truncate">{user.email}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="font-code-sm text-[11px] text-primary uppercase bg-surface-container-low border border-outline-variant px-1">
                  {user.role}
                </span>
                {tier && (
                  <span className="font-code-sm text-[11px] text-on-primary uppercase bg-primary px-1">{tier}</span>
                )}
              </div>
            </div>
          </div>

          <nav
            aria-label="Dashboard"
            className="flex lg:flex-col gap-space-xs overflow-x-auto no-scrollbar bg-surface-container-lowest border border-outline-variant p-space-xs"
          >
            {items.map((item) => {
              const active = isActive(item);

              if (item.soon) {
                return (
                  <span
                    key={item.href}
                    aria-disabled="true"
                    title="Coming in the next step"
                    className="flex items-center gap-space-sm px-space-sm py-2 font-label-md text-label-md text-outline whitespace-nowrap cursor-not-allowed"
                  >
                    <Icon name={item.icon} className="text-body-md" />
                    <span className="flex-1">{item.label}</span>
                    <span className="font-code-sm text-[10px] bg-surface-container px-1 text-on-surface-variant">SOON</span>
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-space-sm px-space-sm py-2 font-label-md text-label-md whitespace-nowrap transition-colors",
                    active
                      ? "bg-on-surface text-surface-container-lowest"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  )}
                >
                  <Icon name={item.icon} className="text-body-md" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge === "messages" && unread > 0 && (
                    <span className="bg-primary text-on-primary font-code-sm text-[11px] min-w-5 h-5 px-1 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="lg:col-span-9 min-w-0 flex flex-col gap-space-lg">{children}</div>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }) {
  return (
    <ProtectedRoute>
      <Shell>{children}</Shell>
    </ProtectedRoute>
  );
}