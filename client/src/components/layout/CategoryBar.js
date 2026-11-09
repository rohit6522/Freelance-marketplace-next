import { Fragment } from "react";
import Link from "next/link";

export default function CategoryBar({ categories = [] }) {
  return (
    <div className="h-11 bg-surface-container-low border-t border-outline-variant">
      <nav
        aria-label="Categories"
        className="max-w-7xl mx-auto px-margin-sm lg:px-margin h-full flex items-center overflow-x-auto no-scrollbar gap-space-md"
      >
        {categories.map((category, index) => (
          <Fragment key={category._id}>
            {index > 0 && <span className="text-outline-variant text-label-sm">/</span>}
            <Link
              href={`/gigs?category=${category.slug}`}
              className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant hover:text-primary whitespace-nowrap"
            >
              {category.name}
            </Link>
          </Fragment>
        ))}
      </nav>
    </div>
  );
}