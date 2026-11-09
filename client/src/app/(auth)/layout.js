import AuthHeader from "@/components/layout/AuthHeader";
import AuthFooter from "@/components/layout/AuthFooter";

export default function AuthLayout({ children }) {
  return (
    <>
      <AuthHeader />
      <main className="w-full pt-16 bg-background min-h-screen">{children}</main>
      <AuthFooter />
    </>
  );
}