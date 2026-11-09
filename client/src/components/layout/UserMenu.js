"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "@/components/ui/Avatar";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";

function getMenuItems(user) {
  const items = [
    { label: "Dashboard", href: "/dashboard", icon: "space_dashboard" },
    { label: "My Orders", href: "/orders", icon: "receipt_long" },
    { label: "Messages", href: "/messages", icon: "chat" },
  ];
  if (user.role === "client") {
    items.push({ label: "Saved Gigs", href: "/dashboard/saved", icon: "favorite" });
  } else {
    items.push({ label: "My Public Profile", href: `/freelancers/${user._id}`, icon: "person" });
  }
  items.push({ label: "Account Settings", href: "/dashboard/settings", icon: "settings" });
  return items;
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/login");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open account menu"
        className="flex items-center gap-space-xs cursor-pointer"
      >
        <Avatar user={user} />
        <Icon name="expand_more" className="text-outline text-body-sm hidden sm:inline-block" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-space-sm w-60 bg-surface-container-lowest border border-outline-variant shadow-[2px_2px_0px_#0b1c30] z-50"
        >
          <div className="px-space-md py-space-sm border-b border-outline-variant">
            <p className="font-label-md text-label-md text-on-surface truncate">{user.name}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{user.email}</p>
            <span className="inline-block mt-space-xs font-code-sm text-code-sm text-primary uppercase px-space-xs bg-surface-container-low border border-outline-variant">
              {user.role}
            </span>
          </div>

          <div className="py-space-xs">
            {getMenuItems(user).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-space-sm px-space-md py-space-sm font-body-sm text-body-sm text-on-surface hover:bg-surface-container-low transition-colors"
              >
                <Icon name={item.icon} className="text-body-md text-on-surface-variant" />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-outline-variant py-space-xs">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-space-sm px-space-md py-space-sm font-body-sm text-body-sm text-error hover:bg-error-container transition-colors text-left"
            >
              <Icon name="logout" className="text-body-md" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}