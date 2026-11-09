import { notFound } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import GigFormLoader from "@/components/dashboard/GigFormLoader";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Edit gig" };

export default async function EditGigPage({ params }) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();

  return (
    <ProtectedRoute roles={[ROLES.FREELANCER]}>
      <GigFormLoader id={id} />
    </ProtectedRoute>
  );
}