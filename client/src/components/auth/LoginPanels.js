import Icon from "@/components/ui/Icon";
import { formatMoney } from "@/lib/utils";

const DASH = "—";

const clip = (text = "", max = 220) =>
  text.length > max ? `${text.slice(0, max - 3).trimEnd()}...` : text;

export function LoginStatusStrip() {
  return (
    <div className="flex flex-wrap items-center justify-between border-b border-outline-variant pb-space-sm mb-space-lg gap-space-sm">
      <div className="flex items-center gap-space-sm">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-surface-container text-primary font-code-sm text-code-sm font-semibold border border-outline-variant">
          <span className="w-2 h-2 bg-primary" />
          AUTH-GATEWAY // SECURE
        </span>
        <span className="font-code-sm text-code-sm text-on-surface-variant hidden sm:inline">
          SESSION: JWT / HTTPONLY COOKIE
        </span>
      </div>
      <div className="flex items-center gap-space-md text-on-surface-variant font-code-sm text-code-sm">
        <span className="flex items-center gap-1">
          <Icon name="verified_user" className="text-base text-primary" />
          BCRYPT HASHING
        </span>
        <span className="hidden md:inline text-outline-variant">|</span>
        <span className="hidden md:flex items-center gap-1">
          <Icon name="lock" className="text-base text-primary" />
          DEMO ESCROW (SIMULATED)
        </span>
      </div>
    </div>
  );
}

export function LoginAside({ stats }) {
  const escrow = stats?.escrow;
  const market = stats?.marketplace;
  const review = stats?.testimonial;
  const percent = Math.min(100, Math.max(0, escrow?.releasedPercent ?? 0));

  return (
    <div className="lg:col-span-5 bg-surface-container-low p-space-md sm:p-space-lg lg:p-space-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-outline-variant pb-space-sm mb-space-lg">
          <span className="font-code-sm text-code-sm uppercase tracking-wider text-on-surface-variant font-semibold">
            PLATFORM LEDGER &amp; METRICS
          </span>
          <span className="px-2 py-0.5 bg-primary text-on-primary font-code-sm text-code-sm">LIVE DATA</span>
        </div>

        {/* Escrow */}
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md mb-space-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-code-sm text-code-sm uppercase text-on-surface-variant">
                Active Escrow (Simulated)
              </span>
              <div className="font-headline-lg text-headline-lg text-on-surface font-bold mt-1 tracking-tight">
                {escrow ? formatMoney(escrow.held) : DASH}
              </div>
            </div>
            <div className="p-2 bg-surface-container text-primary border border-outline-variant">
              <Icon name="account_balance" className="text-2xl" />
            </div>
          </div>
          <div className="mt-space-md pt-space-sm border-t border-outline-variant">
            <div className="flex justify-between font-code-sm text-code-sm text-on-surface-variant mb-1.5">
              <span>Disbursement Allocation</span>
              <span className="font-semibold text-on-surface">{escrow ? `${percent}% Released` : DASH}</span>
            </div>
            <div className="w-full h-2 bg-surface-container border border-outline-variant">
              <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        {/* Supply */}
        <div className="bg-surface-container-lowest border border-outline-variant p-space-md mb-space-md">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-code-sm text-code-sm uppercase text-on-surface-variant">Marketplace Supply</span>
              <div className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                {market ? `${market.freelancers} Active Freelancers` : DASH}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container text-primary font-label-sm text-label-sm font-semibold border border-outline-variant">
              <Icon name="check_circle" className="text-xs" />
              CLIENT RATED
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
            {market
              ? `${market.gigs} published gigs across ${market.categories} categories, ranked by real client ratings and completed orders.`
              : "Gigs are ranked by real client ratings and completed orders."}
          </p>
        </div>

        {/* Testimonial */}
        {review ? (
          <div className="bg-surface-container-lowest border border-outline-variant p-space-md">
            <div className="flex items-center gap-1 text-primary mb-space-sm">
              {Array.from({ length: 5 }, (_, i) => (
                <Icon key={i} name="star" filled className="text-sm" />
              ))}
              <span className="font-code-sm text-code-sm text-on-surface-variant ml-1 font-semibold">
                VERIFIED BUYER
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface italic leading-relaxed">
              &quot;{clip(review.comment)}&quot;
            </p>
            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center justify-between gap-space-sm">
              <div className="min-w-0">
                <div className="font-label-md text-label-md text-on-surface font-semibold truncate">
                  {review.client.name}
                </div>
                <div className="font-code-sm text-code-sm text-on-surface-variant truncate">
                  {review.client.companyName || review.client.country || "GigCraft client"}
                </div>
              </div>
              <span className="px-2 py-0.5 bg-surface-container font-code-sm text-code-sm text-primary border border-outline-variant whitespace-nowrap">
                {review.clientOrders} {review.clientOrders === 1 ? "order" : "orders"} completed
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant p-space-md">
            <p className="font-code-sm text-code-sm uppercase text-on-surface-variant mb-space-xs">No reviews yet</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Client reviews appear here after the first completed order is rated.
            </p>
          </div>
        )}
      </div>

      {/* Security stack */}
      <div className="mt-space-lg pt-space-md border-t border-outline-variant space-y-2">
        <div className="flex items-center justify-between font-code-sm text-code-sm">
          <span className="text-on-surface-variant">Password Hashing</span>
          <span className="text-primary font-bold">BCRYPT (COST 12)</span>
        </div>
        <div className="flex items-center justify-between font-code-sm text-code-sm">
          <span className="text-on-surface-variant">Session Token</span>
          <span className="text-primary font-bold">JWT / HTTPONLY COOKIE</span>
        </div>
        <div className="flex items-center justify-between font-code-sm text-code-sm">
          <span className="text-on-surface-variant">Escrow Release</span>
          <span className="text-on-surface font-bold">ON CLIENT APPROVAL (SIMULATED)</span>
        </div>
      </div>
    </div>
  );
}

const RAIL = [
  {
    icon: "verified",
    title: "Secure Authentication",
    text: "Passwords are hashed with bcrypt and sessions use httpOnly JWT cookies that scripts cannot read.",
  },
  {
    icon: "account_balance_wallet",
    title: "Milestone Escrow (Demo)",
    text: "Order funds are held in a simulated escrow and released milestone by milestone after client approval. No real money moves.",
  },
  {
    icon: "enhanced_encryption",
    title: "Protected Access",
    text: "Role-based access, rate-limited sign-in and validated input protect every account and order.",
  },
];

export function LoginTrustRail() {
  return (
    <div className="mt-space-lg grid grid-cols-1 md:grid-cols-3 gap-space-md">
      {RAIL.map((item) => (
        <div
          key={item.title}
          className="flex items-start gap-space-sm p-space-md bg-surface-container-lowest border border-outline-variant"
        >
          <Icon name={item.icon} className="text-primary text-2xl" />
          <div>
            <div className="font-label-md text-label-md text-on-surface font-semibold">{item.title}</div>
            <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{item.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}