import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OrdersWorkspace from "@/components/orders/OrdersWorkspace";

export const metadata = { title: "My orders" };

export default async function OrdersPage({ searchParams }) {
  const { id } = await searchParams;
  const initialId = typeof id === "string" && /^[a-f\d]{24}$/i.test(id) ? id : null;

  return (
    <ProtectedRoute>
      <OrdersWorkspace initialId={initialId} />
    </ProtectedRoute>
  );
}