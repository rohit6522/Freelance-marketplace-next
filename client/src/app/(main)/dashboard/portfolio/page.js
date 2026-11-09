import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PortfolioManager from "@/components/dashboard/PortfolioManager";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return (
    <ProtectedRoute roles={[ROLES.FREELANCER]}>
      <PortfolioManager />
    </ProtectedRoute>
  );
}