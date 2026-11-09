import Icon from "@/components/ui/Icon";
import HeroActions from "./HeroActions";
import { SELLER_TIER_LABELS } from "@/lib/constants";
import { cn, formatCompactMoney, formatMoney, getInitials } from "@/lib/utils";

const pct = (value) => (value == null ? "N/A" : `${value}%`);

export default function ProfileHero({ user, profile, stats, shortId }) {
  const tierLabel = profile.sellerTier ? SELLER_TIER_LABELS[profile.sellerTier] : null;
  const location = profile.location || user.country;
  const rated = profile.ratingCount > 0;

  const tiles = [
    {
      value: rated ? profile.ratingAverage.toFixed(1) : "—",
      label: rated ? `${profile.ratingCount} Client ${profile.ratingCount === 1 ? "Review" : "Reviews"}` : "No Reviews Yet",
      star: true,
    },
    { value: pct(stats?.jobSuccessRate), label: "Job Success Score" },
    { value: pct(stats?.onTimeDeliveryRate), label: "On-Time Delivery" },
    { value: String(stats?.completedOrders ?? 0), label: "Completed Orders" },
    { value: formatCompactMoney(stats?.totalEarned ?? 0), label: "Total Earned (Simulated)", highlight: true },
  ];

  const tileBorder = ["border-r border-b md:border-b-0 border-outline", "border-r border-b md:border-b-0 border-outline", "border-r border-b md:border-b-0 border-outline", "border-r border-outline", ""];

  return (
    <section className="w-full bg-surface-container-lowest border-b border-outline-variant">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Identity */}
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-space-lg items-start">
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-surface-container-high border-2 border-on-surface overflow-hidden flex items-center justify-center">
                {user.avatar?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="w-full h-full object-cover" src={user.avatar.url} alt={user.name} />
                ) : (
                  <span className="font-headline-xl text-headline-xl text-primary">{getInitials(user.name)}</span>
                )}
              </div>
              {tierLabel && (
                <div className="absolute -bottom-2 -right-2 bg-primary-container text-white px-2 py-0.5 font-label-sm text-label-sm border border-on-surface tracking-wider uppercase">
                  {tierLabel}
                </div>
              )}
            </div>

            <div className="flex-1 space-y-space-sm">
              <div className="flex flex-wrap items-center gap-space-xs">
                <span className="bg-surface-container text-on-surface font-label-sm text-label-sm px-2 py-0.5 border border-outline-variant uppercase">
                  ID // {shortId}
                </span>
                {tierLabel && (
                  <span className="bg-primary text-on-primary font-label-sm text-label-sm px-2.5 py-0.5 border border-primary uppercase tracking-wide flex items-center gap-1">
                    <Icon name="military_tech" className="text-[14px]" /> {tierLabel} Seller
                  </span>
                )}
                {location && (
                  <span className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm px-2 py-0.5 border border-outline-variant flex items-center gap-1">
                    <Icon name="location_on" className="text-[14px]" /> {location}
                    {profile.timezone ? ` (${profile.timezone})` : ""}
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold uppercase">
                  {user.name}
                </h1>
                {profile.title && (
                  <p className="font-headline-sm text-headline-sm text-primary font-medium mt-0.5">{profile.title}</p>
                )}
              </div>

              {profile.bio && (
                <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl pt-1 whitespace-pre-line">
                  {profile.bio}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-space-sm text-code-sm font-code-sm text-on-surface">
                {profile.weeklyHours ? (
                  <span className="border border-outline px-2 py-1 bg-surface flex items-center gap-1">
                    <Icon name="schedule" className="text-primary text-[16px]" /> {profile.weeklyHours} HRS / WEEK CAP
                  </span>
                ) : null}
                <span className="border border-outline px-2 py-1 bg-surface flex items-center gap-1">
                  <Icon name="security" className="text-tertiary text-[16px]" /> DEMO ESCROW
                </span>
                {profile.experienceYears ? (
                  <span className="border border-outline px-2 py-1 bg-surface flex items-center gap-1">
                    <Icon name="work" className="text-primary text-[16px]" /> {profile.experienceYears} YRS EXPERIENCE
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-4 w-full flex flex-col gap-space-sm bg-surface-container-low p-space-md border border-outline">
            {profile.hourlyRate > 0 && (
              <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant">
                <span className="font-label-sm text-label-sm uppercase text-on-surface-variant">Rate Indicator</span>
                <span className="font-code-sm text-code-sm font-bold text-on-surface">
                  {formatMoney(profile.hourlyRate)} / HOUR
                </span>
              </div>
            )}
            <HeroActions freelancerId={user._id} />
          </div>
        </div>

        {/* Metrics strip */}
        <div className="mt-space-lg grid grid-cols-2 md:grid-cols-5 gap-0 border border-outline bg-surface-container-lowest">
          {tiles.map((tile, index) => (
            <div
              key={tile.label}
              className={cn(
                "p-space-md flex flex-col justify-center",
                tileBorder[index],
                tile.highlight && "bg-surface-container-low"
              )}
            >
              <div className={cn("flex items-center gap-1", tile.star && "text-primary")}>
                {tile.star && <Icon name="star" filled className="text-[18px]" />}
                <span
                  className={cn(
                    "font-headline-sm text-headline-sm font-bold",
                    tile.highlight ? "text-primary" : "text-on-surface"
                  )}
                >
                  {tile.value}
                </span>
              </div>
              <span className="font-label-sm text-label-sm uppercase text-on-surface-variant mt-0.5">{tile.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}