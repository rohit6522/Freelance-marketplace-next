import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/ui/Icon";
import GigCard from "@/components/gigs/GigCard";
import SortSelect from "@/components/gigs/SortSelect";
import ActiveFilters from "@/components/gigs/ActiveFilters";
import FilterSidebar from "@/components/gigs/FilterSidebar";
import Pagination from "@/components/gigs/Pagination";
import { BrowseProvider, PendingFrame } from "@/components/gigs/BrowseContext";
import { serverRequest } from "@/lib/serverApi";
import { buildGigsHref, clearedParams, parseGigParams, toApiQuery } from "@/lib/gigParams";

export const metadata = { title: "Explore gigs" };

export default async function GigsPage({ searchParams }) {
  const params = parseGigParams(await searchParams);

  const [gigsRes, catsRes] = await Promise.all([
    serverRequest(`/gigs?${toApiQuery(params)}`, { revalidate: 0 }),
    serverRequest("/categories", { revalidate: 120 }),
  ]);

  if (!gigsRes.data) {
    return (
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
        <div className="bg-error-container border border-error p-space-xl text-center">
          <Icon name="cloud_off" className="text-[40px] text-error mb-space-sm" />
          <h1 className="font-headline-sm text-headline-sm text-on-error-container uppercase">
            Marketplace unavailable
          </h1>
          <p className="font-body-sm text-body-sm text-on-error-container mt-space-xs mb-space-md">
            We could not load gigs right now. Please try again in a moment.
          </p>
          <Link
            href="/gigs"
            className="inline-block bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-lg py-space-sm"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  const { gigs, pagination } = gigsRes.data;

  // ?page=99 jaisa URL: last valid page par bhej do
  if (pagination.total > 0 && params.page > pagination.totalPages) {
    redirect(buildGigsHref(params, { page: pagination.totalPages }));
  }

  const categories = catsRes.data?.categories ?? [];
  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.name]));
  const activeCategory = params.categories.length === 1 ? categoryNames[params.categories[0]] : null;

  const title = params.q
    ? `Results for “${params.q}”`
    : activeCategory
      ? `${activeCategory} Services`
      : "All Services";

  return (
    <BrowseProvider>
      {/* Header + breadcrumb */}
      <section className="w-full bg-surface-container-lowest border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-md">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-space-xs font-label-sm text-label-sm text-secondary uppercase tracking-wider mb-space-sm"
          >
            <Link className="hover:text-primary transition-colors" href="/gigs">
              Marketplace
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="text-on-surface font-bold">{activeCategory ?? "All Gigs"}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-xs py-0.5 mb-space-xs">
                <span className="w-1.5 h-1.5 bg-primary" />
                <span className="font-code-sm text-code-sm text-on-surface font-semibold tracking-widest uppercase">
                  Contract Catalog
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase">{title}</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Displaying <strong className="text-on-surface font-bold">{pagination.total}</strong> published{" "}
                {pagination.total === 1 ? "gig" : "gigs"}
              </p>
            </div>
            <SortSelect params={params} />
          </div>
        </div>
      </section>

      <ActiveFilters params={params} categoryNames={categoryNames} />

      <section className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-lg w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          <FilterSidebar key={JSON.stringify(params)} params={params} categories={categories} />

          <PendingFrame className="lg:col-span-9 flex flex-col">
            {/* Status strip */}
            <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant px-space-md py-space-xs mb-space-md">
              <div className="flex flex-wrap items-center gap-space-xs font-code-sm text-code-sm text-on-surface">
                <span className="w-2 h-2 bg-primary" />
                <span>
                  FEED STATUS: <strong>LIVE</strong>
                </span>
                <span className="text-outline-variant">|</span>
                <span className="text-secondary">
                  {gigs.length} OF {pagination.total} GIGS LOADED
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-space-xs font-code-sm text-code-sm text-secondary">
                <span>GRID MODE: 3-COL BRUTALIST</span>
              </div>
            </div>

            {gigs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
                {gigs.map((gig) => (
                  <GigCard key={gig._id} gig={gig} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest border border-outline-variant p-space-xl text-center">
                <Icon name="search_off" className="text-[40px] text-outline mb-space-sm" />
                <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase">
                  No gigs match your criteria
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs mb-space-md">
                  Try removing a filter or searching for something broader.
                </p>
                <Link
                  href={buildGigsHref(clearedParams(params))}
                  className="inline-block bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-lg py-space-sm border border-primary hover:bg-primary-container transition-colors"
                >
                  Clear all filters
                </Link>
              </div>
            )}

            {/* Escrow banner */}
            <div className="mt-space-lg bg-surface-container-high border border-on-surface p-space-md flex flex-col md:flex-row items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <Icon name="verified_user" className="text-[28px]" />
                </div>
                <div>
                  <h4 className="font-headline-sm text-headline-sm uppercase text-on-surface">
                    Milestone-Backed Demo Escrow
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Order payments are held in a simulated escrow and released milestone by milestone after you approve
                    the work.
                  </p>
                </div>
              </div>
              <Link
                href="/info/escrow-agreement"
                className="shrink-0 bg-on-surface text-surface-container-lowest font-label-md text-label-md py-2 px-space-md uppercase font-bold tracking-wider hover:bg-primary transition-colors"
              >
                Read Escrow Terms
              </Link>
            </div>

            {pagination.total > 0 && <Pagination params={params} pagination={pagination} />}
          </PendingFrame>
        </div>
      </section>
    </BrowseProvider>
  );
}