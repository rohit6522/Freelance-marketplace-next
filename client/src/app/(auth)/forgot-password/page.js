import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <div className="max-w-xl mx-auto">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}