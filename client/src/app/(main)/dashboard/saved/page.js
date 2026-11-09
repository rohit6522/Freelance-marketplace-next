import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SavedGigs from "@/components/dashboard/SavedGigs";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Saved gigs" };

export default function SavedGigsPage() {
  return (
    <ProtectedRoute roles={[ROLES.CLIENT]}>
      <SavedGigs />
    </ProtectedRoute>
  );
}