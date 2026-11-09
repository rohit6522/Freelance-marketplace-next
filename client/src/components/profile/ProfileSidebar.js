import Icon from "@/components/ui/Icon";
import { LANGUAGE_LEVEL_LABELS, SELLER_TIER_LABELS } from "@/lib/constants";
import { cn, formatMonthYear } from "@/lib/utils";

const chip = "font-code-sm text-code-sm bg-surface-container px-2 py-0.5 border border-outline-variant";

function Panel({ icon, iconClass, title, aside, children }) {
  return (
    <div className="bg-surface-container-lowest border border-outline p-space-md">
      <div className="flex items-center justify-between border-b border-outline pb-space-sm mb-space-md">
        <h2 className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider flex items-center gap-1.5">
          <Icon name={icon} className={cn("text-[18px]", iconClass)} />
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </div>
  );
}

export default function ProfileSidebar({ user, profile, stats, gigs, platformRating }) {
  const skills = profile.skills ?? [];
  const accreditations = profile.accreditations ?? [];
  const languages = profile.languages ?? [];
  const tierLabel = profile.sellerTier ? SELLER_TIER_LABELS[profile.sellerTier] : "Rising Talent";
  const firstName = user.name.split(" ")[0];

  // Jo skill seller ke published gig tags me hai, uska border gehra
  const usedInGigs = new Set(gigs.flatMap((g) => g.tags ?? []).map((t) => t.toLowerCase()));

  const showBenchmark = profile.ratingCount > 0 && platformRating > 0;

  return (
    <aside className="lg:col-span-4 space-y-space-lg">
      {/* Trust & reputation */}
      <Panel
        icon="verified_user"
        iconClass="text-primary"
        title="Trust & Reputation"
        aside={<span className={chip}>{stats?.completedOrders ?? 0} COMPLETED</span>}
      >
        <ul className="space-y-space-sm text-body-sm font-body-sm">
          {[
            { icon: "check_circle", label: "Account Status", value: "ACTIVE", solid: true },
            { icon: "calendar_month", label: "Member Since", value: formatMonthYear(user.memberSince).toUpperCase() },
            { icon: "military_tech", label: "Seller Tier", value: tierLabel.toUpperCase() },
            { icon: "account_balance", label: "Escrow", value: "DEMO / SIMULATED" },
          ].map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-space-sm p-space-xs bg-surface-container-low border border-outline-variant"
            >
              <span className="flex items-center gap-2 text-on-surface">
                <Icon name={row.icon} className="text-primary text-[18px]" />
                {row.label}
              </span>
              <span
                className={cn(
                  "font-label-sm text-label-sm px-2 py-0.5 uppercase whitespace-nowrap",
                  row.solid
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface border border-outline-variant"
                )}
              >
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Skills */}
      {skills.length > 0 && (
        <Panel
          icon="military_tech"
          iconClass="text-tertiary"
          title="Skill Matrix"
          aside={<span className="font-code-sm text-code-sm text-on-surface-variant">{skills.length} LISTED</span>}
        >
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <div
                key={skill}
                className={cn(
                  "flex items-center border bg-surface-container-lowest text-on-surface font-code-sm text-code-sm px-2.5 py-1",
                  usedInGigs.has(skill.toLowerCase()) ? "border-on-surface" : "border-outline"
                )}
              >
                {skill}
              </div>
            ))}
          </div>
          <p className="font-code-sm text-[11px] text-on-surface-variant mt-space-sm">
            Dark border = skill used in a published gig.
          </p>

          {showBenchmark && (
            <div className="mt-space-md pt-space-sm border-t border-outline-variant bg-surface-container-low p-2">
              <span className="font-code-sm text-code-sm text-on-surface-variant block uppercase">Rating Benchmark:</span>
              <div className="w-full bg-surface-container h-2 mt-1 border border-outline-variant">
                <div className="bg-primary h-full" style={{ width: `${Math.min(100, (profile.ratingAverage / 5) * 100)}%` }} />
              </div>
              <div className="flex justify-between font-code-sm text-[11px] text-on-surface mt-1">
                <span>Platform Average: {platformRating.toFixed(1)}</span>
                <span className="font-bold text-primary">
                  {firstName}: {profile.ratingAverage.toFixed(1)} Rating
                </span>
              </div>
            </div>
          )}
        </Panel>
      )}

      {/* Accreditations */}
      {accreditations.length > 0 && (
        <Panel
          icon="workspace_premium"
          iconClass="text-on-surface"
          title="Accreditations"
          aside={<span className="font-code-sm text-code-sm text-on-surface-variant">LISTED</span>}
        >
          <div className="space-y-space-sm font-body-sm text-body-sm">
            {accreditations.map((item) => (
              <div key={item._id ?? item.name} className="border border-outline-variant p-space-xs bg-surface">
                <div className="flex items-start justify-between gap-space-sm">
                  <span className="font-label-sm text-label-sm text-on-surface font-bold uppercase">
                    {item.issuer || item.name}
                  </span>
                  {item.year && (
                    <span className="font-code-sm text-[11px] bg-surface-container px-1.5 border border-outline-variant">
                      {item.year}
                    </span>
                  )}
                </div>
                {item.issuer && <p className="text-on-surface-variant text-[13px] mt-0.5">{item.name}</p>}
                {item.credentialId && (
                  <div className="mt-1 font-code-sm text-[11px] text-primary flex items-center gap-1">
                    <Icon name="badge" className="text-[13px]" /> Credential ID: {item.credentialId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <Panel
          icon="translate"
          iconClass="text-on-surface"
          title="Languages"
          aside={<span className="font-code-sm text-code-sm text-on-surface-variant">{languages.length} LISTED</span>}
        >
          <div className="divide-y divide-outline-variant font-body-sm text-body-sm">
            {languages.map((language) => (
              <div key={language.name} className="py-2 flex items-center justify-between">
                <span className="font-medium text-on-surface">{language.name}</span>
                <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 border border-outline-variant uppercase">
                  {LANGUAGE_LEVEL_LABELS[language.level] ?? language.level}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </aside>
  );
}