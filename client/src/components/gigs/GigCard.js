import Link from "next/link";
import Icon from "@/components/ui/Icon";
import Avatar from "@/components/ui/Avatar";
import FavoriteButton from "./FavoriteButton";
import { SellerTierPill } from "./SellerTier";
import { formatPrice } from "@/lib/utils";

export default function GigCard({ gig }) {
  const image = gig.images?.[0]?.url;
  const seller = gig.freelancer;
  const days = gig.minDeliveryDays;
  const rated = gig.ratingCount > 0;
  const href = `/gigs/${gig.slug}`;

  return (
    <article className="bg-surface-container-lowest border border-outline-variant hover:border-on-surface hover:shadow-[3px_3px_0px_#0b1c30] transition-all flex flex-col justify-between group">
      <div>
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-surface-container-high overflow-hidden border-b border-outline-variant">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="w-full h-full object-cover" src={image} alt={gig.title} loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-outline">
              <Icon name="image" className="text-[40px]" />
            </div>
          )}
          <SellerTierPill tier={gig.seller?.tier} />
          <FavoriteButton gigId={gig._id} variant="card" />
          {days > 0 && (
            <div className="absolute bottom-2 left-2 bg-surface-container-lowest border border-on-surface px-1.5 py-0.5 flex items-center gap-1">
              <Icon name={days <= 2 ? "bolt" : "schedule"} className="text-[14px] text-primary" />
              <span className="font-code-sm text-code-sm text-on-surface font-semibold uppercase">
                {days === 1 ? "24h Express" : `${days}-Day Delivery`}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-space-md">
          <div className="flex items-center justify-between mb-space-xs">
            <div className="flex items-center gap-space-xs min-w-0">
              <Avatar user={seller} size="w-7 h-7" shape="square" />
              <Link
                href={`/freelancers/${seller?._id}`}
                className="font-label-md text-label-md text-on-surface font-bold hover:text-primary truncate"
              >
                {seller?.name}
              </Link>
            </div>
            {rated ? (
              <div className="flex items-center gap-0.5 text-on-surface font-code-sm text-code-sm">
                <Icon name="star" filled className="text-[15px] text-tertiary" />
                <span className="font-bold">{gig.ratingAverage.toFixed(1)}</span>
                <span className="text-secondary">({gig.ratingCount})</span>
              </div>
            ) : (
              <span className="font-code-sm text-code-sm text-secondary uppercase">New</span>
            )}
          </div>

          <h3 className="font-headline-sm text-[1.125rem] leading-snug text-on-surface font-bold group-hover:text-primary transition-colors line-clamp-2 mb-space-sm">
            <Link href={href}>{gig.title}</Link>
          </h3>

          <div className="flex flex-wrap gap-1 mb-space-md">
            {(gig.tags ?? []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="font-code-sm text-code-sm bg-surface-container px-1.5 py-0.5 text-on-surface border border-outline-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-space-md pt-0">
        <div className="border-t border-outline-variant pt-space-sm flex items-center justify-between">
          <div>
            <span className="block font-code-sm text-[11px] text-secondary uppercase font-semibold">Starting At</span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold leading-tight">
              {formatPrice(gig.startingPrice)}
            </span>
          </div>
          <Link
            href={href}
            className="bg-primary text-on-primary font-label-sm text-label-sm uppercase font-bold px-space-md py-2 border border-primary hover:bg-primary-container transition-colors"
          >
            Inspect Spec
          </Link>
        </div>
      </div>
    </article>
  );
}