import Icon from "@/components/ui/Icon";
import Sparkline from "@/components/common/Sparkline";
import { SELLER_TIER_LABELS } from "@/lib/constants";
import { formatCompactMoney, getInitials, shortName } from "@/lib/utils";

const DASH = "—";

const clip = (text = "", max = 160) =>
  text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;

const GUARANTEES = [
  {
    icon: "verified_user",
    title: "Milestone Escrow (Demo)",
    text: "Order funds are held in a simulated escrow and released milestone by milestone. No real money moves.",
  },
  {
    icon: "work",
    title: "Public Portfolio & Case Studies",
    text: "Showcase your work with metrics and deliverables on a public profile ranked by real client ratings.",
  },
  {
    icon: "payments",
    title: "No Platform Fee",
    text: "No commission or subscription in this marketplace. You pay only for the packages you order.",
  },
];

export function RegisterSidebar({ stats }) {
  const market = stats?.marketplace;
  const escrow = stats?.escrow;
  const months = stats?.completedByMonth ?? [];
  const spot = stats?.spotlight;

  return (
    <div className="lg:col-span-4 space-y-space-md">
      {/* Guarantees */}
      <div className="bg-surface-container-lowest border border-outline-variant p-space-md shadow-[2px_2px_0px_#0b1c30]">
        <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant mb-space-sm">
          <span className="font-label-sm text-label-sm uppercase text-on-surface font-bold tracking-wider">
            Protocol Guarantee
          </span>
          <span className="font-code-sm text-code-sm bg-primary-fixed text-on-primary-fixed px-1.5 py-0.5 border border-primary">
            ACTIVE
          </span>
        </div>
        <div className="space-y-space-sm">
          {GUARANTEES.map((item) => (
            <div key={item.title} className="flex items-start gap-space-sm">
              <div className="w-7 h-7 bg-surface-container flex items-center justify-center flex-shrink-0 border border-outline-variant">
                <Icon name={item.icon} className="text-base text-primary" />
              </div>
              <div>
                <h4 className="font-label-md text-label-md text-on-surface">{item.title}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry */}
      <div className="bg-surface-container-low border border-outline-variant p-space-md">
        <div className="font-label-sm text-label-sm uppercase text-on-surface-variant mb-space-sm">
          Current Network Telemetry
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container-lowest border border-outline-variant p-2.5">
            <span className="font-code-sm text-code-sm text-on-surface-variant block">PUBLISHED GIGS</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold block mt-0.5">
              {market ? market.gigs : DASH}
            </span>
            <span className="font-code-sm text-[10px] text-primary block mt-0.5">
              {market ? `ACROSS ${market.categories} CATEGORIES` : ""}
            </span>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant p-2.5">
            <span className="font-code-sm text-code-sm text-on-surface-variant block">ESCROW VOLUME</span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold block mt-0.5">
              {escrow ? formatCompactMoney(escrow.volume) : DASH}
            </span>
            <span className="font-code-sm text-[10px] text-on-surface-variant block mt-0.5">SIMULATED</span>
          </div>
        </div>

        <div className="mt-space-sm bg-surface-container-lowest border border-outline-variant p-2.5">
          <div className="flex justify-between items-center mb-1">
            <span className="font-label-sm text-label-sm text-on-surface">Orders Completed</span>
            <span className="font-code-sm text-code-sm text-primary font-bold">
              {market ? market.completedOrders : DASH}
            </span>
          </div>
          <div className="w-full h-10 flex items-end">
            <Sparkline values={months.map((m) => m.count)} />
          </div>
          <div className="flex justify-between font-code-sm text-[9px] text-on-surface-variant mt-1 border-t border-outline-variant pt-1">
            {months.map((m, i) => (
              <span key={`${m.label}-${i}`}>{m.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Spotlight */}
      {spot ? (
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-12 h-12 bg-surface-container-high border border-outline flex items-center justify-center font-headline-sm text-on-surface font-bold">
              {getInitials(spot.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-label-md text-label-md text-on-surface truncate">{shortName(spot.name)}</span>
                <span className="px-1.5 py-px bg-primary-fixed text-on-primary-fixed font-code-sm text-[10px] border border-primary uppercase whitespace-nowrap">
                  {SELLER_TIER_LABELS[spot.sellerTier] ?? "Seller"}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {spot.title || "Freelancer"}
              </p>
            </div>
          </div>
          <div className="mt-space-sm pt-space-xs border-t border-outline-variant">
            {spot.quote && (
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                “{clip(spot.quote)}”
              </p>
            )}
            <div className="mt-2 flex items-center justify-between text-on-surface-variant font-code-sm text-code-sm">
              <span>{spot.completedOrders} COMPLETED ORDERS</span>
              <span className="text-primary font-bold">★ {spot.ratingAverage.toFixed(1)} RATING</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md">
          <p className="font-code-sm text-code-sm uppercase text-on-surface-variant mb-space-xs">Top rated seller</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            The first seller to complete a rated order will be featured here.
          </p>
        </div>
      )}
    </div>
  );
}

const RIBBON = [
  {
    icon: "gavel",
    title: "Milestone Escrow (Demo)",
    text: "Funds are held per order and released as milestones are completed and approved. Payments are simulated.",
  },
  {
    icon: "security",
    title: "Secure Accounts",
    text: "Passwords are hashed with bcrypt, sessions use httpOnly JWT cookies, and sign-in is rate limited.",
  },
  {
    icon: "verified",
    title: "Rated Talent",
    text: "Seller tiers are earned from real completed orders and client ratings, never bought.",
  },
];

export function RegisterRibbon() {
  return (
    <div className="mt-space-xl bg-surface-container-low border border-outline-variant p-space-md lg:p-space-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {RIBBON.map((item) => (
          <div key={item.title} className="flex items-start gap-space-sm">
            <div className="p-2 bg-surface-container-lowest border border-outline-variant text-primary flex-shrink-0">
              <Icon name={item.icon} className="text-xl" />
            </div>
            <div>
              <h5 className="font-label-md text-label-md text-on-surface uppercase tracking-wide">{item.title}</h5>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}