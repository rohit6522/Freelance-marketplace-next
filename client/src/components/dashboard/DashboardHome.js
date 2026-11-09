"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/ui/Avatar";

export default function DashboardHome() {
  const { user, freelancerProfile } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-xs py-0.5 mb-space-sm">
        <span className="w-1.5 h-1.5 bg-primary" />
        <span className="font-code-sm text-code-sm text-on-surface font-semibold tracking-widest uppercase">
          Step 9 // Auth check (temporary page)
        </span>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant shadow-[2px_2px_0px_#0b1c30] p-space-lg flex items-center gap-space-md">
        <Avatar user={user} size="w-16 h-16" />
        <div className="min-w-0">
          <h1 className="font-headline-md text-headline-md text-on-surface truncate">Welcome, {user.name}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</p>
          <p className="font-code-sm text-code-sm text-primary uppercase mt-space-xs">
            Role: {user.role}
            {freelancerProfile?.title ? ` // ${freelancerProfile.title}` : ""}
          </p>
        </div>
      </div>

      <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md">
        Your session survives a page refresh. The real client and freelancer dashboards arrive in Step 12.
      </p>

      <Link
        href="/dashboard/seller"
        className="inline-block mt-space-md px-space-md py-space-sm bg-surface-container-low border border-outline-variant font-label-sm text-label-sm uppercase font-semibold text-primary hover:bg-primary hover:text-on-primary transition-all"
      >
        Open freelancer-only page
      </Link>
    </div>
  );
}