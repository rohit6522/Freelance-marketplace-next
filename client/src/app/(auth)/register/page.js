import GuestOnly from "@/components/auth/GuestOnly";
import RegisterForm from "@/components/auth/RegisterForm";
import { RegisterSidebar, RegisterRibbon } from "@/components/auth/RegisterPanels";
import { serverGet } from "@/lib/serverApi";
import { getSafeRedirect } from "@/lib/authRedirect";

export const metadata = { title: "Create account" };

export default async function RegisterPage({ searchParams }) {
  const { role, next } = await searchParams;
  const initialRole = role === "freelancer" || role === "client" ? role : null;
  const stats = await serverGet("/stats/public", { revalidate: 60 });

  return (
    <GuestOnly redirectTo={getSafeRedirect(next)}>
      <div className="flex flex-col w-full">
        <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
          <div className="flex items-center gap-space-sm mb-space-md">
            <span className="inline-flex items-center gap-space-xs px-2.5 py-1 bg-surface-container text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider border border-outline-variant">
              <span className="w-2 h-2 bg-primary" />
              JOIN THE TECHNICAL MARKETPLACE
            </span>
            <span className="font-code-sm text-code-sm text-on-surface-variant">/ PROTOCOL REGISTRATION v2.4</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            <RegisterForm initialRole={initialRole} />
            <RegisterSidebar stats={stats} />
          </div>

          <RegisterRibbon />
        </div>
      </div>
    </GuestOnly>
  );
}