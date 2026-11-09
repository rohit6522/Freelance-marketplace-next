"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <FavoritesProvider>
        {children}
        <Toaster
          position="top-right"
          closeButton
          style={{ "--border-radius": "0px", fontFamily: "var(--next-font-body), ui-sans-serif, sans-serif" }}
          toastOptions={{
            classNames: {
              toast: "rounded-none border border-outline-variant bg-surface-container-lowest text-on-surface shadow-[2px_2px_0px_#0b1c30]",
              title: "font-label-md text-label-md",
              description: "font-body-sm text-body-sm text-on-surface-variant",
              success: "border-primary",
              error: "border-error",
            },
          }}
        />
      </FavoritesProvider>
    </AuthProvider>
  );
}