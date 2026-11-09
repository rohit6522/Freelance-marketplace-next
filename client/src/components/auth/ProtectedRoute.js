"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageSpinner from "@/components/common/PageSpinner";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ roles, children }) {
  const { status, user } = useAuth();
  const router = useRouter();

  const rolesKey = roles ? roles.join(",") : "";
  const allowed = status === "authenticated" && (!roles || roles.includes(user.role));

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = window.location.pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    } else if (status === "authenticated" && roles && !roles.includes(user.role)) {
      toast.error("You do not have access to that page.", { id: "no-access" });
      router.replace("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, user, rolesKey, router]);

  if (!allowed) return <PageSpinner label={status === "loading" ? "Checking session..." : "Redirecting..."} />;
  return children;
}