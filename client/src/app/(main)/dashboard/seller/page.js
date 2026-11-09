import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Seller area" };

export default function SellerAreaPage() {
  return (
    <ProtectedRoute roles={[ROLES.FREELANCER]}>
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
        <h1 className="font-headline-md text-headline-md text-on-surface uppercase">Seller area</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
          Only freelancers can see this page. Clients are redirected back to the dashboard.
        </p>
      </div>
    </ProtectedRoute>
  );
}