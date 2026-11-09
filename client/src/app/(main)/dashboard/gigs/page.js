import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MyGigs from "@/components/dashboard/MyGigs";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "My gigs" };

export default function MyGigsPage() {
  return (
    <ProtectedRoute roles={[ROLES.FREELANCER]}>
      <MyGigs />
    </ProtectedRoute>
  );
}