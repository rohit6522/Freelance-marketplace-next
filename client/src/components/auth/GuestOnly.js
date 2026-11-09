"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageSpinner from "@/components/common/PageSpinner";
import { useAuth } from "@/hooks/useAuth";

export default function GuestOnly({ redirectTo = "/dashboard", children }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") router.replace(redirectTo);
  }, [status, redirectTo, router]);

  if (status === "authenticated") return <PageSpinner label="Redirecting..." />;
  return children;
}