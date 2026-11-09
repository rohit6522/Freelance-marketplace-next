"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import CategoryBar from "./CategoryBar";
import UserMenu from "./UserMenu";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { getNavLinks, isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const ACTIVE_LINK = "transition-colors py-1 text-primary font-bold border-b-2 border-primary";
const IDLE_LINK = "font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors py-1";

export default function Navbar({ categories = [] }) {
  const pathname = usePathname();
  const { status, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const unread = useUnreadMessages(status === "authenticated");

  const links = getNavLinks(user);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest border-b border-outline-variant">
      <div className="h-16 max-w-7xl mx-auto px-margin-sm lg:px-margin flex items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md">
          <Logo />
          <SearchBar variant="desktop" />
        </div>

        <nav aria-label="Main" className="hidden lg:flex items-center gap-space-lg">
          {links.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={active ? ACTIVE_LINK : IDLE_LINK}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-space-md">
          {status === "loading" && (
            <div aria-hidden="true" className="h-8 w-20 bg-surface-container animate-pulse" />
          )}

          {status === "authenticated" && (
            <>
              <Link
                href="/messages"
                title={unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "Messages"}
                aria-label={unread > 0 ? `${unread} unread messages` : "Messages"}
                className="relative p-1 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Icon name="notifications" className="text-body-lg" />
                {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />}
              </Link>
              <UserMenu />
            </>
          )}

          {status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                className="hidden sm:inline font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-primary text-on-primary font-label-sm text-label-sm px-space-md py-1.5 border border-primary hover:bg-primary-container hover:text-on-primary-container transition-colors uppercase"
              >
                Join
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Icon name={menuOpen ? "close" : "menu"} className="text-body-lg" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-outline-variant bg-surface-container-lowest">
          <div className="max-w-7xl mx-auto px-margin-sm py-space-md flex flex-col gap-space-md">
            <SearchBar variant="mobile" onNavigate={closeMenu} />
            <nav aria-label="Mobile" className="flex flex-col">
              {links.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "py-space-sm border-b border-outline-variant font-label-md text-label-md",
                      active ? "text-primary font-bold" : "text-on-surface-variant"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {status === "unauthenticated" && (
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="py-space-sm font-label-md text-label-md text-on-surface-variant"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}

      <CategoryBar categories={categories} />
    </header>
  );
}