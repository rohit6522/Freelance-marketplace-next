import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileEditor from "@/components/dashboard/ProfileEditor";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Edit profile" };

export default function ProfilePage() {
  return (
    <ProtectedRoute roles={[ROLES.FREELANCER]}>
      <ProfileEditor />
    </ProtectedRoute>
  );
}