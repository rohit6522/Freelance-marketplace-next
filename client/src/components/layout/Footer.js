import Link from "next/link";
import { FOOTER_COLUMNS } from "@/lib/navigation";

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface mb-space-md">{title}</h4>
      <ul className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="hover:text-primary transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ categories = [] }) {
  const year = new Date().getFullYear();

  const categoryLinks = categories.slice(0, 4).map((c) => ({
    label: c.name,
    href: `/gigs?category=${c.slug}`,
  }));

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant mt-space-xl">
      <div className="max-w-7xl mx-auto px-margin-sm lg:px-margin py-space-xl">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-space-lg mb-space-xl">
          <FooterColumn title="Categories" links={categoryLinks} />
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links.map((label) => ({ label, href: "#" }))}
            />
          ))}
        </div>

        <div className="border-t border-outline-variant pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-primary font-bold uppercase">GigCraft</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              © {year} GigCraft Marketplace Inc. All rights reserved.
            </span>
          </div>
          <div className="font-code-sm text-code-sm text-on-surface-variant">
            ENGINEERED FOR HIGH-OUTPUT TECHNICAL CONTRACTS
          </div>
        </div>
      </div>
    </footer>
  );
}