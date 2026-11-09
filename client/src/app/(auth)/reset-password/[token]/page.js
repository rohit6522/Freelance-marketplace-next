import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ params }) {
  const { token } = await params;

  return (
    <div className="w-full max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
      <div className="max-w-xl mx-auto">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}