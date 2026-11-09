"use client";

import ClientOverview from "./ClientOverview";
import FreelancerOverview from "./FreelancerOverview";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardHome() {
  const { user } = useAuth();
  return user.role === "freelancer" ? <FreelancerOverview /> : <ClientOverview />;
}