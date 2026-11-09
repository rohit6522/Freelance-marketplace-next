import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Earnings from "@/components/dashboard/Earnings";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Earnings" };

export default function EarningsPage() {
  return (
    <ProtectedRoute roles={[ROLES.FREELANCER]}>
      <Earnings />
    </ProtectedRoute>
  );
}