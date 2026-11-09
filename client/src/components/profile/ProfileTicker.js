import { AVAILABILITY_LABELS } from "@/lib/constants";

export default function ProfileTicker({ shortId, profile }) {
  const status = AVAILABILITY_LABELS[profile.availability] ?? AVAILABILITY_LABELS.available;

  return (
    <div className="w-full bg-inverse-surface text-inverse-on-surface px-margin-sm lg:px-margin py-2 flex flex-wrap items-center justify-between gap-space-sm text-code-sm font-code-sm border-b border-inverse-surface">
      <div className="flex items-center gap-space-md">
        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider">
          <span className="w-2 h-2 bg-primary-fixed" /> FREELANCER ID: {shortId}
        </span>
        <span className="text-surface-dim hidden md:inline">/</span>
        <span className="hidden md:inline text-inverse-on-surface uppercase">STATUS: {status}</span>
      </div>
      <div className="flex items-center gap-space-lg text-code-sm font-code-sm">
        {profile.weeklyHours ? (
          <span>
            WEEKLY CAP: <strong className="text-white">{profile.weeklyHours} HRS</strong>
          </span>
        ) : null}
        {profile.timezone ? (
          <span>
            TIMEZONE: <strong className="text-white">{profile.timezone}</strong>
          </span>
        ) : null}
      </div>
    </div>
  );
}