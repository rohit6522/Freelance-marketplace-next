export const NAV_LINKS = {
  guest: [{ label: "Explore Gigs", href: "/gigs" }],
  client: [
    { label: "Explore Gigs", href: "/gigs" },
    { label: "My Orders", href: "/orders" },
    { label: "Messages", href: "/messages" },
    { label: "Saved Gigs", href: "/dashboard/saved" },
  ],
  freelancer: [
    { label: "Explore Gigs", href: "/gigs" },
    { label: "My Orders", href: "/orders" },
    { label: "Messages", href: "/messages" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

export const getNavLinks = (user) => (user ? NAV_LINKS[user.role] ?? NAV_LINKS.guest : NAV_LINKS.guest);

export const isActivePath = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

// Footer ke static columns (Categories column database se aata hai)
export const FOOTER_COLUMNS = [
  {
    title: "About",
    links: ["Platform Overview", "Engineering Careers", "Press & Media", "Partnership Network"],
  },
  {
    title: "Support",
    links: ["Help Center", "Escrow Dispute Desk", "Contract Standards", "Contact Support"],
  },
  {
    title: "Trust & Safety",
    links: ["Verified Badging", "Milestone Protection", "Code Auditing", "Community Guidelines"],
  },
  {
    title: "Terms & Law",
    links: ["Terms of Service", "Privacy Policy", "Escrow Agreement", "Cookie Preferences"],
  },
];