import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { cn, formatPrice } from "@/lib/utils";

export default function GigsSection({ gigs }) {
  return (
    <section className="space-y-space-md scroll-mt-36" id="section-gigs">
      <div className="flex items-center justify-between gap-space-sm border-b border-outline pb-space-xs">
        <div>
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">
            Available Direct Contracts
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Order directly with milestone-based demo escrow protection
          </p>
        </div>
        <span className="font-code-sm text-code-sm bg-primary text-on-primary px-2.5 py-1 uppercase whitespace-nowrap">
          {gigs.length} {gigs.length === 1 ? "Gig" : "Gigs"} Active
        </span>
      </div>

      {gigs.length === 0 ? (
        <div className="border border-outline bg-surface-container-lowest p-space-lg text-center">
          <Icon name="inventory_2" className="text-[32px] text-outline mb-space-xs" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">No published gigs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {gigs.map((gig) => {
            const topRated = gig.ratingCount > 0 && gig.ratingAverage >= 4.8;
            return (
              <div
                key={gig._id}
                className="bg-surface-container-lowest border border-outline flex flex-col justify-between hover:border-on-surface transition-none"
              >
                <div className="relative w-full h-44 bg-surface-container-high border-b border-outline overflow-hidden">
                  {gig.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="w-full h-full object-cover" src={gig.images[0].url} alt={gig.title} loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <Icon name="image" className="text-[32px]" />
                    </div>
                  )}
                  <span
                    className={cn(
                      "absolute top-2 left-2 font-label-sm text-[10px] px-2 py-0.5 uppercase font-bold tracking-wider",
                      topRated
                        ? "bg-on-surface text-surface"
                        : "bg-surface-container-lowest text-on-surface border border-on-surface"
                    )}
                  >
                    {topRated ? "Top Rated" : gig.category?.name}
                  </span>
                </div>

                <div className="p-space-md flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-code-sm font-code-sm text-on-surface-variant mb-1">
                      <span>
                        {gig.minDeliveryDays} {gig.minDeliveryDays === 1 ? "DAY" : "DAYS"} DELIVERY
                      </span>
                      <span className="text-primary font-bold">
                        {gig.ratingCount > 0 ? `★ ${gig.ratingAverage.toFixed(1)} (${gig.ratingCount})` : "NEW"}
                      </span>
                    </div>
                    <h3 className="font-label-md text-label-md font-bold text-on-surface uppercase leading-snug">
                      {gig.title}
                    </h3>
                    {gig.description && (
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-2">
                        {gig.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center justify-between">
                    <div>
                      <span className="font-code-sm text-[11px] block uppercase text-on-surface-variant">
                        Starting from
                      </span>
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        {formatPrice(gig.startingPrice)}
                      </span>
                    </div>
                    <Link
                      href={`/gigs/${gig.slug}`}
                      className="bg-surface-container text-on-surface border border-on-surface px-space-sm py-1.5 font-label-sm text-label-sm uppercase hover:bg-on-surface hover:text-surface transition-none"
                    >
                      Select Tier
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}