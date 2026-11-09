import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { buildGigsHref, getPageItems } from "@/lib/gigParams";
import { cn } from "@/lib/utils";

const cellBase = "px-3.5 py-2 font-code-sm text-code-sm border-r border-on-surface";

export default function Pagination({ params, pagination }) {
  const { page, totalPages, total } = pagination;
  const hrefFor = (p) => buildGigsHref(params, { page: p });

  return (
    <nav
      aria-label="Pagination"
      className="mt-space-lg pt-space-md border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-space-md"
    >
      <div className="font-code-sm text-code-sm text-secondary uppercase font-semibold">
        PAGE <span className="text-on-surface font-bold">{page}</span> OF{" "}
        <span className="text-on-surface font-bold">{totalPages}</span> ({total} {total === 1 ? "ENTRY" : "ENTRIES"})
      </div>

      {totalPages > 1 && (
        <div className="flex items-center border border-on-surface bg-surface-container-lowest">
          {page > 1 ? (
            <Link
              href={hrefFor(page - 1)}
              aria-label="Previous page"
              className="px-3 py-2 border-r border-on-surface text-on-surface hover:bg-surface-container-high transition-colors flex items-center"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="px-3 py-2 border-r border-on-surface text-outline bg-surface-container-low cursor-not-allowed flex items-center"
            >
              <Icon name="chevron_left" className="text-[18px]" />
            </span>
          )}

          {getPageItems(page, totalPages).map((item, index) =>
            item === "gap" ? (
              <span
                key={`gap-${index}`}
                className="px-3 py-2 font-code-sm text-code-sm text-secondary border-r border-on-surface bg-surface-container-low select-none"
              >
                ...
              </span>
            ) : (
              <Link
                key={item}
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  cellBase,
                  item === page
                    ? "font-bold bg-primary text-on-primary"
                    : "font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                )}
              >
                {item}
              </Link>
            )
          )}

          {page < totalPages ? (
            <Link
              href={hrefFor(page + 1)}
              aria-label="Next page"
              className="px-3 py-2 text-on-surface hover:bg-surface-container-high transition-colors flex items-center"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="px-3 py-2 text-outline bg-surface-container-low cursor-not-allowed flex items-center"
            >
              <Icon name="chevron_right" className="text-[18px]" />
            </span>
          )}
        </div>
      )}
    </nav>
  );
}