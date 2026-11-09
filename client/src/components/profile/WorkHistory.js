import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const period = (entry) => {
  if (entry.current) return `${entry.startYear} — PRESENT`;
  if (entry.endYear) return `${entry.startYear} — ${entry.endYear}`;
  return String(entry.startYear);
};

export default function WorkHistory({ entries = [], experienceYears }) {
  // Current role pehle, phir naye se purana
  const sorted = [...entries].sort(
    (a, b) => Number(Boolean(b.current)) - Number(Boolean(a.current)) || b.startYear - a.startYear
  );

  return (
    <section className="space-y-space-md scroll-mt-36" id="section-history">
      <div className="flex items-center justify-between gap-space-sm border-b border-outline pb-space-xs">
        <div>
          <h2 className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">
            Work History & Career Trajectory
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Career background listed by the seller</p>
        </div>
        {experienceYears > 0 && (
          <span className="font-code-sm text-code-sm bg-surface-container px-2 py-0.5 border border-outline-variant whitespace-nowrap">
            {experienceYears}+ YEARS EXPERIENCE
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="border border-outline bg-surface-container-lowest p-space-lg text-center">
          <Icon name="work_history" className="text-[32px] text-outline mb-space-xs" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">No work history added yet.</p>
        </div>
      ) : (
        <div className="border border-outline bg-surface-container-lowest divide-y divide-outline">
          {sorted.map((entry) => (
            <div key={entry._id ?? `${entry.company}-${entry.startYear}`} className="p-space-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold uppercase">{entry.title}</h3>
                  <span
                    className={cn(
                      "font-label-sm text-label-sm uppercase font-bold",
                      entry.current ? "text-primary" : "text-on-surface"
                    )}
                  >
                    {entry.company}
                    {entry.location ? ` // ${entry.location}` : ""}
                  </span>
                </div>
                <span
                  className={cn(
                    "font-code-sm text-code-sm px-2 py-1 border border-outline-variant whitespace-nowrap",
                    entry.current ? "bg-surface-container-high font-bold" : "bg-surface-container"
                  )}
                >
                  {period(entry)}
                </span>
              </div>
              {entry.description && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">{entry.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}