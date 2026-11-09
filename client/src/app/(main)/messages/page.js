import ProtectedRoute from "@/components/auth/ProtectedRoute";
import MessagesWorkspace from "@/components/messages/MessagesWorkspace";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }) {
  const { c } = await searchParams;
  const initialId = typeof c === "string" && /^[a-f\d]{24}$/i.test(c) ? c : null;

  return (
    <ProtectedRoute>
      <MessagesWorkspace initialId={initialId} />
    </ProtectedRoute>
  );
}