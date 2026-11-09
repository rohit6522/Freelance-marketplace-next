import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import FavoriteButton from "@/components/gigs/FavoriteButton";
import GigGallery from "@/components/gigs/detail/GigGallery";
import PackageTable from "@/components/gigs/detail/PackageTable";
import BuyBox from "@/components/gigs/detail/BuyBox";
import ContactButton from "@/components/gigs/detail/ContactButton";
import GigReviews from "@/components/gigs/detail/GigReviews";
import FaqAccordion from "@/components/gigs/detail/FaqAccordion";
import { PackageProvider } from "@/components/gigs/detail/PackageContext";
import { serverRequest } from "@/lib/serverApi";
import { SELLER_TIER_LABELS } from "@/lib/constants";
import { formatMonthYear } from "@/lib/utils";

// generateMetadata aur page dono ko ek hi request lagti hai
const loadGig = cache((slug) => serverRequest(`/gigs/${encodeURIComponent(slug)}`, { withCookies: true }));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data } = await loadGig(slug);
  if (!data) return { title: "Gig not found" };
  return { title: data.gig.title, description: data.gig.description?.slice(0, 160) || undefined };
}

export default async function GigDetailPage({ params }) {
  const { slug } = await params;
  const { status, data } = await loadGig(slug);

  if (status === 404) notFound();
  if (!data) throw new Error("We could not load this gig right now. Please try again in a moment.");

  const { gig, seller } = data;
  const owner = gig.freelancer;
  const profile = seller?.profile ?? null;
  const stats = seller?.stats ?? null;
  const tier = profile?.sellerTier;
  const tierLabel = tier ? SELLER_TIER_LABELS[tier] : null;
  const firstName = owner.name.split(" ")[0];

  const reviewsRes = await serverRequest(`/reviews?gig=${gig._id}&limit=5`, { revalidate: 0 });

  const paragraphs = (gig.description || "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const deliverables = gig.deliverables ?? [];
  const languages = (profile?.languages ?? []).map((l) => `${l.name} (${l.level})`).join(", ");

  const whyStats = [
    {
      value: profile?.experienceYears ? `${profile.experienceYears}+ YRS` : "NEW",
      label: "Professional Experience",
      text: "Years of experience listed on the seller's profile.",
    },
    {
      value: stats?.onTimeDeliveryRate != null ? `${stats.onTimeDeliveryRate}%` : "N/A",
      label: "On-Time Delivery",
      text: "Share of delivered orders handed over by the due date.",
    },
    {
      value: stats?.jobSuccessRate != null ? `${stats.jobSuccessRate}%` : "N/A",
      label: "Job Success",
      text: "Completed orders as a share of completed plus cancelled orders.",
    },
  ];

  const sellerRows = [
    ["Location", profile?.location || owner.country || "Not listed"],
    ["Member Since", formatMonthYear(owner.createdAt) || "Not listed"],
    ["Experience", profile?.experienceYears ? `${profile.experienceYears} years` : "Not listed"],
    ["Languages", languages || "Not listed"],
  ];

  return (
    <div className="flex flex-col w-full">
      {gig.status !== "published" && (
        <div className="w-full bg-error-container text-on-error-container">
          <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-sm font-label-md text-label-md">
            This gig is {gig.status}. Only you can see this page.
          </div>
        </div>
      )}

      {/* Breadcrumb ribbon */}
      <div className="w-full bg-surface-container-low py-space-xs">
        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin flex items-center justify-between">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-space-xs font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant overflow-x-auto py-1"
          >
            <Link className="hover:text-primary transition-colors whitespace-nowrap" href="/gigs">
              Home
            </Link>
            <span className="text-outline-variant font-bold">/</span>
            {gig.category && (
              <>
                <Link
                  className="hover:text-primary transition-colors whitespace-nowrap"
                  href={`/gigs?category=${gig.category.slug}`}
                >
                  {gig.category.name}
                </Link>
                <span className="text-outline-variant font-bold">/</span>
              </>
            )}
            <span className="text-on-surface font-bold whitespace-nowrap">Gig #{gig.slug.split("-").pop().toUpperCase()}</span>
          </nav>
          <div className="hidden md:flex items-center gap-space-md font-code-sm text-code-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-1 bg-surface-container-highest px-space-xs py-0.5 font-bold uppercase tracking-tight text-on-surface">
              STATUS: {gig.status}
            </span>
            <span className="bg-primary text-on-primary px-space-xs py-0.5 uppercase font-bold text-label-sm">
              DEMO ESCROW
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg w-full">
        {/* Header */}
        <header className="mb-space-lg">
          <div className="flex flex-wrap items-center gap-space-sm mb-space-xs">
            {tierLabel && (
              <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2 py-0.5 uppercase tracking-wider font-bold">
                {tierLabel} Seller
              </span>
            )}
            {gig.category && (
              <span className="bg-surface-container-high text-on-surface font-label-sm text-label-sm px-2 py-0.5 uppercase font-bold">
                {gig.category.name}
              </span>
            )}
          </div>

          <h1 className="font-headline-xl text-headline-xl text-on-surface uppercase tracking-tight leading-none mb-space-md">
            {gig.title}
          </h1>

          <div className="bg-surface-container-lowest p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-sm">
            <div className="flex flex-wrap items-center gap-space-md">
              <div className="relative w-12 h-12 bg-surface-container">
                <Avatar user={owner} size="w-12 h-12" shape="square" />
                {profile?.availability === "available" && (
                  <span title="Available for new work" className="absolute bottom-0 right-0 w-3 h-3 bg-primary" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-space-xs">
                  <Link
                    href={`/freelancers/${owner._id}`}
                    className="font-headline-sm text-headline-sm text-on-surface font-bold hover:text-primary"
                  >
                    {owner.name}
                  </Link>
                  {tierLabel && (
                    <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-1.5 py-0.5 uppercase font-bold">
                      {tierLabel}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  {gig.ratingCount > 0 ? (
                    <div className="flex items-center text-on-surface font-bold">
                      <Icon name="star" filled className="text-body-sm text-primary mr-1" />
                      {gig.ratingAverage.toFixed(1)}
                      <span className="font-normal text-on-surface-variant ml-1">
                        ({gig.ratingCount} {gig.ratingCount === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  ) : (
                    <span className="text-on-surface font-bold">New gig</span>
                  )}
                  <span>•</span>
                  <span className="text-primary font-bold">{stats?.completedOrders ?? 0} orders completed</span>
                  {stats?.jobSuccessRate != null && (
                    <>
                      <span>•</span>
                      <span>{stats.jobSuccessRate}% job success</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-sm w-full sm:w-auto">
              <FavoriteButton gigId={gig._id} variant="detail" />
              <ContactButton gigId={gig._id} sellerId={owner._id} label="Contact Seller" variant="primary" />
            </div>
          </div>
        </header>

        <PackageProvider packages={gig.packages} gigId={gig._id} sellerId={owner._id}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Left column */}
            <section className="lg:col-span-8 flex flex-col gap-space-xl">
              <GigGallery images={gig.images ?? []} title={gig.title} />

              <article className="bg-surface-container-lowest p-space-xl shadow-sm">
                <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-md">
                  MODULE 02 // TECHNICAL STATEMENT &amp; SCOPE
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase mb-space-md tracking-tight">
                  About This Gig
                </h2>
                <div className="space-y-space-md font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {paragraphs.length > 0 ? (
                    paragraphs.map((text, i) => (
                      <p key={i} className="whitespace-pre-line">
                        {text}
                      </p>
                    ))
                  ) : (
                    <p>The seller has not added a description yet.</p>
                  )}
                </div>

                {deliverables.length > 0 && (
                  <div className="mt-space-xl bg-surface-container-low p-space-lg">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase font-bold mb-space-md flex items-center gap-2">
                      <Icon name="check_box" filled className="text-primary text-headline-sm" />
                      What You Will Receive
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-space-md font-body-sm text-body-sm text-on-surface">
                      {deliverables.map((item, index) => (
                        <li
                          key={item.title}
                          className={`flex items-start gap-space-sm bg-surface-container-lowest p-space-md ${
                            deliverables.length % 2 === 1 && index === deliverables.length - 1 ? "md:col-span-2" : ""
                          }`}
                        >
                          <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm shrink-0">
                            ✓
                          </span>
                          <div>
                            <strong className="font-bold text-on-surface block uppercase">{item.title}</strong>
                            {item.description}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-space-lg">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface uppercase font-bold mb-space-md">
                    Why Work With Me
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                    {whyStats.map((item) => (
                      <div key={item.label} className="bg-surface-container p-space-md">
                        <div className="font-headline-lg text-headline-lg font-bold text-primary mb-1">{item.value}</div>
                        <div className="font-label-sm text-label-sm uppercase font-bold text-on-surface">{item.label}</div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <PackageTable />

              <GigReviews gigId={gig._id} sellerName={owner.name} initial={reviewsRes.data} />

              {(gig.faqs ?? []).length > 0 && (
                <section className="bg-surface-container-lowest p-space-xl shadow-sm">
                  <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-xs inline-block">
                    MODULE 05 // FREQUENT INQUIRIES
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight mb-space-lg">
                    Frequently Asked Questions
                  </h2>
                  <FaqAccordion items={gig.faqs} />
                </section>
              )}
            </section>

            {/* Right sticky sidebar */}
            <aside className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-24">
              <BuyBox />

              <div className="bg-surface-container-lowest p-space-lg shadow-sm">
                <div className="bg-surface-container-low px-space-md py-space-xs font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-md">
                  SELLER PROFILE
                </div>
                <div className="flex items-center gap-space-md mb-space-md">
                  <Avatar user={owner} size="w-14 h-14" shape="square" />
                  <div className="min-w-0">
                    <Link
                      href={`/freelancers/${owner._id}`}
                      className="font-headline-sm text-headline-sm text-on-surface font-bold hover:text-primary block truncate"
                    >
                      {owner.name}
                    </Link>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {profile?.title || "Freelancer"}
                    </p>
                    {tierLabel && (
                      <div className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold mt-0.5">
                        <Icon name="check_circle" className="text-body-sm" />
                        {tierLabel} Seller
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-space-xs font-body-sm text-body-sm bg-surface-container-low p-space-md mb-space-md">
                  {sellerRows.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-space-md">
                      <span className="text-on-surface-variant font-bold uppercase text-label-sm shrink-0">{label}</span>
                      <span className="text-on-surface font-bold text-right">{value}</span>
                    </div>
                  ))}
                </div>

                <ContactButton gigId={gig._id} sellerId={owner._id} label={`Contact ${firstName}`} variant="secondary" />
              </div>

              <div className="bg-surface-container-high p-space-md">
                <div className="flex items-start gap-space-sm">
                  <Icon name="shield" filled className="text-primary text-headline-md" />
                  <div>
                    <h5 className="font-headline-sm text-body-md text-on-surface font-bold uppercase">
                      GigCraft Escrow Guard
                    </h5>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-normal">
                      Your payment is held in a simulated escrow and released milestone by milestone, only after you
                      approve the work. No real money moves in this demo.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </PackageProvider>
      </div>
    </div>
  );
}