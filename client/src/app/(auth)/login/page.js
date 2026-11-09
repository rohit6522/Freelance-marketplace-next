import GuestOnly from "@/components/auth/GuestOnly";
import LoginForm from "@/components/auth/LoginForm";
import { LoginStatusStrip, LoginAside, LoginTrustRail } from "@/components/auth/LoginPanels";
import { serverGet } from "@/lib/serverApi";
import { getSafeRedirect } from "@/lib/authRedirect";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }) {
  const { next } = await searchParams;
  const stats = await serverGet("/stats/public", { revalidate: 60 });

  return (
    <GuestOnly redirectTo={getSafeRedirect(next)}>
      <div className="flex flex-col w-full">
        <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
          <LoginStatusStrip />
          <div className="grid grid-cols-1 lg:grid-cols-12 border border-outline-variant bg-surface-container-lowest">
            <LoginForm />
            <LoginAside stats={stats} />
          </div>
          <LoginTrustRail />
        </div>
      </div>
    </GuestOnly>
  );
}