import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GigFormLoader from "@/components/dashboard/GigFormLoader";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Create gig" };

export default function CreateGigPage() {
  return (
    <ProtectedRoute roles={[ROLES.FREELANCER]}>
      <GigFormLoader />
    </ProtectedRoute>
  );
}