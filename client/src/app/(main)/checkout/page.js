import { notFound, redirect } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { serverRequest } from "@/lib/serverApi";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "Checkout" };

const TIERS = ["basic", "standard", "premium"];

export default async function CheckoutPage({ searchParams }) {
  const { gig: gigId, tier } = await searchParams;

  if (typeof gigId !== "string" || !/^[a-f\d]{24}$/i.test(gigId)) notFound();

  const { status, data } = await serverRequest(`/gigs/${gigId}`, { revalidate: 0 });
  if (status === 404 || (data && data.gig.status !== "published")) notFound();
  if (!data) throw new Error("We could not load this gig right now. Please try again in a moment.");

  const { gig } = data;
  if (!TIERS.includes(tier) || !gig.packages?.[tier]) redirect(`/gigs/${gig.slug}`);

  // Client component ko sirf zaroori data bhejte hain
  const summary = {
    gigId: gig._id,
    slug: gig.slug,
    title: gig.title,
    image: gig.images?.[0]?.url ?? null,
    seller: { id: gig.freelancer._id, name: gig.freelancer.name },
    tier,
    pkg: gig.packages[tier],
  };

  return (
    <ProtectedRoute roles={[ROLES.CLIENT]}>
      <CheckoutForm summary={summary} />
    </ProtectedRoute>
  );
}